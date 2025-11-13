import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Track {
  name: string;
  url: string;
  duration: string;
}

const tracks: Track[] = [
  {
    name: "Peaceful Reading",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "5:00"
  },
  {
    name: "Ambient Library",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "5:00"
  },
  {
    name: "Calm Study",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:00"
  }
];

export default function MusicPlayerContent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
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
        toast({
          title: "🎵 Music Playing",
          description: `Now playing: ${tracks[currentTrackIndex].name}`,
          duration: 3000,
        });
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
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    changeTrack(nextIndex);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2 p-4 bg-muted/30 rounded-xl">
        <p className="text-xs text-muted-foreground">Now Playing:</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{tracks[currentTrackIndex].name}</p>
            <p className="text-xs text-muted-foreground">{tracks[currentTrackIndex].duration}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-12 w-12 rounded-xl gradient-primary text-primary-foreground hover:scale-105 transition-all duration-300 border-0 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8 rounded-full flex-shrink-0"
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
          <span className="text-xs text-muted-foreground w-10 text-right flex-shrink-0">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Select Track:</p>
        <div className="space-y-1.5">
          {tracks.map((track, index) => (
            <button
              key={index}
              onClick={() => changeTrack(index)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                currentTrackIndex === index
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "hover:bg-muted/50 border border-border/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{track.name}</span>
                <span className="text-xs opacity-70">{track.duration}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

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
