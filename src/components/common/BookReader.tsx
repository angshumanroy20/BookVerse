import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Download, Maximize2, Minimize2 } from "lucide-react";

interface BookReaderProps {
  pdfUrl: string;
  bookTitle: string;
  onClose: () => void;
}

export default function BookReader({ pdfUrl, bookTitle, onClose }: BookReaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyPress);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 shadow-xl border-b-4 border-amber-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-2xl">📖</span>
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-white truncate max-w-md">
                {bookTitle}
              </h2>
              <p className="text-xs text-amber-200">Interactive Book Reader</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(pdfUrl, '_blank')}
            className="text-white hover:bg-white/20 rounded-xl"
            title="Download PDF"
          >
            <Download className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:bg-white/20 rounded-xl"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-xl"
            title="Close Reader"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Book Display Area with Realistic Book Effect */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400 rounded-full blur-3xl" />
        </div>

        {/* Book Container with 3D Effect */}
        <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
          <div 
            className={`relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-amber-800 transition-all duration-500 ${
              isFlipping ? 'scale-95 rotate-1' : 'scale-100'
            }`}
            style={{
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.3),
                inset 0 0 20px rgba(245, 158, 11, 0.1),
                0 0 0 1px rgba(245, 158, 11, 0.2)
              `,
            }}
          >
            {/* Book Spine Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-amber-900 via-amber-800 to-transparent opacity-20 pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-amber-900 via-amber-800 to-transparent opacity-20 pointer-events-none z-10" />

            {/* PDF Viewer */}
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={bookTitle}
              style={{
                background: 'linear-gradient(to bottom, #fffbeb, #fef3c7)',
              }}
            />

            {/* Page Corner Curl Effect (Top Right) */}
            <div 
              className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, transparent 50%, rgba(245, 158, 11, 0.1) 50%)',
                clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
              }}
            />

            {/* Page Corner Curl Effect (Bottom Right) */}
            <div 
              className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
              style={{
                background: 'linear-gradient(45deg, transparent 50%, rgba(245, 158, 11, 0.1) 50%)',
                clipPath: 'polygon(100% 100%, 100% 0, 0 100%)',
              }}
            />
          </div>

          {/* Decorative Book Stand */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-b from-amber-900 to-amber-950 rounded-t-3xl shadow-2xl opacity-30 blur-sm" />
        </div>
      </div>

      {/* Footer with Reading Tips */}
      <div className="flex items-center justify-center gap-6 p-4 bg-gradient-to-r from-amber-900 via-orange-900 to-amber-900 shadow-xl border-t-4 border-amber-700">
        <div className="flex items-center gap-2 text-amber-100 text-sm">
          <span className="font-medium">💡 Tip:</span>
          <span>Use the PDF toolbar inside to navigate pages, zoom, and search</span>
        </div>
        <div className="flex items-center gap-2 text-amber-100 text-sm">
          <span className="font-medium">⌨️ Shortcuts:</span>
          <span>ESC to close • F11 for fullscreen</span>
        </div>
      </div>
    </div>
  );
}

