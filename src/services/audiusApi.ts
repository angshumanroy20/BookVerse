// Audius API Service
// Documentation: https://docs.audius.org/developers/api

// Multiple discovery nodes for fallback
const AUDIUS_API_HOSTS = [
  "https://discoveryprovider.audius.co",
  "https://discoveryprovider2.audius.co",
  "https://discoveryprovider3.audius.co",
  "https://audius-discovery-1.altego.net",
  "https://audius-discovery-2.theblueprint.xyz"
];

let currentHostIndex = 0;

function getApiHost(): string {
  return AUDIUS_API_HOSTS[currentHostIndex];
}

function switchToNextHost(): void {
  currentHostIndex = (currentHostIndex + 1) % AUDIUS_API_HOSTS.length;
}

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
 * Fetch with retry logic across multiple hosts
 */
async function fetchWithRetry(endpoint: string, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const host = getApiHost();
      const url = `${host}${endpoint}`;
      console.log(`Attempting to fetch from: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        return response;
      }
      
      console.warn(`Request failed with status ${response.status}, trying next host...`);
      switchToNextHost();
    } catch (error) {
      console.error(`Error fetching from ${getApiHost()}:`, error);
      lastError = error as Error;
      switchToNextHost();
    }
  }
  
  throw lastError || new Error("Failed to fetch after multiple retries");
}

/**
 * Get trending tracks from Audius
 */
export async function getTrendingTracks(limit: number = 10): Promise<AudiusTrack[]> {
  try {
    const response = await fetchWithRetry(
      `/v1/tracks/trending?limit=${limit}&time=week`
    );
    
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
    const response = await fetchWithRetry(
      `/v1/tracks/search?query=${encodeURIComponent(query)}&limit=${limit}`
    );
    
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
  return `${getApiHost()}/v1/tracks/${trackId}/stream`;
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
