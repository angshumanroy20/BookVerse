import { useState, useEffect } from "react";
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
  FileText,
  Cloud,
  ExternalLink,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";

interface FlipBookReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

type ReaderMode = "flipbook" | "native" | "cloud";
type ThemeMode = "parchment" | "dark" | "light";

export default function FlipBookReader({ pdfUrl, bookTitle, onClose }: FlipBookReaderProps) {
  const [mode, setMode] = useState<ReaderMode>("native");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward" | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Keyboard navigation & escape listener
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
  }, [currentPage, isFlipping]);

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
    if (isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("forward");
    setTimeout(() => {
      setCurrentPage((p) => p + 1);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 400);
  };

  const prevPage = () => {
    if (currentPage <= 1 || isFlipping) return;
    setIsFlipping(true);
    setFlipDirection("backward");
    setTimeout(() => {
      setCurrentPage((p) => Math.max(1, p - 1));
      setIsFlipping(false);
      setFlipDirection(null);
    }, 400);
  };

  // Safe Google Cloud Viewer URL
  const cloudViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-300 ${
        theme === "dark"
          ? "bg-[#090a0f] text-zinc-100"
          : theme === "parchment"
          ? "bg-[#fbf7ee] text-[#3e2c1c]"
          : "bg-white text-zinc-900"
      }`}
    >
      {/* Top Floating Control Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b backdrop-blur-xl bg-background/80 border-border/40 z-20">
        {/* Book Title & Icon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
              {bookTitle}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Reader Active</span>
              <span>•</span>
              <span className="capitalize">{mode} Mode</span>
            </p>
          </div>
        </div>

        {/* Center Mode Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/40">
          <Button
            size="sm"
            variant={mode === "native" ? "default" : "ghost"}
            onClick={() => setMode("native")}
            className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            title="Clean standard browser PDF viewer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF Viewer</span>
          </Button>

          <Button
            size="sm"
            variant={mode === "flipbook" ? "default" : "ghost"}
            onClick={() => setMode("flipbook")}
            className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            title="Interactive 3D FlipBook experience"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D FlipBook</span>
          </Button>

          <Button
            size="sm"
            variant={mode === "cloud" ? "default" : "ghost"}
            onClick={() => setMode("cloud")}
            className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            title="Cloud Viewer (Fallback for all devices)"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cloud Viewer</span>
          </Button>
        </div>

        {/* Right Tools & Close */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme((t) => (t === "dark" ? "parchment" : t === "parchment" ? "light" : "dark"))
            }
            className="h-8 w-8 rounded-lg"
            title={`Current: ${theme}. Click to switch theme`}
          >
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-primary" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
          </Button>

          {/* Zoom In / Out (for flipbook) */}
          {mode === "flipbook" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                className="h-8 w-8 rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
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
            onClick={() => window.open(pdfUrl, "_blank")}
            className="h-8 w-8 rounded-lg"
            title="Open original file in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 rounded-lg"
            title="Download PDF file"
          >
            <a href={pdfUrl} download={`${bookTitle}.pdf`} target="_blank" rel="noreferrer">
              <Download className="w-4 h-4" />
            </a>
          </Button>

          {/* Fullscreen */}
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

      {/* Main Reading Canvas */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {/* MODE 1: Native High-Performance PDF Viewer */}
        {mode === "native" && (
          <div className="w-full h-full relative bg-zinc-950 flex flex-col">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title={bookTitle}
              onError={() => setLoadError(true)}
            />
            {/* Fallback bar if browser plugin blocks iframe */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-2xl flex items-center gap-3 text-xs">
              <span className="text-muted-foreground">Having trouble viewing?</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setMode("cloud")}
                className="h-6 text-xs px-2 rounded-full"
              >
                Switch to Cloud Viewer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(pdfUrl, "_blank")}
                className="h-6 text-xs px-2 rounded-full gap-1"
              >
                Open Directly <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* MODE 2: Cloud Reader (Google Docs Viewer) */}
        {mode === "cloud" && (
          <div className="w-full h-full relative bg-zinc-950 flex flex-col">
            <iframe
              src={cloudViewerUrl}
              className="w-full h-full border-0"
              title={`${bookTitle} (Cloud Viewer)`}
            />
          </div>
        )}

        {/* MODE 3: 3D FlipBook Experience */}
        {mode === "flipbook" && (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-6 overflow-auto">
            {/* Navigation buttons */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={currentPage <= 1 || isFlipping}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full shadow-2xl border-white/20 bg-background/80 hover:bg-background backdrop-blur-lg"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={isFlipping}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full shadow-2xl border-white/20 bg-background/80 hover:bg-background backdrop-blur-lg"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Book Spine & Realistic Page Container */}
            <div
              className="relative transition-transform duration-300 max-w-full"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                perspective: "2000px",
              }}
            >
              {/* Outer Book Cover Binding Effect */}
              <div
                className={`relative rounded-2xl shadow-2xl border p-2 sm:p-4 flex flex-col items-center transition-all duration-300 ${
                  theme === "parchment"
                    ? "bg-[#ebd9b4] border-[#d4be95] shadow-[#2c1d10]/40"
                    : theme === "dark"
                    ? "bg-[#141622] border-white/10 shadow-black/80"
                    : "bg-zinc-100 border-zinc-200 shadow-zinc-400/50"
                }`}
                style={{
                  width: "min(92vw, 920px)",
                  height: "min(78vh, 680px)",
                }}
              >
                {/* Book Page Surface */}
                <div
                  className={`relative w-full h-full rounded-xl overflow-hidden border shadow-inner flex flex-col ${
                    theme === "parchment"
                      ? "bg-[#fef9eb] border-[#d8c5a2]"
                      : theme === "dark"
                      ? "bg-[#0f111a] border-white/5"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {/* Embedded Page Frame */}
                  <iframe
                    key={`page-${currentPage}`}
                    src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0`}
                    className="w-full flex-1 border-0"
                    title={`Page ${currentPage}`}
                  />

                  {/* Bottom Spine Ribbon */}
                  <div
                    className={`h-9 px-4 flex items-center justify-between text-xs border-t ${
                      theme === "parchment"
                        ? "border-[#d8c5a2]/60 text-[#694b2a]"
                        : "border-border/40 text-muted-foreground"
                    }`}
                  >
                    <span>Page {currentPage}</span>
                    <span className="italic font-display">{bookTitle}</span>
                    <button
                      onClick={() => setCurrentPage(1)}
                      className="hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Cover
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating FlipBook Controls */}
            <div className="mt-4 flex items-center gap-3 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={currentPage <= 1}
                className="h-7 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs font-semibold px-2">Page {currentPage}</span>
              <Button variant="ghost" size="sm" onClick={nextPage} className="h-7 text-xs">
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
