import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Music, Play, Pause, Volume2, VolumeX, Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getTrendingTracks, searchTracks, getStreamUrl, formatDuration, type AudiusTrack } from "@/services/audiusApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function MusicPlayerContent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [tracks, setTracks] = useState<AudiusTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedVolume = localStorage.getItem("musicVolume");
    
    if (savedVolume) {
      const vol = parseInt(savedVolume);
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol / 100;
      }
    }
    
    loadTrendingTracks();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const loadTrendingTracks = async () => {
    setLoading(true);
    try {
      const trendingTracks = await getTrendingTracks(15);
      
      if (trendingTracks.length === 0) {
        // Fallback to sample tracks if API fails
        const fallbackTracks: AudiusTrack[] = [
          {
            id: "sample-1",
            title: "Relaxing Piano Music",
            user: { name: "Sample Artist" },
            duration: 180,
          },
          {
            id: "sample-2",
            title: "Ambient Study Music",
            user: { name: "Sample Artist" },
            duration: 240,
          },
          {
            id: "sample-3",
            title: "Peaceful Reading",
            user: { name: "Sample Artist" },
            duration: 200,
          }
        ];
        
        setTracks(fallbackTracks);
        toast({
          title: "Using Sample Tracks",
          description: "Unable to connect to music service. Showing sample tracks.",
        });
      } else {
        setTracks(trendingTracks);
      }
    } catch (error) {
      console.error("Error loading tracks:", error);
      
      // Set fallback tracks on error
      const fallbackTracks: AudiusTrack[] = [
        {
          id: "sample-1",
          title: "Relaxing Piano Music",
          user: { name: "Sample Artist" },
          duration: 180,
        },
        {
          id: "sample-2",
          title: "Ambient Study Music",
          user: { name: "Sample Artist" },
          duration: 240,
        },
        {
          id: "sample-3",
          title: "Peaceful Reading",
          user: { name: "Sample Artist" },
          duration: 200,
        }
      ];
      
      setTracks(fallbackTracks);
      toast({
        title: "Connection Error",
        description: "Using sample tracks. Music service unavailable.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      loadTrendingTracks();
      return;
    }

    setSearching(true);
    try {
      const results = await searchTracks(searchQuery, 10);
      setTracks(results);
      setCurrentTrackIndex(0);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No tracks found for your search query.",
        });
      }
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast({
        title: "Search Error",
        description: "Failed to search tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const togglePlay = () => {
    if (!tracks.length) return;
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback Error",
            description: "Unable to play music. Please try another track.",
            variant: "destructive",
          });
        });
        setIsPlaying(true);
        toast({
          title: "🎵 Music Playing",
          description: `Now playing: ${tracks[currentTrackIndex].title}`,
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
    setIsPlaying(false);
    
    // Small delay to ensure audio element updates
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          toast({
            title: "Track Changed",
            description: `Now playing: ${tracks[index].title}`,
            duration: 2000,
          });
        }).catch((error) => {
          console.error("Error playing track:", error);
          setIsPlaying(false);
          toast({
            title: "Playback Error",
            description: "Unable to play this track. Please try another.",
            variant: "destructive",
          });
        });
      }
    }, 100);
  };

  const handleTrackEnd = () => {
    if (tracks.length > 0) {
      const nextIndex = (currentTrackIndex + 1) % tracks.length;
      changeTrack(nextIndex);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 py-4">
        <Skeleton className="h-24 w-full bg-muted" />
        <Skeleton className="h-12 w-full bg-muted" />
        <div className="space-y-2">
          <Skeleton className="h-16 w-full bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />
          <Skeleton className="h-16 w-full bg-muted" />
        </div>
      </div>
    );
  }

  if (!tracks.length) {
    return (
      <div className="space-y-4 py-4">
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No tracks available</p>
          <Button onClick={loadTrendingTracks} className="mt-4" size="sm">
            Reload Tracks
          </Button>
        </div>
      </div>
    );
  }

  const currentTrack = tracks[currentTrackIndex];
  const isSampleTrack = currentTrack?.id.startsWith("sample-");
  const audioSrc = isSampleTrack 
    ? "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
    : getStreamUrl(currentTrack?.id || "");

  return (
    <div className="space-y-4 sm:space-y-6 py-2 sm:py-4 w-full overflow-hidden">
      <form onSubmit={handleSearch} className="space-y-2 w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder="Search for music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-20 h-9 sm:h-10 text-sm w-full"
            disabled={isSampleTrack}
          />
          <Button
            type="submit"
            size="sm"
            disabled={searching || isSampleTrack}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 sm:h-8 text-xs flex-shrink-0"
          >
            {searching ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
        {isSampleTrack && (
          <p className="text-xs text-muted-foreground text-center">
            Music service unavailable. Using sample tracks.
          </p>
        )}
        {searchQuery && !isSampleTrack && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              loadTrendingTracks();
            }}
            className="w-full text-xs"
          >
            Show Trending Tracks
          </Button>
        )}
      </form>

      <div className="space-y-2 p-3 sm:p-4 bg-muted/30 rounded-xl w-full overflow-hidden">
        <p className="text-xs text-muted-foreground">Now Playing:</p>
        <div className="flex items-center gap-3 w-full min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs sm:text-sm font-medium truncate break-all">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate break-all">{currentTrack.user.name}</p>
            <p className="text-xs text-muted-foreground">{formatDuration(currentTrack.duration)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={togglePlay}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl gradient-primary text-primary-foreground hover:scale-105 transition-all duration-300 border-0 flex-shrink-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1 min-w-0"
          />
          <span className="text-xs text-muted-foreground w-8 sm:w-10 text-right flex-shrink-0">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-[40vh] sm:max-h-64 overflow-y-auto w-full overflow-x-hidden">
        <p className="text-xs text-muted-foreground font-medium">
          {isSampleTrack ? "Sample Tracks:" : searchQuery ? "Search Results:" : "Trending Tracks:"}
        </p>
        <div className="space-y-1.5 w-full">
          {tracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => changeTrack(index)}
              className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-sm transition-all duration-300 overflow-hidden ${
                currentTrackIndex === index
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "hover:bg-muted/50 border border-border/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="font-medium truncate text-xs sm:text-sm break-all">{track.title}</p>
                  <p className="text-xs opacity-70 truncate break-all">{track.user.name}</p>
                </div>
                <span className="text-xs opacity-70 flex-shrink-0 whitespace-nowrap">
                  {formatDuration(track.duration)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        loop={false}
        onEnded={handleTrackEnd}
        preload="metadata"
      />
    </div>
  );
}
