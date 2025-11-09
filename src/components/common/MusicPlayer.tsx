import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Track {
  name: string;
  url: string;
  duration: string;
}

const tracks: Track[] = [
  {
    name: "Peaceful Reading",
    url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    duration: "2:30"
  },
  {
    name: "Ambient Library",
    url: "https://cdn.pixabay.com/audio/2022/03/10/audio_4e5d5b6b54.mp3",
    duration: "3:15"
  },
  {
    name: "Calm Study",
    url: "https://cdn.pixabay.com/audio/2022/08/02/audio_884fe05c21.mp3",
    duration: "2:45"
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved preferences
    const savedVolume = localStorage.getItem("musicVolume");
    const savedTrack = localStorage.getItem("currentTrack");
    
    if (savedVolume) {
      const vol = parseInt(savedVolume);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol / 100;
      }
    }
    
    if (savedTrack) {
      setCurrentTrackIndex(parseInt(savedTrack));
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Unable to play music. Please try again.",
            variant: "destructive",
          });
        });
        setIsPlaying(true);
        if (!isExpanded) {
          toast({
            title: "🎵 Music Playing",
            description: `Now playing: ${tracks[currentTrackIndex].name}`,
            duration: 3000,
          });
        }
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    localStorage.setItem("musicVolume", newVolume.toString());
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const changeTrack = (index: number) => {
    setCurrentTrackIndex(index);
    localStorage.setItem("currentTrack", index.toString());
    if (isPlaying && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
    toast({
      title: "Track Changed",
      description: `Now playing: ${tracks[index].name}`,
      duration: 2000,
    });
  };

  const handleTrackEnd = () => {
    // Auto-play next track
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    changeTrack(nextIndex);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Card className={`bg-card/95 backdrop-blur-sm border-2 border-border/50 shadow-2xl rounded-3xl transition-all duration-300 ${
        isExpanded ? "w-80" : "w-16"
      }`}>
        <div className="p-3">
          {!isExpanded ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(true)}
                className="hover:bg-primary/10 transition-colors rounded-full"
              >
                <Music className="w-5 h-5 text-primary" />
              </Button>
              {isPlaying && (
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                  <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-1 h-3 bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <Music className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm">Reading Music</h3>
                    <p className="text-xs text-muted-foreground">Ambient Sounds</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 rounded-full hover:bg-muted/50"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground">Now Playing:</p>
                <p className="text-sm font-medium">{tracks[currentTrackIndex].name}</p>
                <p className="text-xs text-muted-foreground">{tracks[currentTrackIndex].duration}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground hover:scale-105 transition-all duration-300 border-0"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                <div className="flex-1 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="h-8 w-8 rounded-full"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    onValueChange={handleVolumeChange}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {isMuted ? 0 : volume}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Select Track:</p>
                <div className="space-y-1">
                  {tracks.map((track, index) => (
                    <button
                      key={index}
                      onClick={() => changeTrack(index)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                        currentTrackIndex === index
                          ? "gradient-primary text-primary-foreground shadow-glow"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{track.name}</span>
                        <span className="text-xs opacity-70">{track.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <audio
        ref={audioRef}
        src={tracks[currentTrackIndex].url}
        loop={false}
        onEnded={handleTrackEnd}
        preload="metadata"
      />
    </div>
  );
}
