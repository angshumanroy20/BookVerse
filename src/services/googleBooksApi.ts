/**
 * Google Books API Service
 * 
 * Provides functions to search and retrieve book information from Google Books API
 * API Documentation: https://developers.google.com/books/docs/v1/using
 */

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    language?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBook[];
}

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

/**
 * Search for books using Google Books API
 * @param query - Search query (title, author, ISBN, etc.)
 * @param maxResults - Maximum number of results (default: 20, max: 40)
 * @param startIndex - Starting index for pagination (default: 0)
 */
export async function searchGoogleBooks(
  query: string,
  maxResults: number = 20,
  startIndex: number = 0
): Promise<GoogleBooksSearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      maxResults: Math.min(maxResults, 40).toString(),
      startIndex: startIndex.toString(),
      printType: 'books',
    });

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBooksSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Google Books:', error);
    throw error;
  }
}

/**
 * Get detailed information about a specific book by ID
 * @param volumeId - Google Books volume ID
 */
export async function getGoogleBookById(volumeId: string): Promise<GoogleBook> {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes/${volumeId}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data: GoogleBook = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google Book:', error);
    throw error;
  }
}

/**
 * Search books by ISBN
 * @param isbn - ISBN-10 or ISBN-13
 */
export async function searchGoogleBooksByISBN(isbn: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`isbn:${isbn}`);
}

/**
 * Search books by author
 * @param author - Author name
 */
export async function searchGoogleBooksByAuthor(author: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`inauthor:${author}`);
}

/**
 * Search books by title
 * @param title - Book title
 */
export async function searchGoogleBooksByTitle(title: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`intitle:${title}`);
}

/**
 * Convert Google Book to our Book format
 */
export function convertGoogleBookToBook(googleBook: GoogleBook) {
  const volumeInfo = googleBook.volumeInfo;
  
  // Get the best quality image available
  const coverImage = volumeInfo.imageLinks?.large ||
    volumeInfo.imageLinks?.medium ||
    volumeInfo.imageLinks?.thumbnail ||
    volumeInfo.imageLinks?.smallThumbnail;

  // Get ISBN
  const isbn = volumeInfo.industryIdentifiers?.find(
    id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier;

  return {
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors?.join(', ') || 'Unknown Author',
    genre: volumeInfo.categories?.[0] || null,
    synopsis: volumeInfo.description || null,
    cover_image_url: coverImage ? coverImage.replace('http:', 'https:') : null,
    isbn: isbn || null,
    publisher: volumeInfo.publisher || null,
    published_date: volumeInfo.publishedDate || null,
    page_count: volumeInfo.pageCount || null,
    language: volumeInfo.language || 'en',
    google_books_id: googleBook.id,
    preview_link: volumeInfo.previewLink || null,
    info_link: volumeInfo.infoLink || null,
  };
}
