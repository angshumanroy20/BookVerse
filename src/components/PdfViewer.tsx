import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink, Cloud, FileText } from "lucide-react";

interface PdfViewerProps {
  pdfUrl: string;
  bookTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PdfViewer({ pdfUrl, bookTitle, isOpen, onClose }: PdfViewerProps) {
  const [useCloud, setUseCloud] = useState(false);

  const cloudViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[96vw] w-full h-[90vh] p-0 gap-0 flex flex-col bg-card border-border/40 overflow-hidden [&>button]:hidden shadow-2xl">
        <DialogHeader className="px-4 py-2.5 border-b bg-muted/40 flex-shrink-0 flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <DialogTitle className="text-sm sm:text-base font-display font-bold truncate">
              {bookTitle}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseCloud((c) => !c)}
              className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            >
              {useCloud ? <FileText className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
              <span>{useCloud ? "Native PDF" : "Cloud Viewer"}</span>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            >
              <a href={pdfUrl} download={`${bookTitle}.pdf`} target="_blank" rel="noreferrer">
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(pdfUrl, "_blank")}
              className="h-7 text-xs px-2.5 rounded-lg gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 w-full h-full bg-zinc-950 overflow-hidden relative">
          <iframe
            src={useCloud ? cloudViewerUrl : pdfUrl}
            className="w-full h-full border-0"
            title={bookTitle}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PdfViewer;
