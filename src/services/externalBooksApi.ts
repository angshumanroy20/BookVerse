/**
 * External Books API Service
 * 
 * Combines Anna's Archive, Open Library, and Google Books APIs
 * for comprehensive global multi-source book search.
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

import {
  searchAnnasArchive,
  type AnnasBook,
} from './annasArchiveApi';

export interface ExternalBook {
  id: string;
  source: 'annas' | 'openlibrary' | 'google';
  title: string;
  author: string;
  genre: string | null;
  synopsis: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  download_url?: string | null;
  annas_search_url?: string | null;
  file_format?: 'PDF' | 'EPUB' | 'Web' | string;
  file_size?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  published_date?: string | null;
  page_count?: number | null;
  language: string;
  preview_link?: string | null;
  info_link?: string | null;
  edition_count?: number | null;
  external_id: string;
}

export type ExternalSearchSource = 'all' | 'annas' | 'openlibrary' | 'google' | 'both';

export interface SearchResults {
  books: ExternalBook[];
  totalResults: number;
  source: ExternalSearchSource;
}

/**
 * Search across Anna's Archive, Open Library, and Google Books
 * @param query - Search query
 * @param source - Selected search source
 * @param limit - Maximum number of results per provider
 */
export async function searchExternalBooks(
  query: string,
  source: ExternalSearchSource = 'all',
  limit = 20
): Promise<SearchResults> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { books: [], totalResults: 0, source };
  }

  const results: ExternalBook[] = [];
  let totalResults = 0;

  const tasks: Promise<void>[] = [];

  // 1. Anna's Archive & Open Texts
  if (source === 'all' || source === 'annas' || source === 'both') {
    tasks.push(
      searchAnnasArchive(cleanQuery, limit)
        .then((res) => {
          const annasBooks: ExternalBook[] = res.books.map((b) => ({
            id: b.id,
            source: 'annas',
            title: b.title,
            author: b.author,
            genre: b.genre || 'Shadow Library',
            synopsis: b.synopsis,
            cover_image_url: b.cover_image_url,
            pdf_url: b.pdf_url,
            download_url: b.download_url,
            annas_search_url: b.annas_search_url,
            file_format: b.file_format,
            file_size: b.file_size,
            publisher: b.publisher,
            published_date: b.published_date,
            language: b.language,
            external_id: b.identifier,
          }));
          results.push(...annasBooks);
          totalResults += res.totalResults;
        })
        .catch((err) => {
          console.warn("Anna's Archive provider error:", err);
        })
    );
  }

  // 2. Open Library
  if (source === 'all' || source === 'openlibrary' || source === 'both') {
    tasks.push(
      searchOpenLibrary(cleanQuery, limit)
        .then((olResults) => {
          if (olResults.docs) {
            const olBooks: ExternalBook[] = olResults.docs.map((book) => {
              const converted = convertOpenLibraryBookToBook(book);
              const workId = book.key?.replace('/works/', '') || book.key || '';
              return {
                id: `openlibrary-${workId}`,
                source: 'openlibrary',
                ...converted,
                download_url: converted.pdf_url || `https://openlibrary.org${book.key || ''}`,
                file_format: converted.pdf_url ? 'PDF' : 'Web',
                external_id: workId,
              };
            });
            results.push(...olBooks);
            totalResults += olResults.numFound || olBooks.length;
          }
        })
        .catch((err) => {
          console.warn('Open Library provider error:', err);
        })
    );
  }

  // 3. Google Books (safe fallback)
  if (source === 'all' || source === 'google' || source === 'both') {
    tasks.push(
      searchGoogleBooks(cleanQuery, limit)
        .then((googleResults) => {
          if (googleResults.items) {
            const googleBooks: ExternalBook[] = googleResults.items.map((book) => {
              const converted = convertGoogleBookToBook(book);
              return {
                id: `google-${book.id}`,
                source: 'google',
                ...converted,
                pdf_url: null,
                download_url: converted.preview_link || converted.info_link,
                file_format: 'Web',
                external_id: book.id,
              };
            });
            results.push(...googleBooks);
            totalResults += googleResults.totalItems || googleBooks.length;
          }
        })
        .catch((err) => {
          console.warn('Google Books provider error:', err);
        })
    );
  }

  await Promise.allSettled(tasks);

  // Deduplicate by title & author lowercase match
  const seen = new Set<string>();
  const deduplicated: ExternalBook[] = [];

  for (const b of results) {
    const key = `${b.title.toLowerCase().trim()}|${b.author.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(b);
    }
  }

  return {
    books: deduplicated,
    totalResults: Math.max(totalResults, deduplicated.length),
    source,
  };
}

/**
 * Search by specific criteria
 */
export async function searchByCriteria(
  criteria: 'title' | 'author' | 'isbn',
  value: string,
  source: ExternalSearchSource = 'all',
  limit = 20
): Promise<SearchResults> {
  const query = criteria === 'title' ? `intitle:${value}` : criteria === 'author' ? `inauthor:${value}` : `isbn:${value}`;
  return searchExternalBooks(query, source, limit);
}
