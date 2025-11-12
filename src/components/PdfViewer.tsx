import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ChevronLeft, ChevronRight, Maximize2, BookOpen, FileText, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PdfViewerProps {
  pdfUrl: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewer({ pdfUrl, bookTitle, isOpen, onClose }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"single" | "double">("single");
  const [isMobile, setIsMobile] = useState(false);
  const [pageInput, setPageInput] = useState("1");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  useEffect(() => {
    setPageInput(currentPage.toString());
    // Force iframe reload when page changes
    setIframeKey(prev => prev + 1);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (viewMode === "double") {
      setCurrentPage((prev) => Math.max(1, prev - 2));
    } else {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (viewMode === "double") {
      setCurrentPage((prev) => prev + 2);
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    // For now, just go forward - user can keep clicking next
    setCurrentPage((prev) => prev + (viewMode === "double" ? 2 : 1));
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

  const toggleViewMode = () => {
    setViewMode((prev) => {
      const newMode = prev === "single" ? "double" : "single";
      if (newMode === "double" && currentPage % 2 === 0) {
        setCurrentPage(currentPage - 1);
      }
      return newMode;
    });
  };

  const canGoPrev = currentPage > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-full h-[98vh] p-0 gap-0 flex flex-col [&>button]:hidden">
        <DialogHeader className="px-3 sm:px-4 py-2 sm:py-3 border-b bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm sm:text-base font-display truncate">
              {bookTitle}
            </DialogTitle>
            <div className="flex items-center gap-1 flex-shrink-0">
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
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <div className="flex gap-2 sm:gap-4 h-full w-full max-w-[1600px]">
                <div className="flex-1 h-full bg-white shadow-2xl overflow-hidden border border-border">
                  <iframe
                    key={`left-${iframeKey}`}
                    ref={iframeRef}
                    src={`${pdfUrl}#page=${currentPage}&view=FitV&pagemode=none&scrollbar=0&toolbar=0&navpanes=0&statusbar=0`}
                    className="w-full h-full border-0"
                    title={`${bookTitle} - Page ${currentPage}`}
                  />
                </div>
                <div className="flex-1 h-full bg-white shadow-2xl overflow-hidden border border-border">
                  <iframe
                    key={`right-${iframeKey}`}
                    src={`${pdfUrl}#page=${currentPage + 1}&view=FitV&pagemode=none&scrollbar=0&toolbar=0&navpanes=0&statusbar=0`}
                    className="w-full h-full border-0"
                    title={`${bookTitle} - Page ${currentPage + 1}`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
              <div className="h-full w-full max-w-[1000px] bg-white shadow-2xl overflow-hidden border border-border">
                <iframe
                  key={`single-${iframeKey}`}
                  ref={iframeRef}
                  src={`${pdfUrl}#page=${currentPage}&view=FitV&pagemode=none&scrollbar=0&toolbar=0&navpanes=0&statusbar=0`}
                  className="w-full h-full border-0"
                  title={bookTitle}
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-3 sm:px-4 py-2 sm:py-3 border-t bg-card flex-shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFirstPage}
                disabled={!canGoPrev}
                className="h-8 w-8 p-0"
                title="First page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!canGoPrev}
                className="h-8 w-8 p-0"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Page</span>
              <Input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                className="h-8 w-12 sm:w-16 text-center text-xs sm:text-sm"
              />
              {viewMode === "double" && !isMobile && (
                <>
                  <span className="text-xs sm:text-sm text-muted-foreground">-</span>
                  <span className="text-xs sm:text-sm font-medium">{currentPage + 1}</span>
                </>
              )}
            </form>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                className="h-8 w-8 p-0"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLastPage}
                className="h-8 w-8 p-0"
                title="Last page"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
