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
    ? `${pdfUrl}#view=FitH&pagemode=none&scrollbar=1&toolbar=1&navpanes=0`
    : `${pdfUrl}#view=FitH&pagemode=none&scrollbar=1&toolbar=1&navpanes=0`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-full max-h-[85vh] h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm sm:text-base font-display truncate">
              {bookTitle}
            </DialogTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomOut}
                className="hidden sm:flex h-8"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs font-medium min-w-[45px] text-center hidden sm:inline">
                {zoom}%
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleZoomIn}
                className="hidden sm:flex h-8"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              
              {!isMobile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleViewMode}
                  title={viewMode === "single" ? "Switch to double page" : "Switch to single page"}
                  className="h-8"
                >
                  {viewMode === "single" ? (
                    <BookOpen className="w-3 h-3" />
                  ) : (
                    <FileText className="w-3 h-3" />
                  )}
                </Button>
              )}

              <Button asChild variant="outline" size="sm" className="hidden sm:flex h-8">
                <a href={pdfUrl} download>
                  <Download className="w-3 h-3" />
                </a>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(pdfUrl, "_blank")}
                className="hidden sm:flex h-8"
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted relative">
          {viewMode === "double" && !isMobile ? (
            <div className="w-full h-full flex items-center justify-center gap-1 p-2 overflow-auto">
              <div className="flex gap-1 h-full">
                <div className="flex-1 h-full bg-white shadow-lg overflow-hidden">
                  <iframe
                    src={`${pdfViewUrl}&page=1`}
                    className="w-full h-full border-0"
                    title={`${bookTitle} - Page 1`}
                  />
                </div>
                <div className="flex-1 h-full bg-white shadow-lg overflow-hidden">
                  <iframe
                    src={`${pdfViewUrl}&page=2`}
                    className="w-full h-full border-0"
                    title={`${bookTitle} - Page 2`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={pdfViewUrl}
              className="w-full h-full border-0"
              title={bookTitle}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
