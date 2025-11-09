import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn, ZoomOut, Maximize2, BookOpen, FileText } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewer({ pdfUrl, bookTitle, isOpen, onClose }: PdfViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<"single" | "double">("double");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("single");
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "single" ? "double" : "single"));
  };

  const pdfViewUrl = viewMode === "double" 
    ? `${pdfUrl}#view=FitH&pagemode=bookmarks&scrollbar=1&toolbar=1&navpanes=0&view=TwoPageView`
    : `${pdfUrl}#view=FitH&pagemode=bookmarks&scrollbar=1&toolbar=1&navpanes=0`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-card">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-base sm:text-xl font-display truncate">
              {bookTitle}
            </DialogTitle>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                className="hidden sm:flex"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs sm:text-sm font-medium min-w-[50px] sm:min-w-[60px] text-center hidden sm:inline">
                {zoom}%
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomIn}
                className="hidden sm:flex"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleViewMode}
                  title={viewMode === "single" ? "Switch to double page" : "Switch to single page"}
                >
                  {viewMode === "single" ? (
                    <BookOpen className="w-4 h-4" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </Button>
              )}

              <Button asChild variant="outline" size="sm" className="hidden sm:flex">
                <a href={pdfUrl} download>
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Download</span>
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pdfUrl, "_blank")}
                className="hidden sm:flex"
              >
                <Maximize2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Full Screen</span>
              </Button>
              
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted">
          <iframe
            src={pdfViewUrl}
            className="w-full h-full border-0"
            title={bookTitle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
