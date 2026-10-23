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

type ReaderTheme = "light" | "dark" | "parchment";
type ReaderMode = "flipbook" | "document";

function resolveBookSource(rawUrl: string) {
  // Archive.org matches (embed, download, or details)
  const iaMatch = rawUrl.match(/archive\.org\/(?:embed|download|details)\/([^/?#]+)/i);
  if (iaMatch && iaMatch[1]) {
    const iaId = iaMatch[1];
    return {
      isArchiveEmbed: true,
      embedUrl: `https://archive.org/embed/${iaId}`,
      downloadUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
    };
  }

  // Google Books preview
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
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.15);
  const [loading, setLoading] = useState<boolean>(!resolvedInfo.isArchiveEmbed);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  const pdfDocRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document via PDF.js if not an embedded reader
  useEffect(() => {
    if (resolvedInfo.isArchiveEmbed) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

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
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("PDF.js canvas direct parse error:", err);
        setError("Cross-origin stream limited; switching to document reader");
        // Automatically fallback to document view mode
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

  // Render Page onto Canvas in flipbook mode
  useEffect(() => {
    if (mode !== "flipbook" || !pdfDocRef.current || !canvasRef.current || loading) return;

    let isCurrent = true;
    setRenderingPage(true);

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    pdfDocRef.current
      .getPage(currentPage)
      .then((page: any) => {
        if (!isCurrent || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Calculate appropriate viewport for screen size & scale
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const containerWidth = Math.min(window.innerWidth * 0.78, 800);
        const autoScale = containerWidth / unscaledViewport.width;
        const finalScale = scale * (autoScale > 0.4 ? autoScale : 1.0);

        const viewport = page.getViewport({ scale: finalScale });

        // High-DPI screen support
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        renderTask.promise
          .then(() => {
            if (isCurrent) setRenderingPage(false);
          })
          .catch((err: any) => {
            if (err?.name !== "RenderingCancelledException") {
              console.warn("Render page error:", err);
            }
            if (isCurrent) setRenderingPage(false);
          });
      })
      .catch((err: any) => {
        console.warn("Get page error:", err);
        if (isCurrent) setRenderingPage(false);
      });

    return () => {
      isCurrent = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [currentPage, scale, loading, mode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      } else if (e.key === "+" || e.key === "=") {
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [numPages, currentPage, onClose]);

  const nextPage = () => {
    if (currentPage >= numPages || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.min(numPages, p + 1));
      setIsFlipping(false);
    }, 180);
  };

  const prevPage = () => {
    if (currentPage <= 1 || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.max(1, p - 1));
      setIsFlipping(false);
    }, 180);
  };

  const zoomIn = () => setScale((s) => Math.min(2.0, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.7, s - 0.15));
  const resetZoom = () => setScale(1.0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Centered Modal Container (Does not rigidly cover full screen) */}
      <div
        className={`relative w-full ${
          isFullscreen
            ? "h-screen max-w-none rounded-none border-0"
            : "max-w-5xl h-[92vh] max-h-[920px] rounded-3xl border border-border/80 shadow-2xl"
        } bg-card text-card-foreground overflow-hidden flex flex-col transition-all duration-300`}
      >
        {/* Header Bar with High-Contrast Visible Controls */}
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border/70 bg-card/95 backdrop-blur-md z-20 shadow-xs flex-shrink-0">
          {/* Title & Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-sm sm:text-base text-foreground truncate max-w-xs sm:max-w-md">
                {bookTitle}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {numPages > 0 && mode === "flipbook" ? (
                  <>
                    <span className="font-semibold text-foreground">
                      Page {currentPage} of {numPages}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-500 font-medium">3D FlipBook Active</span>
                  </>
                ) : (
                  <span className="font-medium text-foreground/80">Digital Edition Reader</span>
                )}
              </div>
            </div>
          </div>

          {/* Center Mode Switcher (FlipBook vs Document) */}
          <div className="flex items-center gap-1 bg-muted/80 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setMode("flipbook")}
              disabled={numPages === 0 && loading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "flipbook"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>3D FlipBook</span>
            </button>
            <button
              onClick={() => setMode("document")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === "document"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document View</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Reading Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setTheme((t) => (t === "parchment" ? "dark" : t === "dark" ? "light" : "parchment"))
              }
              className="h-8 px-2.5 rounded-xl border-border/70 bg-card hover:bg-muted text-foreground text-xs gap-1.5 shadow-xs"
              title={`Switch reading paper theme (Current: ${theme})`}
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : theme === "parchment" ? (
                <>
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="hidden sm:inline">Parchment</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </Button>

            {/* Zoom Controls (FlipBook Mode) */}
            {mode === "flipbook" && (
              <div className="hidden sm:flex items-center gap-1 border border-border/70 rounded-xl p-0.5 bg-card shadow-xs">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={zoomOut}
                  disabled={scale <= 0.7}
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
                  disabled={scale >= 2.0}
                  className="h-7 w-7 rounded-lg text-foreground hover:bg-muted"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {/* Open in New Tab */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(resolvedInfo.embedUrl, "_blank")}
              className="h-8 w-8 rounded-xl border-border/70 bg-card hover:bg-muted text-foreground shadow-xs"
              title="Open reader in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>

            {/* Download */}
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-8 w-8 rounded-xl border-border/70 bg-card hover:bg-muted text-foreground shadow-xs"
              title="Download book file"
            >
              <a href={resolvedInfo.downloadUrl} download={`${bookTitle}.pdf`} target="_blank" rel="noreferrer">
                <Download className="w-4 h-4" />
              </a>
            </Button>

            {/* Fullscreen Expand / Restore */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 rounded-xl border-border/70 bg-card hover:bg-muted text-foreground hidden sm:flex shadow-xs"
              title={isFullscreen ? "Restore Window" : "Expand Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            {/* Close Modal */}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-xl border-border/70 bg-muted/80 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors text-foreground shadow-xs"
              title="Close Reader (Esc)"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Reading Surface */}
        <main
          className={`flex-1 relative overflow-auto flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-300 ${
            theme === "parchment"
              ? "bg-[#f5eedb] dark:bg-[#1a1712]"
              : theme === "dark"
              ? "bg-[#0b0e17]"
              : "bg-slate-100 dark:bg-zinc-900"
          }`}
        >
          {/* VIEW MODE 1: Native Document Embed / Archive.org BookReader */}
          {mode === "document" ? (
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/60 bg-card">
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
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Unfolding book pages with high-fidelity canvas rendering...
              </p>
            </div>
          ) : (
            /* VIEW MODE 2: 3D FlipBook Canvas Engine */
            <div className="relative flex flex-col items-center justify-center max-w-full my-auto">
              {/* The Physical Book Binding */}
              <div
                className={`relative rounded-2xl shadow-2xl border p-3 sm:p-5 flex flex-col items-center transition-all duration-300 ${
                  isFlipping ? "scale-[0.985] opacity-90 shadow-lg" : "scale-100 opacity-100"
                } ${
                  theme === "parchment"
                    ? "bg-[#ead2a8] border-[#cbb389] shadow-[#382414]/30"
                    : theme === "dark"
                    ? "bg-[#161c2a] border-border/80 shadow-black/80"
                    : "bg-white border-border shadow-slate-300"
                }`}
              >
                {/* Book Spine Texture Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none rounded-l-2xl" />

                {/* Paper Surface with Canvas */}
                <div
                  className={`relative rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center ${
                    theme === "parchment"
                      ? "bg-[#fcf7ee]"
                      : theme === "dark"
                      ? "bg-[#0c0f18]"
                      : "bg-white"
                  }`}
                  style={{ minHeight: "420px" }}
                >
                  {renderingPage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-10">
                      <Loader2 className="w-7 h-7 animate-spin text-primary" />
                    </div>
                  )}

                  <canvas
                    ref={canvasRef}
                    className={`max-w-full block transition-opacity duration-200 ${
                      renderingPage ? "opacity-70" : "opacity-100"
                    }`}
                  />

                  {/* Bottom Spine Ribbon */}
                  <div
                    className={`w-full h-8 px-4 flex items-center justify-between text-[11px] border-t font-serif ${
                      theme === "parchment"
                        ? "border-[#d8c5a2]/60 text-[#694b2a]"
                        : "border-border/40 text-muted-foreground"
                    }`}
                  >
                    <span>Page {currentPage} of {numPages}</span>
                    <span className="italic truncate max-w-xs">{bookTitle}</span>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="hover:underline flex items-center gap-1 font-sans font-medium"
                    >
                      <RotateCcw className="w-3 h-3" /> Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Floating High-Contrast Centered Navigation Toolbar (FlipBook Mode) */}
          {mode === "flipbook" && numPages > 0 && (
            <div className="mt-4 z-30 flex items-center gap-2 bg-card/95 border border-border/80 shadow-2xl rounded-full px-4 py-2 backdrop-blur-md">
              <Button
                variant="default"
                size="sm"
                onClick={prevPage}
                disabled={currentPage <= 1 || isFlipping}
                className="rounded-full h-9 px-4 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-md disabled:opacity-40 hover:bg-primary/90"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Page</span>
              </Button>

              <div className="px-3 py-1 rounded-full bg-muted border border-border/60 text-xs font-bold text-foreground">
                {currentPage} / {numPages}
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={nextPage}
                disabled={currentPage >= numPages || isFlipping}
                className="rounded-full h-9 px-4 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-md disabled:opacity-40 hover:bg-primary/90"
              >
                <span>Next Page</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
