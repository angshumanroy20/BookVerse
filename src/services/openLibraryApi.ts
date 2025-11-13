/**
 * Open Library API Service
 * 
 * Provides functions to search and retrieve book information from Open Library API
 * API Documentation: https://openlibrary.org/developers/api
 */

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  isbn?: string[];
  publisher?: string[];
  cover_i?: number;
  cover_edition_key?: string;
  edition_count?: number;
  language?: string[];
  subject?: string[];
  ratings_average?: number;
  ratings_count?: number;
  number_of_pages_median?: number;
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryBook[];
}

export interface OpenLibraryWorkDetails {
  key: string;
  title: string;
  description?: string | { type: string; value: string };
  covers?: number[];
  subjects?: string[];
  subject_places?: string[];
  subject_times?: string[];
  authors?: Array<{
    author: {
      key: string;
    };
    type: {
      key: string;
    };
  }>;
  first_publish_date?: string;
}

const OPEN_LIBRARY_API_BASE = 'https://openlibrary.org';
const OPEN_LIBRARY_COVERS_BASE = 'https://covers.openlibrary.org/b';

/**
 * Search for books using Open Library API
 * @param query - Search query
 * @param limit - Maximum number of results (default: 20)
 */
export async function searchOpenLibrary(
  query: string,
  limit: number = 20
): Promise<OpenLibrarySearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      fields: 'key,title,author_name,author_key,first_publish_year,isbn,publisher,cover_i,cover_edition_key,edition_count,language,subject,ratings_average,ratings_count,number_of_pages_median',
    });

    const response = await fetch(`${OPEN_LIBRARY_API_BASE}/search.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data: OpenLibrarySearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Open Library:', error);
    throw error;
  }
}

/**
 * Get work details by work ID
 * @param workId - Open Library work ID (e.g., "OL45804W")
 */
export async function getOpenLibraryWork(workId: string): Promise<OpenLibraryWorkDetails> {
  try {
    const cleanId = workId.startsWith('/works/') ? workId : `/works/${workId}`;
    const response = await fetch(`${OPEN_LIBRARY_API_BASE}${cleanId}.json`);
    
    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data: OpenLibraryWorkDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Open Library work:', error);
    throw error;
  }
}

/**
 * Search books by ISBN
 * @param isbn - ISBN-10 or ISBN-13
 */
export async function searchOpenLibraryByISBN(isbn: string): Promise<OpenLibrarySearchResponse> {
  return searchOpenLibrary(`isbn:${isbn}`);
}

/**
 * Search books by author
 * @param author - Author name
 */
export async function searchOpenLibraryByAuthor(author: string): Promise<OpenLibrarySearchResponse> {
  return searchOpenLibrary(`author:${author}`);
}

/**
 * Search books by title
 * @param title - Book title
 */
export async function searchOpenLibraryByTitle(title: string): Promise<OpenLibrarySearchResponse> {
  return searchOpenLibrary(`title:${title}`);
}

/**
 * Get cover image URL
 * @param coverId - Cover ID from Open Library
 * @param size - Size of the cover (S, M, L)
 */
export function getOpenLibraryCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${OPEN_LIBRARY_COVERS_BASE}/id/${coverId}-${size}.jpg`;
}

/**
 * Get cover image URL by ISBN
 * @param isbn - ISBN-10 or ISBN-13
 * @param size - Size of the cover (S, M, L)
 */
export function getOpenLibraryCoverByISBN(isbn: string, size: 'S' | 'M' | 'L' = 'L'): string {
  return `${OPEN_LIBRARY_COVERS_BASE}/isbn/${isbn}-${size}.jpg`;
}

/**
 * Convert Open Library Book to our Book format
 */
export function convertOpenLibraryBookToBook(olBook: OpenLibraryBook) {
  // Get cover image URL
  const coverImage = olBook.cover_i 
    ? getOpenLibraryCoverUrl(olBook.cover_i, 'L')
    : null;

  // Get the first ISBN if available
  const isbn = olBook.isbn?.[0] || null;

  // Extract work ID from key
  const workId = olBook.key?.replace('/works/', '') || null;

  return {
    title: olBook.title || 'Unknown Title',
    author: olBook.author_name?.join(', ') || 'Unknown Author',
    genre: olBook.subject?.[0] || null,
    synopsis: null, // Will need to fetch work details for description
    cover_image_url: coverImage,
    isbn: isbn,
    publisher: olBook.publisher?.[0] || null,
    published_date: olBook.first_publish_year?.toString() || null,
    page_count: olBook.number_of_pages_median || null,
    language: olBook.language?.[0] || 'eng',
    open_library_id: workId,
    edition_count: olBook.edition_count || null,
  };
}

/**
 * Get detailed book information including description
 * @param olBook - Open Library book from search results
 */
export async function getOpenLibraryBookDetails(olBook: OpenLibraryBook) {
  const basicInfo = convertOpenLibraryBookToBook(olBook);
  
  try {
    // Fetch work details to get description
    if (olBook.key) {
      const workDetails = await getOpenLibraryWork(olBook.key);
      
      // Extract description
      let description = null;
      if (workDetails.description) {
        if (typeof workDetails.description === 'string') {
          description = workDetails.description;
        } else if (workDetails.description.value) {
          description = workDetails.description.value;
        }
      }

      return {
        ...basicInfo,
        synopsis: description,
      };
    }
  } catch (error) {
    console.error('Error fetching work details:', error);
  }

  return basicInfo;
}
