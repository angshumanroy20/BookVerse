import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
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
} from "lucide-react";

// Configure PDF.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface FlipBookReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

type ThemeMode = "parchment" | "dark" | "light";

function resolveBookSource(rawUrl: string) {
  // Archive.org matches (embed, download, or details)
  const iaMatch = rawUrl.match(/archive\.org\/(?:embed|download|details)\/([^/?#]+)/i);
  if (iaMatch && iaMatch[1]) {
    const iaId = iaMatch[1];
    return {
      isEmbed: true,
      embedUrl: `https://archive.org/embed/${iaId}`,
      downloadUrl: `https://archive.org/download/${iaId}/${iaId}.pdf`,
    };
  }

  // Google Books preview
  const googleMatch = rawUrl.match(/books\.google\.[a-z.]+\/books\?id=([^&]+)/i);
  if (googleMatch && googleMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://books.google.com/books?id=${googleMatch[1]}&lpg=PP1&pg=PP1&output=embed`,
      downloadUrl: rawUrl,
    };
  }

  return {
    isEmbed: false,
    embedUrl: rawUrl,
    downloadUrl: rawUrl,
  };
}

export default function FlipBookReader({ pdfUrl, bookTitle, onClose }: FlipBookReaderProps) {
  const resolvedInfo = resolveBookSource(pdfUrl);
  const isEmbed = resolvedInfo.isEmbed;
  const [theme, setTheme] = useState<ThemeMode>("parchment");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(!isEmbed);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  const pdfDocRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document via PDF.js if not an embedded reader
  useEffect(() => {
    if (isEmbed) {
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
        console.warn("PDF.js canvas direct parse failed:", err);
        setError("Document requires external reader view");
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (loadingTask) {
        loadingTask.destroy().catch(() => {});
      }
    };
  }, [resolvedInfo.embedUrl, isEmbed]);

  // Render Page onto Canvas
  useEffect(() => {
    if (isEmbed || !pdfDocRef.current || !canvasRef.current || loading) return;

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
        const containerWidth = Math.min(window.innerWidth * 0.88, 850);
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
  }, [currentPage, scale, loading, isEmbed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      } else if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages, isFlipping]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const nextPage = () => {
    if (currentPage >= numPages || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.min(numPages, p + 1));
      setIsFlipping(false);
    }, 200);
  };

  const prevPage = () => {
    if (currentPage <= 1 || isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => Math.max(1, p - 1));
      setIsFlipping(false);
    }, 200);
  };

  const zoomIn = () => setScale((s) => Math.min(2.0, s + 0.15));
  const zoomOut = () => setScale((s) => Math.max(0.7, s - 0.15));
  const resetZoom = () => setScale(1.0);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#08090e] text-zinc-100"
          : theme === "parchment"
          ? "bg-[#f7f2e7] text-[#362719]"
          : "bg-white text-zinc-900"
      }`}
    >
      {/* Reader Control Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b backdrop-blur-xl bg-background/85 border-border/60 z-20 shadow-md">
        {/* Book Title & Page Count */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
              {bookTitle}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              {numPages > 0 ? (
                <>
                  <span>Page {currentPage} of {numPages}</span>
                  <span>•</span>
                  <span>Interactive FlipBook</span>
                </>
              ) : isEmbed ? (
                <span>Digital Library Edition</span>
              ) : (
                <span>Loading Pages...</span>
              )}
            </p>
          </div>
        </div>

        {/* Center Page Turner Controls (When PDF.js is active) */}
        {!isEmbed && numPages > 0 && (
          <div className="flex items-center gap-2 bg-muted/60 px-3 py-1 rounded-xl border border-border/40 text-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevPage}
              disabled={currentPage <= 1}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-4 h-4 mr-0.5" /> Prev
            </Button>
            <span className="font-semibold px-1">
              {currentPage} / {numPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= numPages}
              className="h-7 px-2"
            >
              Next <ChevronRight className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        )}

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme((t) => (t === "parchment" ? "dark" : t === "dark" ? "light" : "parchment"))
            }
            className="h-8 w-8 rounded-lg"
            title={`Reading theme: ${theme}. Click to switch.`}
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : theme === "parchment" ? (
              <Layers className="w-4 h-4 text-amber-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </Button>

          {/* Zoom Controls (for Canvas Reader) */}
          {!isEmbed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.7}
                className="h-8 w-8 rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetZoom}
                className="h-8 w-8 rounded-lg text-xs font-semibold"
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 2.0}
                className="h-8 w-8 rounded-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Open in New Window */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(resolvedInfo.downloadUrl, "_blank")}
            className="h-8 w-8 rounded-lg"
            title="Open original file in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Download Button */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 rounded-lg"
            title="Download PDF file"
          >
            <a href={resolvedInfo.downloadUrl} download={`${bookTitle}.pdf`} target="_blank" rel="noreferrer">
              <Download className="w-4 h-4" />
            </a>
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 rounded-lg hidden sm:flex"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-destructive/10"
            title="Close Reader (Esc)"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Canvas Reading Surface */}
      <main className="flex-1 relative overflow-auto flex items-center justify-center p-2 sm:p-6 select-none">
        {/* CASE A: Embedded Official Reader (Archive.org 3D BookReader / Google Books) */}
        {isEmbed ? (
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-border/40 bg-card">
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
            <p className="text-sm font-medium text-muted-foreground">
              Opening book pages with high-fidelity canvas rendering...
            </p>
          </div>
        ) : error ? (
          /* Fallback when third-party servers restrict canvas cross-origin */
          <div className="flex flex-col items-center justify-center max-w-md mx-auto p-8 rounded-3xl bg-card border border-border/80 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                External Book Reader
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This volume is hosted on a secure external server. You can read it directly in an isolated fullscreen reader window or download the original file.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
              <Button
                asChild
                className="rounded-xl flex-1 h-10 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              >
                <a href={resolvedInfo.embedUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Open Fullscreen Reader
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl flex-1 h-10 gap-2 border-border/80"
              >
                <a href={resolvedInfo.downloadUrl} download target="_blank" rel="noreferrer">
                  <Download className="w-4 h-4" />
                  Download Book
                </a>
              </Button>
            </div>
          </div>
        ) : (
          /* CASE B: True Canvas-Rendered Page-by-Page FlipBook */
          <div className="relative flex items-center justify-center max-w-full">
            {/* Previous Page Floating Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage <= 1 || isFlipping}
              className="absolute -left-3 sm:-left-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full shadow-2xl border-border/60 bg-background/90 hover:bg-background backdrop-blur-md"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            {/* Next Page Floating Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={currentPage >= numPages || isFlipping}
              className="absolute -right-3 sm:-right-12 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full shadow-2xl border-border/60 bg-background/90 hover:bg-background backdrop-blur-md"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Book Binding Frame */}
            <div
              className={`relative rounded-2xl shadow-2xl border p-2 sm:p-4 flex flex-col items-center transition-all duration-300 ${
                isFlipping ? "scale-[0.99] opacity-95" : "scale-100 opacity-100"
              } ${
                theme === "parchment"
                  ? "bg-[#ebd9b4] border-[#d4be95] shadow-[#2c1d10]/40"
                  : theme === "dark"
                  ? "bg-[#141622] border-white/10 shadow-black/90"
                  : "bg-zinc-100 border-zinc-200 shadow-zinc-300"
              }`}
            >
              {/* Paper Surface with Canvas */}
              <div
                className={`relative rounded-xl overflow-hidden shadow-inner flex flex-col items-center justify-center ${
                  theme === "parchment"
                    ? "bg-[#fbf7ee]"
                    : theme === "dark"
                    ? "bg-[#0b0d14]"
                    : "bg-white"
                }`}
                style={{
                  minHeight: "450px",
                }}
              >
                {renderingPage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-xs z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  className={`max-w-full block transition-opacity duration-200 ${
                    renderingPage ? "opacity-75" : "opacity-100"
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
                    className="hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
