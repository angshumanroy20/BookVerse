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

async function getBotUserId(): Promise<string> {
  // Check if bot user exists
  const { data: existingBot } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", "biblios_bot")
    .maybeSingle();

  if (existingBot) {
    return existingBot.id;
  }

  // Create a bot user if it doesn't exist
  // First create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "bot@biblios.internal",
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: {
      username: "biblios_bot",
      role: "bot"
    }
  });

  if (authError || !authData.user) {
    throw new Error(`Failed to create bot user: ${authError?.message}`);
  }

  // Create profile
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      username: "biblios_bot",
      email: "bot@biblios.internal",
      role: "bot"
    });

  if (profileError) {
    console.error("Error creating bot profile:", profileError);
  }

  return authData.user.id;
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
  try {
    // Verify request is from cron or has valid authorization
    const authHeader = req.headers.get("authorization");
    const cronHeader = req.headers.get("x-supabase-cron");
    
    if (!cronHeader && authHeader !== `Bearer ${Deno.env.get("FUNCTION_SECRET")}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Starting book upload bot...");

    // Get or create bot user
    const botUserId = await getBotUserId();
    console.log(`Bot user ID: ${botUserId}`);

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

    // Upload books
    let uploadedCount = 0;
    let skippedCount = 0;

    for (const book of allBooks) {
      const uploaded = await uploadBook(book, botUserId);
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
        subjects_processed: selectedSubjects
      }
    };

    console.log("Bot completed:", result);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Connection": "keep-alive"
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
          "Connection": "keep-alive"
        } 
      }
    );
  }
});
