import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface VoiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscriptComplete: (transcript: string) => void;
}

export default function VoiceSearchDialog({
  open,
  onOpenChange,
  onTranscriptComplete,
}: VoiceSearchDialogProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (open) {
      initializeRecognition();
    } else {
      stopListening();
      setTranscript("");
      setInterimTranscript("");
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [open]);

  const initializeRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");
    };

    recognitionInstance.onresult = (event: any) => {
      let interimText = "";
      let finalText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcriptPart + " ";
        } else {
          interimText += transcriptPart;
        }
      }

      if (finalText) {
        setTranscript((prev) => prev + finalText);
        setInterimTranscript("");
      } else {
        setInterimTranscript(interimText);
      }
    };

    recognitionInstance.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      
      if (event.error === 'no-speech') {
        // Don't stop on no-speech, just continue listening
        return;
      }
      
      if (event.error === 'aborted') {
        return;
      }

      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
    
    // Start listening automatically when dialog opens
    setTimeout(() => {
      recognitionInstance.start();
    }, 300);
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const restartListening = () => {
    if (recognition) {
      recognition.stop();
      setTimeout(() => {
        setTranscript("");
        setInterimTranscript("");
        recognition.start();
      }, 300);
    }
  };

  const handleSearch = () => {
    const finalTranscript = (transcript + " " + interimTranscript).trim();
    if (finalTranscript) {
      onTranscriptComplete(finalTranscript);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    stopListening();
    onOpenChange(false);
  };

  const displayText = transcript + (interimTranscript ? " " + interimTranscript : "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Voice Search
          </DialogTitle>
          <DialogDescription>
            Speak clearly to search for books by title, author, or genre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Microphone Animation */}
          <div className="flex justify-center">
            <div className={`relative ${isListening ? 'animate-pulse' : ''}`}>
              <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-red-500/20 animate-ping' : 'bg-muted'}`} />
              <div className={`relative rounded-full p-8 ${isListening ? 'bg-red-500/10' : 'bg-muted'}`}>
                {isListening ? (
                  <Mic className="w-12 h-12 text-red-500" />
                ) : (
                  <MicOff className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p className={`text-sm font-medium ${isListening ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isListening ? "Listening..." : "Click Start to begin"}
            </p>
          </div>

          {/* Transcript Display */}
          <div className="min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {displayText ? (
              <p className="text-base leading-relaxed">
                <span className="text-foreground">{transcript}</span>
                <span className="text-muted-foreground italic">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-muted-foreground text-center italic">
                Your speech will appear here...
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!isListening ? (
              <Button
                onClick={restartListening}
                className="flex-1"
                variant="default"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Listening
              </Button>
            ) : (
              <Button
                onClick={stopListening}
                className="flex-1"
                variant="destructive"
              >
                <MicOff className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
            
            <Button
              onClick={handleSearch}
              disabled={!displayText.trim()}
              className="flex-1"
            >
              Search
            </Button>
            
            <Button
              onClick={handleCancel}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
