import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-coral-soft via-purple-soft to-blue-soft">
      <div className="text-center space-y-8">
        {/* Animated Book Character */}
        <div className="relative w-48 h-48 mx-auto">
          {/* Book Body */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-32 h-40 animate-book-bounce">
              {/* Book Cover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow rounded-lg shadow-2xl transform perspective-1000">
                <div className="absolute inset-2 border-2 border-white/30 rounded-md" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-display text-2xl font-bold">
                  B
                </div>
              </div>
              
              {/* Animated Pages */}
              <div className="absolute top-0 right-0 w-1 h-full bg-white/50 animate-page-flip" 
                   style={{ transformOrigin: "left center" }} />
              <div className="absolute top-0 right-0 w-1 h-full bg-white/30 animate-page-flip" 
                   style={{ transformOrigin: "left center", animationDelay: "0.2s" }} />
              <div className="absolute top-0 right-0 w-1 h-full bg-white/20 animate-page-flip" 
                   style={{ transformOrigin: "left center", animationDelay: "0.4s" }} />
            </div>
          </div>

          {/* Reading Glasses */}
          <div className="absolute top-8 right-4 animate-float">
            <div className="relative w-16 h-8">
              <div className="absolute left-0 w-6 h-6 border-2 border-foreground rounded-full" />
              <div className="absolute right-0 w-6 h-6 border-2 border-foreground rounded-full" />
              <div className="absolute top-3 left-6 w-4 h-0.5 bg-foreground" />
            </div>
          </div>

          {/* Coffee Cup */}
          <div className="absolute bottom-4 left-4 animate-steam">
            <div className="relative w-12 h-14">
              <div className="absolute bottom-0 w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-b-lg border-2 border-amber-900" />
              <div className="absolute bottom-8 left-1 w-8 h-2 bg-amber-700 rounded-t-full" />
              <div className="absolute -right-2 bottom-4 w-4 h-6 border-2 border-amber-900 rounded-r-full" />
              {/* Steam */}
              <div className="absolute -top-2 left-2 w-1 h-4 bg-muted/50 rounded-full animate-steam-rise" />
              <div className="absolute -top-3 left-4 w-1 h-5 bg-muted/40 rounded-full animate-steam-rise" 
                   style={{ animationDelay: "0.3s" }} />
              <div className="absolute -top-2 left-6 w-1 h-4 bg-muted/30 rounded-full animate-steam-rise" 
                   style={{ animationDelay: "0.6s" }} />
            </div>
          </div>

          {/* Sparkles */}
          <div className="absolute top-12 left-12 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-sparkle" 
               style={{ animationDelay: "0.5s" }} />
          <div className="absolute bottom-16 left-20 w-2 h-2 bg-yellow-500 rounded-full animate-sparkle" 
               style={{ animationDelay: "1s" }} />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold gradient-text">
            Loading Your Library
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Brewing some literary magic{dots}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 mx-auto bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full gradient-primary animate-progress-bar" />
        </div>

        {/* Fun Messages */}
        <div className="text-sm text-muted-foreground italic">
          <RandomLoadingMessage />
        </div>
      </div>
    </div>
  );
}

function RandomLoadingMessage() {
  const messages = [
    "📚 Dusting off the shelves...",
    "☕ Brewing the perfect reading atmosphere...",
    "✨ Sprinkling some bookish magic...",
    "🔖 Marking your favorite pages...",
    "📖 Opening the literary portal...",
    "🎭 Setting the scene for your next adventure...",
    "🌟 Polishing the plot twists...",
    "📝 Sharpening the pencils...",
    "🕯️ Lighting the reading lamp...",
    "🎨 Painting the story canvas...",
  ];

  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return <span>{message}</span>;
}
