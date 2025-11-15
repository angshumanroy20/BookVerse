import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPEN_LIBRARY_API = "https://openlibrary.org";

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface BookData {
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  cover_url: string;
  isbn?: string;
}

// Predefined list of popular books to fetch
const BOOK_SUBJECTS = [
  "fiction",
  "science_fiction",
  "fantasy",
  "mystery",
  "thriller",
  "romance",
  "horror",
  "biography",
  "history",
  "philosophy",
  "psychology",
  "business",
  "self_help",
  "poetry",
  "drama"
];

async function fetchBooksFromOpenLibrary(subject: string, limit = 5): Promise<BookData[]> {
  try {
    const response = await fetch(
      `${OPEN_LIBRARY_API}/subjects/${subject}.json?limit=${limit}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch books for subject: ${subject}`);
      return [];
    }

    const data = await response.json();
    const books: BookData[] = [];

    for (const work of data.works || []) {
      try {
        // Get more details about the work
        const workResponse = await fetch(`${OPEN_LIBRARY_API}${work.key}.json`);
        const workData = await workResponse.json();

        // Get the highest quality cover image
        let coverUrl = "https://via.placeholder.com/400x600?text=No+Cover";
        if (work.cover_id) {
          // Try to get original size first (highest quality)
          coverUrl = `https://covers.openlibrary.org/b/id/${work.cover_id}.jpg`;
          
          // Verify the image exists and is high quality
          try {
            const imgResponse = await fetch(coverUrl, { method: 'HEAD' });
            if (!imgResponse.ok) {
              // Fallback to large size if original doesn't exist
              coverUrl = `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`;
            }
          } catch {
            // If fetch fails, use large size as fallback
            coverUrl = `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`;
          }
        }

        const book: BookData = {
          title: work.title || "Unknown Title",
          author: work.authors?.[0]?.name || "Unknown Author",
          genre: subject.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
          synopsis: workData.description?.value || workData.description || work.first_sentence?.value || "No description available.",
          cover_url: coverUrl,
          isbn: work.isbn?.[0]
        };

        // Truncate synopsis if too long
        if (book.synopsis.length > 500) {
          book.synopsis = book.synopsis.substring(0, 497) + "...";
        }

        books.push(book);
      } catch (error) {
        console.error(`Error processing book: ${work.title}`, error);
      }
    }

    return books;
  } catch (error) {
    console.error(`Error fetching books for subject ${subject}:`, error);
    return [];
  }
}

async function getAdminProfile(adminId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, role")
    .eq("id", adminId)
    .maybeSingle();

  if (error || !profile) {
    throw new Error("Admin profile not found");
  }

  if (profile.role !== "admin") {
    throw new Error("User is not an admin");
  }

  return profile;
}

async function uploadBook(book: BookData, botUserId: string): Promise<boolean> {
  try {
    // Check if book already exists (by title and author)
    const { data: existingBook } = await supabase
      .from("books")
      .select("id")
      .eq("title", book.title)
      .eq("author", book.author)
      .maybeSingle();

    if (existingBook) {
      console.log(`Book already exists: ${book.title}`);
      return false;
    }

    // Insert book
    const { error } = await supabase
      .from("books")
      .insert({
        title: book.title,
        author: book.author,
        genre: book.genre,
        synopsis: book.synopsis,
        cover_image_url: book.cover_url,
        created_by: botUserId,
        isbn: book.isbn
      });

    if (error) {
      console.error(`Error uploading book ${book.title}:`, error);
      return false;
    }

    console.log(`Successfully uploaded: ${book.title}`);
    return true;
  } catch (error) {
    console.error(`Error uploading book ${book.title}:`, error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Parse request body to get admin ID
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    const adminId = body.adminId;

    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "Admin ID is required" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          } 
        }
      );
    }

    console.log("Starting book upload bot...");
    console.log(`Admin ID: ${adminId}`);

    // Verify admin profile
    const adminProfile = await getAdminProfile(adminId);
    console.log(`Admin username: ${adminProfile.username}`);

    // Fetch books from multiple subjects
    const booksPerSubject = 3; // Adjust this number
    const allBooks: BookData[] = [];

    // Randomly select a few subjects to keep variety
    const selectedSubjects = BOOK_SUBJECTS
      .sort(() => Math.random() - 0.5)
      .slice(0, 5); // Select 5 random subjects

    for (const subject of selectedSubjects) {
      console.log(`Fetching books for subject: ${subject}`);
      const books = await fetchBooksFromOpenLibrary(subject, booksPerSubject);
      allBooks.push(...books);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Fetched ${allBooks.length} books total`);

    // Upload books using admin's ID
    let uploadedCount = 0;
    let skippedCount = 0;

    for (const book of allBooks) {
      const uploaded = await uploadBook(book, adminProfile.id);
      if (uploaded) {
        uploadedCount++;
      } else {
        skippedCount++;
      }
      
      // Add small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const result = {
      success: true,
      message: "Book upload bot completed",
      stats: {
        total_fetched: allBooks.length,
        uploaded: uploadedCount,
        skipped: skippedCount,
        subjects_processed: selectedSubjects,
        uploaded_by: adminProfile.username
      }
    };

    console.log("Bot completed:", result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  } catch (error) {
    console.error("Error in book upload bot:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
});
