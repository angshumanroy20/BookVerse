import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";

interface FlipBookReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

export default function FlipBookReader({ pdfUrl, bookTitle, onClose }: FlipBookReaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward' | null>(null);
  const [scale, setScale] = useState(1.0);
  const [numPages, setNumPages] = useState(0);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load PDF and convert to images
  useEffect(() => {
    loadPdfPages();
  }, [pdfUrl]);

  const loadPdfPages = async () => {
    try {
      // For now, we'll use the PDF directly in iframes for each page
      // In a production app, you'd use pdf.js to render pages as images
      setLoading(false);
      setNumPages(100); // Placeholder - would be determined from PDF
    } catch (error) {
      console.error("Error loading PDF:", error);
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextPage = () => {
    const increment = isMobile ? 1 : 2; // Single page on mobile, two pages on desktop
    const maxPage = isMobile ? numPages - 1 : numPages - 2;
    
    if (currentPage < maxPage && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('forward');
      setTimeout(() => {
        setCurrentPage(prev => prev + increment);
        setIsFlipping(false);
        setFlipDirection(null);
      }, isMobile ? 300 : 800); // Faster animation on mobile
    }
  };

  const previousPage = () => {
    const decrement = isMobile ? 1 : 2; // Single page on mobile, two pages on desktop
    
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setFlipDirection('backward');
      setTimeout(() => {
        setCurrentPage(prev => Math.max(0, prev - decrement));
        setIsFlipping(false);
        setFlipDirection(null);
      }, isMobile ? 300 : 800); // Faster animation on mobile
    }
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.7));

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "ArrowLeft") previousPage();
      if (e.key === "Escape" && !document.fullscreenElement) onClose();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyPress);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentPage, isFlipping]);

  const leftPageNum = currentPage + 1;
  const rightPageNum = currentPage + 2;
  const currentSinglePageNum = currentPage + 1; // For mobile single-page view

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Minimal Header Controls */}
      <div className="flex items-center justify-between px-3 md:px-6 py-2 bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-amber-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-base md:text-xl">📖</span>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base font-display font-bold text-white truncate">
              {bookTitle}
            </h2>
            <p className="text-xs text-amber-200">
              {isMobile 
                ? `Page ${currentSinglePageNum} of ${numPages}`
                : `Pages ${leftPageNum}-${rightPageNum} of ${numPages}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isMobile && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomOut}
                disabled={scale <= 0.7}
                className="text-white hover:bg-white/20 rounded-lg h-8 w-8"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={zoomIn}
                disabled={scale >= 1.5}
                className="text-white hover:bg-white/20 rounded-lg h-8 w-8"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // On mobile, download directly instead of opening in new tab
              if (isMobile) {
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${bookTitle}.pdf`;
                link.click();
              } else {
                window.open(pdfUrl, '_blank');
              }
            }}
            className="text-white hover:bg-white/20 rounded-lg h-7 w-7 md:h-8 md:w-8"
            title="Download PDF"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 rounded-lg h-8 w-8"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg h-7 w-7 md:h-8 md:w-8"
            title="Close Reader"
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>

      {/* Book Display Area with Page Flip Effect */}
      <div className="flex-1 flex items-center justify-center py-4 md:py-12 px-2 md:px-8 overflow-hidden relative book-background">
        {/* Book Texture Background - Hidden on mobile for better performance */}
        {!isMobile && (
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgba(139, 92, 46, 0.03) 0px,
                  transparent 1px,
                  transparent 2px,
                  rgba(139, 92, 46, 0.03) 3px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(139, 92, 46, 0.03) 0px,
                  transparent 1px,
                  transparent 2px,
                  rgba(139, 92, 46, 0.03) 3px
                ),
                radial-gradient(
                  ellipse at center,
                  rgba(245, 222, 179, 0.4) 0%,
                  rgba(222, 184, 135, 0.3) 50%,
                  rgba(210, 180, 140, 0.2) 100%
                )
              `,
              backgroundSize: '100% 100%, 100% 100%, 100% 100%',
            }}
          />
        )}

        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={previousPage}
          disabled={currentPage === 0 || isFlipping}
          className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 z-30 text-amber-900 hover:bg-amber-200 w-10 h-10 md:w-16 md:h-16 rounded-full disabled:opacity-30 shadow-xl"
        >
          <ChevronLeft className="w-6 h-6 md:w-10 md:h-10" />
        </Button>

        {/* MOBILE: Single Page View */}
        {isMobile ? (
          <div className="relative flex items-center justify-center w-full h-full px-12">
            {/* Single Page Container */}
            <div 
              className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{
                width: '100%',
                maxWidth: '500px',
                height: '85vh',
                maxHeight: '700px',
              }}
            >
              {/* Page Content */}
              <div className="absolute inset-0 overflow-auto">
                <iframe
                  key={`mobile-page-${currentSinglePageNum}`}
                  src={`${pdfUrl}#page=${currentSinglePageNum}&view=FitH&toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-0"
                  title={`Page ${currentSinglePageNum}`}
                  style={{
                    background: '#ffffff',
                  }}
                />
              </div>

              {/* Page Number Badge */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-amber-900/90 backdrop-blur-sm rounded-full text-sm text-amber-50 font-serif shadow-lg">
                Page {currentSinglePageNum}
              </div>
            </div>
          </div>
        ) : (
          /* DESKTOP: Two-Page Spread View */
          <div 
            className="relative flex items-center justify-center"
            style={{
              perspective: '2500px',
              perspectiveOrigin: 'center center',
              transform: `scale(${scale})`,
              transition: 'transform 0.3s ease',
            }}
          >
            {/* Book Shadow */}
            <div className="absolute -bottom-8 w-[90%] h-8 bg-black/20 blur-xl rounded-full" />

            {/* Book Pages Container */}
            <div className="relative flex" style={{ transformStyle: 'preserve-3d' }}>
              {/* Left Page (Static) */}
              <div 
                className="relative bg-amber-50 shadow-2xl"
                style={{
                  width: '450px',
                  height: '600px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Page Content with Scrollbar Hidden */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0" style={{ marginRight: '-20px', paddingRight: '20px', overflow: 'hidden' }}>
                    <iframe
                      key={`left-${leftPageNum}`}
                      src={`${pdfUrl}#page=${leftPageNum}&view=FitV&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                      className="w-full h-full border-0 no-scrollbar"
                      title={`Page ${leftPageNum}`}
                      scrolling="no"
                      style={{
                        background: 'linear-gradient(to bottom, #fffbeb, #fef3c7)',
                        overflow: 'hidden',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Left Page Shadow */}
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/10 to-transparent pointer-events-none z-10" />
              </div>

              {/* Center Spine with Page Numbers */}
              <div className="relative flex flex-col items-center justify-center" style={{ width: '40px', height: '600px' }}>
                {/* Spine */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 shadow-inner" />
                
                {/* Page Numbers in Spine Area */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                  <div className="px-2 py-1 bg-amber-950/90 backdrop-blur-sm rounded text-xs text-amber-50 font-serif shadow-lg">
                    {leftPageNum}
                  </div>
                  <div className="w-px h-8 bg-amber-700/50" />
                  <div className="px-2 py-1 bg-amber-950/90 backdrop-blur-sm rounded text-xs text-amber-50 font-serif shadow-lg">
                    {rightPageNum}
                  </div>
                </div>
              </div>

              {/* Right Page (Flipping) */}
              <div 
                className={`relative bg-amber-50 shadow-2xl ${
                  isFlipping ? 'animate-page-flip-3d' : ''
                }`}
                style={{
                  width: '450px',
                  height: '600px',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'left center',
                  animation: isFlipping 
                    ? flipDirection === 'forward' 
                      ? 'flipForward 0.8s ease-in-out' 
                      : 'flipBackward 0.8s ease-in-out'
                    : 'none',
                }}
              >
                {/* Front of Page */}
                <div 
                  className="absolute inset-0 overflow-hidden backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute inset-0" style={{ marginRight: '-20px', paddingRight: '20px', overflow: 'hidden' }}>
                    <iframe
                      key={`right-${rightPageNum}`}
                      src={`${pdfUrl}#page=${rightPageNum}&view=FitV&toolbar=0&navpanes=0&scrollbar=0&zoom=page-fit`}
                      className="w-full h-full border-0 no-scrollbar"
                      title={`Page ${rightPageNum}`}
                      scrolling="no"
                      style={{
                        background: 'linear-gradient(to bottom, #fffbeb, #fef3c7)',
                        overflow: 'hidden',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Back of Page (for flip effect) */}
                <div 
                  className="absolute inset-0 overflow-hidden backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-b from-amber-100 to-amber-50 flex items-center justify-center text-amber-400">
                    <span className="text-6xl opacity-20">📖</span>
                  </div>
                </div>

                {/* Right Page Shadow */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none backface-hidden z-10" />

                {/* Page Curl Effect */}
                {!isFlipping && (
                  <div 
                    className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, transparent 50%, rgba(245, 158, 11, 0.2) 50%)',
                      clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Book Cover Frame */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
                borderRadius: '8px',
              }}
            />
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={nextPage}
          disabled={(isMobile ? currentPage >= numPages - 1 : currentPage >= numPages - 2) || isFlipping}
          className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 z-30 text-amber-900 hover:bg-amber-200 w-10 h-10 md:w-16 md:h-16 rounded-full disabled:opacity-30 shadow-xl"
        >
          <ChevronRight className="w-6 h-6 md:w-10 md:h-10" />
        </Button>
      </div>

      {/* Minimal Footer with Navigation */}
      <div className="flex items-center justify-center gap-2 md:gap-4 px-3 md:px-6 py-2 bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-amber-900/90 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={previousPage}
          disabled={currentPage === 0 || isFlipping}
          className="text-white hover:bg-white/20 disabled:opacity-30 h-8 px-2 md:px-3 text-xs md:text-sm"
        >
          <ChevronLeft className="w-3 h-3 md:w-4 md:h-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        {!isMobile && (
          <div className="text-amber-100 text-xs">
            💡 Use ← → keys to flip pages
          </div>
        )}

        <Button
          variant="ghost"
          onClick={nextPage}
          disabled={(isMobile ? currentPage >= numPages - 1 : currentPage >= numPages - 2) || isFlipping}
          className="text-white hover:bg-white/20 disabled:opacity-30 h-8 px-2 md:px-3 text-xs md:text-sm"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
