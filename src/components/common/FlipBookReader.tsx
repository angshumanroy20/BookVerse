import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  RotateCcw,
  Sun,
  Moon,
  ExternalLink,
  Loader2,
  Layers,
  FileText,
  Sparkles,
  BookMarked,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// Configure PDF.js worker locally from Vite bundle
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface FlipBookReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

type ReaderTheme = "parchment" | "dark" | "light";
type ReaderMode = "flipbook" | "document";

// Lightweight synthesized paper turn sound
function playPaperTurnSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const duration = 0.12;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Audio autoplay or permission restriction
  }
}

function resolveBookSource(rawUrl: string) {
  const iaMatch = rawUrl.match(/archive\.org\/(?:embed|download|details)\/([^/?#]+)/i);
  if (iaMatch && iaMatch[1]) {
    const iaId = iaMatch[1];
    return {
      isArchiveEmbed: true,
      embedUrl: `https://archive.org/embed/${iaId}`,
      downloadUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
    };
  }

  const googleMatch = rawUrl.match(/books\.google\.[a-z.]+\/books\?id=([^&]+)/i);
  if (googleMatch && googleMatch[1]) {
    return {
      isArchiveEmbed: true,
      embedUrl: `https://books.google.com/books?id=${googleMatch[1]}&lpg=PP1&pg=PP1&output=embed`,
      downloadUrl: rawUrl,
    };
  }

  return {
    isArchiveEmbed: false,
    embedUrl: rawUrl,
    downloadUrl: rawUrl,
  };
}

export default function FlipBookReader({ pdfUrl, bookTitle, onClose }: FlipBookReaderProps) {
  const resolvedInfo = resolveBookSource(pdfUrl);
  const [theme, setTheme] = useState<ReaderTheme>("parchment");
  const [mode, setMode] = useState<ReaderMode>(resolvedInfo.isArchiveEmbed ? "document" : "flipbook");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSpread, setIsSpread] = useState(window.innerWidth >= 1024);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpPage, setJumpPage] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(!resolvedInfo.isArchiveEmbed);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev" | null>(null);

  const pdfDocRef = useRef<any>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTasksRef = useRef<{ left?: any; right?: any }>({});

  // Auto-adapt spread on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900 && isSpread) {
        setIsSpread(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSpread]);

  // Load PDF Document via PDF.js if not an embedded viewer
  useEffect(() => {
    if (resolvedInfo.isArchiveEmbed) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const loadingTask = pdfjsLib.getDocument({
      url: resolvedInfo.embedUrl,
      cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((pdf) => {
        if (!isMounted) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setJumpPage("1");
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("PDF.js direct parse limited, falling back to document reader:", err);
        setMode("document");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [resolvedInfo.embedUrl, resolvedInfo.isArchiveEmbed]);

  // Keep jump input synchronized with current page
  useEffect(() => {
    setJumpPage(currentPage.toString());
  }, [currentPage]);

  // Render Page to a specific Canvas
  const renderPageToCanvas = async (
    pageNumber: number,
    canvas: HTMLCanvasElement | null,
    taskKey: "left" | "right"
  ) => {
    if (!pdfDocRef.current || !canvas || pageNumber < 1 || pageNumber > numPages) return;

    if (renderTasksRef.current[taskKey]) {
      renderTasksRef.current[taskKey].cancel();
      renderTasksRef.current[taskKey] = null;
    }

    try {
      const page = await pdfDocRef.current.getPage(pageNumber);
      const context = canvas.getContext("2d");
      if (!context) return;

      const unscaledViewport = page.getViewport({ scale: 1.0 });
      // Calculate target page size
      const maxPageWidth = isSpread ? Math.min(window.innerWidth * 0.42, 540) : Math.min(window.innerWidth * 0.72, 750);
      const baseScale = (maxPageWidth / unscaledViewport.width) * scale;
      const viewport = page.getViewport({ scale: baseScale });

      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const renderTask = page.render({
        canvasContext: context,
        viewport: viewport,
      });

      renderTasksRef.current[taskKey] = renderTask;
      await renderTask.promise;
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.warn("Page render error:", err);
      }
    }
  };

  // Re-render canvases when page, scale, or spread mode changes
  useEffect(() => {
    if (mode !== "flipbook" || !pdfDocRef.current || loading) return;

    setRenderingPage(true);

    const renderPromises: Promise<any>[] = [];

    if (isSpread) {
      // In two-page spread:
      // When currentPage > 1: Left page is currentPage - 1, Right page is currentPage
      if (currentPage > 1) {
        renderPromises.push(renderPageToCanvas(currentPage - 1, leftCanvasRef.current, "left"));
      }
      renderPromises.push(renderPageToCanvas(currentPage, rightCanvasRef.current, "right"));
    } else {
      // Single page view:
      renderPromises.push(renderPageToCanvas(currentPage, rightCanvasRef.current, "right"));
    }

    Promise.all(renderPromises).finally(() => {
      setRenderingPage(false);
    });

    return () => {
      if (renderTasksRef.current.left) renderTasksRef.current.left.cancel();
      if (renderTasksRef.current.right) renderTasksRef.current.right.cancel();
    };
  }, [currentPage, scale, isSpread, mode, loading, numPages]);

  // Page Turning Controls
  const nextPage = () => {
    if (currentPage >= numPages || flipDirection) return;
    playPaperTurnSound();
    setFlipDirection("next");
    setTimeout(() => {
      const step = isSpread ? 2 : 1;
      setCurrentPage((p) => Math.min(numPages, p + step));
      setFlipDirection(null);
    }, 280);
  };

  const prevPage = () => {
    if (currentPage <= 1 || flipDirection) return;
    playPaperTurnSound();
    setFlipDirection("prev");
    setTimeout(() => {
      const step = isSpread ? 2 : 1;
      setCurrentPage((p) => Math.max(1, p - step));
      setFlipDirection(null);
    }, 280);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > numPages) return;
    playPaperTurnSound();
    setCurrentPage(page);
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpPage, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= numPages) {
      goToPage(parsed);
    } else {
      setJumpPage(currentPage.toString());
    }
  };

  const zoomIn = () => setScale((s) => Math.min(1.8, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.65, s - 0.15));
  const resetZoom = () => setScale(1.0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        nextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        prevPage();
      } else if (e.key === "Home") {
        goToPage(1);
      } else if (e.key === "End") {
        goToPage(numPages);
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages, currentPage, onClose, flipDirection]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Container */}
      <div
        className={`relative w-full ${
          isFullscreen
            ? "h-screen max-w-none rounded-none border-0"
            : "max-w-6xl h-[94vh] max-h-[960px] rounded-3xl border border-border/80 shadow-2xl"
        } bg-card text-card-foreground overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Sleek, Single-Line Header Bar (No wrapping clutter) */}
        <header className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 border-b border-border/80 bg-card/95 backdrop-blur-md z-30 shadow-xs flex-shrink-0">
          {/* Left: Book Meta & Title */}
          <div className="flex items-center gap-2.5 min-w-0 max-w-[28%] sm:max-w-[35%]">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary flex-shrink-0 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-xs sm:text-sm text-foreground truncate" title={bookTitle}>
                {bookTitle}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground truncate">
                {numPages > 0 ? (
                  <>
                    <span className="font-medium text-foreground">
                      Page {currentPage} of {numPages}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-semibold">
                      {mode === "flipbook" ? (isSpread ? "Two-Page Spread" : "Single Page") : "Digital Edition"}
                    </span>
                  </>
                ) : (
                  <span>Loading Edition...</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Mode Switcher (FlipBook vs Document) */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border/70 flex-shrink-0">
            <button
              onClick={() => setMode("flipbook")}
              disabled={numPages === 0 && loading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "flipbook"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">3D FlipBook</span>
            </button>
            <button
              onClick={() => setMode("document")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "document"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Document View</span>
            </button>
          </div>

          {/* Right: Actions & Tools */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Spread / Single View Switch (FlipBook Mode) */}
            {mode === "flipbook" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSpread(!isSpread)}
                className="hidden md:flex h-8 px-2.5 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground text-xs gap-1.5 shadow-xs"
                title={isSpread ? "Switch to Single Page Focus" : "Switch to Open Book Spread"}
              >
                <BookMarked className="w-3.5 h-3.5 text-primary" />
                <span>{isSpread ? "Spread" : "Single"}</span>
              </Button>
            )}

            {/* Reading Paper Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setTheme((t) => (t === "parchment" ? "dark" : t === "dark" ? "light" : "parchment"))
              }
              className="h-8 px-2.5 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground text-xs gap-1.5 shadow-xs"
              title={`Switch reading theme (Current: ${theme})`}
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Obsidian</span>
                </>
              ) : theme === "parchment" ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Parchment</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Studio</span>
                </>
              )}
            </Button>

            {/* Zoom Controls (FlipBook Mode) */}
            {mode === "flipbook" && (
              <div className="hidden lg:flex items-center gap-1 border border-border/80 rounded-xl p-0.5 bg-card shadow-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  disabled={scale <= 0.65}
                  className="h-7 w-7 rounded-lg text-foreground hover:bg-muted"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </Button>
                <button
                  onClick={resetZoom}
                  className="px-2 text-[11px] font-bold text-foreground hover:text-primary"
                  title="Reset Zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomIn}
                  disabled={scale >= 1.8}
                  className="h-7 w-7 rounded-lg text-foreground hover:bg-muted"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Open in New Window */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(resolvedInfo.embedUrl, "_blank")}
              className="h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground shadow-xs"
              title="Open book in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground shadow-xs"
              title="Download PDF"
            >
              <a href={resolvedInfo.downloadUrl} download={`${bookTitle}.pdf`} target="_blank" rel="noreferrer">
                <Download className="w-3.5 h-3.5" />
              </a>
            </Button>

            {/* Fullscreen Expand */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground shadow-xs"
              title={isFullscreen ? "Restore Window" : "Expand Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </Button>

            {/* Close Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-foreground shadow-xs"
              title="Close Reader (Esc)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Reading Canvas Area */}
        <main
          className={`flex-1 relative overflow-auto flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-300 ${
            theme === "parchment"
              ? "bg-[#ece2cb] dark:bg-[#13110d]"
              : theme === "dark"
              ? "bg-[#0a0d16]"
              : "bg-slate-200/80 dark:bg-zinc-900"
          }`}
        >
          {/* VIEW MODE 1: Native Document Embed / Archive.org BookReader */}
          {mode === "document" ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/80 bg-card">
              <iframe
                src={resolvedInfo.embedUrl}
                className="w-full h-full border-0"
                title={bookTitle}
                allowFullScreen
              />
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-card border border-border/80 shadow-lg flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Synthesizing physical book pages with canvas physics...
              </p>
            </div>
          ) : (
            /* VIEW MODE 2: Realistic 3D Open Book */
            <div className="relative flex flex-col items-center justify-center max-w-full my-auto select-none">
              {/* Perspective Casing */}
              <div
                className={`relative rounded-2xl p-2.5 sm:p-4 transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_40px_rgba(0,0,0,0.2)] ${
                  theme === "parchment"
                    ? "bg-[#2c1d11] border border-[#4a3422]"
                    : theme === "dark"
                    ? "bg-[#111728] border border-border/80"
                    : "bg-[#1e293b] border border-slate-700"
                }`}
              >
                {/* 3D Stacked Edge Illusion (Left Bulk of Pages) */}
                <div
                  className={`absolute left-0 top-3 bottom-3 w-2.5 rounded-l-md pointer-events-none ${
                    theme === "parchment"
                      ? "bg-[#e5d8be] border-l-2 border-[#caa979] shadow-inner"
                      : "bg-[#252f44] border-l-2 border-slate-600"
                  }`}
                />

                {/* 3D Stacked Edge Illusion (Right Remaining Pages) */}
                <div
                  className={`absolute right-0 top-3 bottom-3 w-2.5 rounded-r-md pointer-events-none ${
                    theme === "parchment"
                      ? "bg-[#e5d8be] border-r-2 border-[#caa979] shadow-inner"
                      : "bg-[#252f44] border-r-2 border-slate-600"
                  }`}
                />

                {/* Open Book Spread Container */}
                <div
                  className={`relative flex items-center rounded-xl overflow-hidden shadow-2xl ${
                    theme === "parchment"
                      ? "bg-[#fcf8ef]"
                      : theme === "dark"
                      ? "bg-[#0b0e17]"
                      : "bg-white"
                  }`}
                >
                  {/* Silk Bookmark Ribbon Draped from Center Spine */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-14 bg-gradient-to-b from-rose-800 to-rose-700 shadow-md z-30 pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 h-3 bg-inherit [clip-path:polygon(0_0,100%_0,50%_100%)]" />
                  </div>

                  {/* LEFT PAGE (Spread Mode) */}
                  {isSpread && (
                    <div
                      onClick={prevPage}
                      className={`relative flex flex-col items-center justify-center p-3 border-r cursor-pointer group transition-transform duration-300 ${
                        theme === "parchment"
                          ? "border-[#d8c7a6] bg-[#fbf6ea]"
                          : theme === "dark"
                          ? "border-border/40 bg-[#0d111d]"
                          : "border-slate-200 bg-slate-50/70"
                      }`}
                      style={{
                        transform: "perspective(1200px) rotateY(1.5deg)",
                        transformOrigin: "right center",
                        minWidth: "300px",
                        minHeight: "420px",
                      }}
                      title="Click to turn to previous page"
                    >
                      {/* Left Page Shadow / Spine Crease */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/20 via-black/5 to-transparent pointer-events-none z-10" />

                      {currentPage === 1 ? (
                        /* Title Plate on Page 1 Spread */
                        <div className="flex flex-col items-center justify-center p-6 text-center max-w-xs space-y-4 my-auto select-none">
                          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <BookOpen className="w-7 h-7" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground block mb-1">
                              BookVerse Digital Edition
                            </span>
                            <h3 className="font-display font-bold text-base sm:text-lg text-foreground leading-snug">
                              {bookTitle}
                            </h3>
                          </div>
                          <div className="w-16 h-0.5 bg-border/80 my-2" />
                          <p className="text-xs text-muted-foreground italic">
                            Turn page forward or use arrow keys to begin reading.
                          </p>
                        </div>
                      ) : (
                        <canvas
                          ref={leftCanvasRef}
                          className="max-w-full block shadow-xs transition-opacity duration-200"
                        />
                      )}

                      {/* Left Page Number Footer */}
                      <div className="w-full mt-2 pt-1 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{currentPage > 1 ? `Page ${currentPage - 1}` : "Cover"}</span>
                        <span className="font-serif italic truncate max-w-[140px]">{bookTitle}</span>
                      </div>
                    </div>
                  )}

                  {/* Deep 3D Spine Crease / Valley */}
                  <div className="w-2.5 self-stretch bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none z-20" />

                  {/* RIGHT PAGE (Active Reading Page) */}
                  <div
                    onClick={nextPage}
                    className={`relative flex flex-col items-center justify-center p-3 cursor-pointer group transition-transform duration-300 ${
                      flipDirection === "next"
                        ? "scale-[0.985] opacity-80"
                        : "scale-100 opacity-100"
                    } ${
                      theme === "parchment"
                        ? "bg-[#fcf8ef]"
                        : theme === "dark"
                        ? "bg-[#0b0e17]"
                        : "bg-white"
                    }`}
                    style={{
                      transform: isSpread ? "perspective(1200px) rotateY(-1.5deg)" : "none",
                      transformOrigin: "left center",
                      minWidth: "300px",
                      minHeight: "420px",
                    }}
                    title="Click to turn to next page"
                  >
                    {/* Spine Shadow on Left of Right Page */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none z-10" />

                    {/* Rendering Spinner */}
                    {renderingPage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}

                    {/* Canvas Canvas */}
                    <canvas
                      ref={rightCanvasRef}
                      className={`max-w-full block shadow-xs transition-opacity duration-200 ${
                        renderingPage ? "opacity-60" : "opacity-100"
                      }`}
                    />

                    {/* Right Page Number Footer */}
                    <div className="w-full mt-2 pt-1 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-serif italic truncate max-w-[140px]">{bookTitle}</span>
                      <span className="font-semibold text-foreground">Page {currentPage} of {numPages}</span>
                    </div>

                    {/* Interactive Bottom-Right Corner Curl */}
                    <div
                      className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none overflow-hidden"
                      title="Next Page"
                    >
                      <div
                        className={`w-12 h-12 -bottom-6 -right-6 absolute rotate-45 transition-transform duration-200 group-hover:scale-125 shadow-md ${
                          theme === "parchment"
                            ? "bg-[#e5d8be] border-t border-l border-[#caa979]"
                            : "bg-slate-300 dark:bg-slate-700 border-t border-l border-border"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating High-Contrast Centered Navigation & Scrubber Bar (FlipBook Mode) */}
          {mode === "flipbook" && numPages > 0 && (
            <div className="mt-4 z-30 flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-card/95 border border-border/80 shadow-2xl rounded-2xl px-4 py-2.5 backdrop-blur-md max-w-xl w-full">
              {/* Quick Jump to First Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(1)}
                disabled={currentPage <= 1 || !!flipDirection}
                className="h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-40 shadow-xs"
                title="First Page (Home)"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>

              {/* Prev Page Button */}
              <Button
                variant="default"
                size="sm"
                onClick={prevPage}
                disabled={currentPage <= 1 || !!flipDirection}
                className="h-8 px-3 rounded-xl gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs disabled:opacity-40 hover:bg-primary/90"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </Button>

              {/* Smooth Page Scrubber Slider */}
              <div className="flex-1 min-w-[100px] flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={numPages}
                  value={currentPage}
                  onChange={(e) => goToPage(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                  title={`Scrub page (${currentPage}/${numPages})`}
                />
              </div>

              {/* Jump to Page Input Form */}
              <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onBlur={handleJumpSubmit}
                  className="w-12 h-8 text-center rounded-xl bg-muted/80 border border-border/80 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                  title="Type page number and press Enter"
                />
                <span className="text-xs font-semibold text-muted-foreground">/ {numPages}</span>
              </form>

              {/* Next Page Button */}
              <Button
                variant="default"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= numPages || !!flipDirection}
                className="h-8 px-3 rounded-xl gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs disabled:opacity-40 hover:bg-primary/90"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>

              {/* Quick Jump to Last Page */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(numPages)}
                disabled={currentPage >= numPages || !!flipDirection}
                className="h-8 w-8 rounded-xl border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-40 shadow-xs"
                title="Last Page (End)"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
