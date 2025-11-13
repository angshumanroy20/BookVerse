/**
 * External Books API Service
 * 
 * Combines Google Books and Open Library APIs for comprehensive book search
 */

import {
  searchGoogleBooks,
  searchGoogleBooksByISBN,
  searchGoogleBooksByAuthor,
  searchGoogleBooksByTitle,
  convertGoogleBookToBook,
  type GoogleBook,
} from './googleBooksApi';

import {
  searchOpenLibrary,
  searchOpenLibraryByISBN,
  searchOpenLibraryByAuthor,
  searchOpenLibraryByTitle,
  convertOpenLibraryBookToBook,
  getOpenLibraryBookDetails,
  type OpenLibraryBook,
} from './openLibraryApi';

export interface ExternalBook {
  id: string;
  source: 'google' | 'openlibrary';
  title: string;
  author: string;
  genre: string | null;
  synopsis: string | null;
  cover_image_url: string | null;
  isbn: string | null;
  publisher: string | null;
  published_date: string | null;
  page_count: number | null;
  language: string;
  preview_link?: string | null;
  info_link?: string | null;
  edition_count?: number | null;
  external_id: string;
}

export interface SearchResults {
  books: ExternalBook[];
  totalResults: number;
  source: 'google' | 'openlibrary' | 'both';
}

/**
 * Search both Google Books and Open Library
 * @param query - Search query
 * @param source - Which API to use ('google', 'openlibrary', or 'both')
 * @param limit - Maximum number of results per source
 */
export async function searchExternalBooks(
  query: string,
  source: 'google' | 'openlibrary' | 'both' = 'both',
  limit: number = 20
): Promise<SearchResults> {
  const results: ExternalBook[] = [];
  let totalResults = 0;

  try {
    if (source === 'google' || source === 'both') {
      const googleResults = await searchGoogleBooks(query, limit);
      
      if (googleResults.items) {
        const googleBooks = googleResults.items.map((book) => {
          const converted = convertGoogleBookToBook(book);
          return {
            id: `google-${book.id}`,
            source: 'google' as const,
            ...converted,
            external_id: book.id,
          };
        });
        results.push(...googleBooks);
        totalResults += googleResults.totalItems;
      }
    }

    if (source === 'openlibrary' || source === 'both') {
      const olResults = await searchOpenLibrary(query, limit);
      
      if (olResults.docs) {
        const olBooks = olResults.docs.map((book) => {
          const converted = convertOpenLibraryBookToBook(book);
          const workId = book.key?.replace('/works/', '') || book.key || '';
          return {
            id: `openlibrary-${workId}`,
            source: 'openlibrary' as const,
            ...converted,
            external_id: workId,
          };
        });
        results.push(...olBooks);
        totalResults += olResults.numFound;
      }
    }

    return {
      books: results,
      totalResults,
      source,
    };
  } catch (error) {
    console.error('Error searching external books:', error);
    throw error;
  }
}

/**
 * Search by ISBN across both APIs
 */
export async function searchExternalBooksByISBN(
  isbn: string,
  source: 'google' | 'openlibrary' | 'both' = 'both'
): Promise<SearchResults> {
  const results: ExternalBook[] = [];
  let totalResults = 0;

  try {
    if (source === 'google' || source === 'both') {
      const googleResults = await searchGoogleBooksByISBN(isbn);
      
      if (googleResults.items) {
        const googleBooks = googleResults.items.map((book) => {
          const converted = convertGoogleBookToBook(book);
          return {
            id: `google-${book.id}`,
            source: 'google' as const,
            ...converted,
            external_id: book.id,
          };
        });
        results.push(...googleBooks);
        totalResults += googleResults.totalItems;
      }
    }

    if (source === 'openlibrary' || source === 'both') {
      const olResults = await searchOpenLibraryByISBN(isbn);
      
      if (olResults.docs) {
        const olBooks = olResults.docs.map((book) => {
          const converted = convertOpenLibraryBookToBook(book);
          const workId = book.key?.replace('/works/', '') || book.key || '';
          return {
            id: `openlibrary-${workId}`,
            source: 'openlibrary' as const,
            ...converted,
            external_id: workId,
          };
        });
        results.push(...olBooks);
        totalResults += olResults.numFound;
      }
    }

    return {
      books: results,
      totalResults,
      source,
    };
  } catch (error) {
    console.error('Error searching by ISBN:', error);
    throw error;
  }
}

/**
 * Search by author across both APIs
 */
export async function searchExternalBooksByAuthor(
  author: string,
  source: 'google' | 'openlibrary' | 'both' = 'both',
  limit: number = 20
): Promise<SearchResults> {
  const results: ExternalBook[] = [];
  let totalResults = 0;

  try {
    if (source === 'google' || source === 'both') {
      const googleResults = await searchGoogleBooksByAuthor(author);
      
      if (googleResults.items) {
        const googleBooks = googleResults.items.slice(0, limit).map((book) => {
          const converted = convertGoogleBookToBook(book);
          return {
            id: `google-${book.id}`,
            source: 'google' as const,
            ...converted,
            external_id: book.id,
          };
        });
        results.push(...googleBooks);
        totalResults += googleResults.totalItems;
      }
    }

    if (source === 'openlibrary' || source === 'both') {
      const olResults = await searchOpenLibraryByAuthor(author);
      
      if (olResults.docs) {
        const olBooks = olResults.docs.slice(0, limit).map((book) => {
          const converted = convertOpenLibraryBookToBook(book);
          const workId = book.key?.replace('/works/', '') || book.key || '';
          return {
            id: `openlibrary-${workId}`,
            source: 'openlibrary' as const,
            ...converted,
            external_id: workId,
          };
        });
        results.push(...olBooks);
        totalResults += olResults.numFound;
      }
    }

    return {
      books: results,
      totalResults,
      source,
    };
  } catch (error) {
    console.error('Error searching by author:', error);
    throw error;
  }
}

/**
 * Search by title across both APIs
 */
export async function searchExternalBooksByTitle(
  title: string,
  source: 'google' | 'openlibrary' | 'both' = 'both',
  limit: number = 20
): Promise<SearchResults> {
  const results: ExternalBook[] = [];
  let totalResults = 0;

  try {
    if (source === 'google' || source === 'both') {
      const googleResults = await searchGoogleBooksByTitle(title);
      
      if (googleResults.items) {
        const googleBooks = googleResults.items.slice(0, limit).map((book) => {
          const converted = convertGoogleBookToBook(book);
          return {
            id: `google-${book.id}`,
            source: 'google' as const,
            ...converted,
            external_id: book.id,
          };
        });
        results.push(...googleBooks);
        totalResults += googleResults.totalItems;
      }
    }

    if (source === 'openlibrary' || source === 'both') {
      const olResults = await searchOpenLibraryByTitle(title);
      
      if (olResults.docs) {
        const olBooks = olResults.docs.slice(0, limit).map((book) => {
          const converted = convertOpenLibraryBookToBook(book);
          const workId = book.key?.replace('/works/', '') || book.key || '';
          return {
            id: `openlibrary-${workId}`,
            source: 'openlibrary' as const,
            ...converted,
            external_id: workId,
          };
        });
        results.push(...olBooks);
        totalResults += olResults.numFound;
      }
    }

    return {
      books: results,
      totalResults,
      source,
    };
  } catch (error) {
    console.error('Error searching by title:', error);
    throw error;
  }
}
