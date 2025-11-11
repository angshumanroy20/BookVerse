/**
 * Google Custom Search API Integration
 * Provides web search functionality using Google's Custom Search JSON API
 */

export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface SearchResponse {
  items: SearchResult[];
  searchInformation: {
    totalResults: string;
    searchTime: number;
  };
}

/**
 * Search the web using Google Custom Search API
 * @param query - The search query
 * @param numResults - Number of results to return (default: 10, max: 10)
 * @returns Search results from Google
 */
export async function searchWeb(
  query: string,
  numResults: number = 10
): Promise<SearchResponse> {
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const searchEngineId = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    throw new Error(
      "Google Search API credentials not configured. Please add VITE_GOOGLE_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID to your .env file."
    );
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.append("key", apiKey);
  url.searchParams.append("cx", searchEngineId);
  url.searchParams.append("q", query);
  url.searchParams.append("num", Math.min(numResults, 10).toString());

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || `Search failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return {
        items: [],
        searchInformation: {
          totalResults: "0",
          searchTime: 0,
        },
      };
    }

    return {
      items: data.items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        displayLink: item.displayLink,
      })),
      searchInformation: {
        totalResults: data.searchInformation.totalResults,
        searchTime: data.searchInformation.searchTime,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to perform web search. Please try again.");
  }
}

/**
 * Generate an AI-style response based on search results
 * @param query - The original search query
 * @param results - Search results from Google
 * @returns A formatted response with search results
 */
export function formatSearchResponse(
  query: string,
  results: SearchResponse
): string {
  if (results.items.length === 0) {
    return `I couldn't find any web results for "${query}". Please try a different search term.`;
  }

  const topResults = results.items.slice(0, 5);
  let response = `Here's what I found on the web for "${query}":\n\n`;

  topResults.forEach((result, index) => {
    response += `${index + 1}. **${result.title}**\n`;
    response += `   ${result.snippet}\n`;
    response += `   Source: ${result.displayLink}\n`;
    response += `   Link: ${result.link}\n\n`;
  });

  response += `\nFound ${results.searchInformation.totalResults} results in ${results.searchInformation.searchTime} seconds.`;

  return response;
}
