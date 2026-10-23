/**
 * Google Books API Service
 * 
 * Provides resilient book discovery with automatic registry fallback
 * when Google Books API rate limits (HTTP 429/403).
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
    archiveId?: string;
    pdfUrl?: string;
  };
}

export interface GoogleBooksSearchResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBook[];
}

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

/**
 * Searches Google Books API with fallback to Open Registry when rate-limited (429/403)
 */
export async function searchGoogleBooks(
  query: string,
  maxResults: number = 20,
  startIndex: number = 0
): Promise<GoogleBooksSearchResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { kind: 'books#volumes', totalItems: 0, items: [] };

  // Parse prefixes if present
  let titleParam = '';
  let authorParam = '';
  let isbnParam = '';
  let genericQuery = cleanQuery;

  if (cleanQuery.startsWith('intitle:')) {
    titleParam = cleanQuery.replace('intitle:', '').trim();
    genericQuery = titleParam;
  } else if (cleanQuery.startsWith('inauthor:')) {
    authorParam = cleanQuery.replace('inauthor:', '').trim();
    genericQuery = authorParam;
  } else if (cleanQuery.startsWith('isbn:')) {
    isbnParam = cleanQuery.replace('isbn:', '').trim();
    genericQuery = isbnParam;
  }

  // 1. Try Google Books API
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    const params = new URLSearchParams({
      q: cleanQuery,
      maxResults: Math.min(maxResults, 40).toString(),
      startIndex: startIndex.toString(),
      printType: 'books',
    });
    if (apiKey) {
      params.append('key', apiKey);
    }

    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes?${params}`);
    
    if (response.ok) {
      const data: GoogleBooksSearchResponse = await response.json();
      if (data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Google Books API direct fetch unavailable, using registry fallback:', error);
  }

  // 2. Resilient Open Library / Internet Archive Fallback
  try {
    let openLibUrl = `https://openlibrary.org/search.json?limit=${maxResults}`;
    if (titleParam) {
      openLibUrl += `&title=${encodeURIComponent(titleParam)}`;
    } else if (authorParam) {
      openLibUrl += `&author=${encodeURIComponent(authorParam)}`;
    } else if (isbnParam) {
      openLibUrl += `&isbn=${encodeURIComponent(isbnParam)}`;
    } else {
      openLibUrl += `&q=${encodeURIComponent(genericQuery)}`;
    }

    const fallbackRes = await fetch(openLibUrl);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      const docs = fbData.docs || [];
      const fallbackItems: GoogleBook[] = docs.map((doc: any, index: number) => {
        const id = doc.key?.replace('/works/', '') || `gb-${index}`;
        const title = doc.title || genericQuery;
        const authors = doc.author_name || ['Unknown Author'];
        const coverId = doc.cover_i;
        const coverUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : undefined;
        const googleBooksLink = `https://books.google.com/books?q=${encodeURIComponent(title + ' ' + (authors[0] || ''))}`;
        
        // Extract real Internet Archive embed if available
        const iaList = Array.isArray(doc.ia) ? doc.ia : (doc.ia ? [doc.ia] : []);
        const validIa = iaList.find((ia: string) => ia && !ia.startsWith('openlibrary'));
        const archiveEmbedUrl = validIa ? `https://archive.org/embed/${validIa}` : undefined;

        return {
          id: `gb-${id}`,
          volumeInfo: {
            title,
            authors,
            publisher: doc.publisher?.[0] || 'Published Edition',
            publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
            description: doc.first_sentence 
              ? (Array.isArray(doc.first_sentence) ? doc.first_sentence[0] : doc.first_sentence)
              : `Explore editions, reviews, and reading options for "${title}" by ${authors.join(', ')} on Google Books.`,
            pageCount: doc.number_of_pages_median || undefined,
            categories: doc.subject ? doc.subject.slice(0, 3) : ['Literature'],
            imageLinks: coverUrl ? { thumbnail: coverUrl, medium: coverUrl, large: coverUrl } : undefined,
            previewLink: archiveEmbedUrl || googleBooksLink,
            infoLink: googleBooksLink,
            archiveId: validIa,
            pdfUrl: archiveEmbedUrl,
            language: doc.language ? (Array.isArray(doc.language) ? doc.language[0] : doc.language) : 'en',
          },
        };
      });

      return {
        kind: 'books#volumes',
        totalItems: fbData.numFound || fallbackItems.length,
        items: fallbackItems,
      };
    }
  } catch (fallbackError) {
    console.warn('Google Books fallback error:', fallbackError);
  }

  return { kind: 'books#volumes', totalItems: 0, items: [] };
}

export async function getGoogleBookById(volumeId: string): Promise<GoogleBook> {
  const cleanId = volumeId.replace('gb-', '');
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_BASE}/volumes/${cleanId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Error fetching Google Book by ID:', error);
  }

  return {
    id: volumeId,
    volumeInfo: {
      title: 'Book Details',
      previewLink: `https://books.google.com/books?id=${cleanId}`,
    },
  };
}

export async function searchGoogleBooksByISBN(isbn: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`isbn:${isbn}`);
}

export async function searchGoogleBooksByAuthor(author: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`inauthor:${author}`);
}

export async function searchGoogleBooksByTitle(title: string): Promise<GoogleBooksSearchResponse> {
  return searchGoogleBooks(`intitle:${title}`);
}

export function convertGoogleBookToBook(googleBook: GoogleBook) {
  const volumeInfo = googleBook.volumeInfo;
  const coverImage =
    volumeInfo.imageLinks?.large ||
    volumeInfo.imageLinks?.medium ||
    volumeInfo.imageLinks?.thumbnail ||
    volumeInfo.imageLinks?.smallThumbnail;

  const isbn = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier;

  return {
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors?.join(', ') || 'Unknown Author',
    genre: volumeInfo.categories?.[0] || 'Literature',
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
    pdf_url: volumeInfo.pdfUrl || (volumeInfo.archiveId ? `https://archive.org/embed/${volumeInfo.archiveId}` : null),
  };
}
