import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PdfViewerProps {
  pdfUrl: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewer({ pdfUrl, bookTitle, isOpen, onClose }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setPageInput(currentPage.toString());
    setIframeKey(prev => prev + 1);
  }, [currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const canGoPrev = currentPage > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[99vw] w-full h-[85vh] sm:h-[90vh] p-0 gap-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="px-3 sm:px-4 py-2 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm sm:text-base font-display truncate">
              {bookTitle}
            </DialogTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
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
        
        <div className="flex-1 overflow-hidden bg-muted relative flex items-center">
          {/* Previous Page Button - Left Side */}
          {!isMobile && canGoPrev && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePrevPage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-16 w-12 bg-background/80 hover:bg-background/95 shadow-lg"
              title="Previous page"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* PDF Viewer */}
          <div className="w-full h-full flex items-center justify-center px-2 sm:px-16">
            <div className="h-full w-full bg-white shadow-2xl overflow-hidden border border-border">
              <iframe
                key={`page-${iframeKey}`}
                ref={iframeRef}
                src={`${pdfUrl}#page=${currentPage}&view=FitH&pagemode=none&scrollbar=0&toolbar=0&navpanes=0&statusbar=0`}
                className="w-full h-full border-0"
                title={bookTitle}
              />
            </div>
          </div>

          {/* Next Page Button - Right Side */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleNextPage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-16 w-12 bg-background/80 hover:bg-background/95 shadow-lg"
              title="Next page"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <div className="px-3 sm:px-4 py-2 border-t bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!canGoPrev}
                  className="h-8"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
              </div>
            )}

            {/* Page Input */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2 mx-auto">
              <span className="text-xs sm:text-sm text-muted-foreground">Page</span>
              <Input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                className="h-8 w-16 sm:w-20 text-center text-xs sm:text-sm"
              />
            </form>

            {/* Mobile Navigation */}
            {isMobile && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  className="h-8"
                  title="Next page"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
