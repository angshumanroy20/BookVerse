// Audius API Service
// Documentation: https://audiusdiscoveryprovider.audius.co/v1/docs

const AUDIUS_API_HOST = "https://discoveryprovider.audius.co";

export interface AudiusTrack {
  id: string;
  title: string;
  user: {
    name: string;
  };
  duration: number;
  artwork?: {
    "150x150"?: string;
    "480x480"?: string;
    "1000x1000"?: string;
  };
  genre?: string;
  mood?: string;
  play_count?: number;
}

interface AudiusResponse {
  data: AudiusTrack[];
}

/**
 * Get trending tracks from Audius
 */
export async function getTrendingTracks(limit: number = 10): Promise<AudiusTrack[]> {
  try {
    const response = await fetch(
      `${AUDIUS_API_HOST}/v1/tracks/trending?limit=${limit}&genre=all`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch trending tracks");
    }
    
    const result: AudiusResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error fetching trending tracks:", error);
    return [];
  }
}

/**
 * Search for tracks on Audius
 */
export async function searchTracks(query: string, limit: number = 10): Promise<AudiusTrack[]> {
  try {
    const response = await fetch(
      `${AUDIUS_API_HOST}/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to search tracks");
    }
    
    const result: AudiusResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error searching tracks:", error);
    return [];
  }
}

/**
 * Get stream URL for a track
 */
export function getStreamUrl(trackId: string): string {
  return `${AUDIUS_API_HOST}/v1/tracks/${trackId}/stream`;
}

/**
 * Format duration from seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Get track artwork URL
 */
export function getArtworkUrl(track: AudiusTrack, size: "150x150" | "480x480" | "1000x1000" = "480x480"): string {
  return track.artwork?.[size] || "";
}
