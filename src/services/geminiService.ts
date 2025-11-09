import type { Book } from "@/types/types";

const APP_ID = import.meta.env.VITE_APP_ID;
const API_URL = "https://api-integrations.appmedo.com/app-7flusvzm3281/api-rLob8RdzAOl9/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse";

export async function getBookRecommendations(
  currentBook: Book,
  allBooks: Book[]
): Promise<Book[]> {
  try {
    const prompt = `Based on the book "${currentBook.title}" by ${currentBook.author} (Genre: ${currentBook.genre || "Unknown"}), recommend 3-5 similar books from this list. Return ONLY the book titles as a JSON array of strings, nothing else.

Available books:
${allBooks.map((b) => `- "${b.title}" by ${b.author} (${b.genre || "Unknown"})`).join("\n")}

Return format: ["Book Title 1", "Book Title 2", "Book Title 3"]`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullText += text;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    const jsonMatch = fullText.match(/\[.*\]/s);
    if (!jsonMatch) {
      return [];
    }

    const recommendedTitles: string[] = JSON.parse(jsonMatch[0]);

    const recommendedBooks = allBooks.filter((book) =>
      recommendedTitles.some((title) =>
        book.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(book.title.toLowerCase())
      )
    );

    return recommendedBooks.slice(0, 5);
  } catch (error) {
    console.error("Error getting recommendations:", error);
    const sameGenreBooks = allBooks
      .filter((b) => b.id !== currentBook.id && b.genre === currentBook.genre)
      .slice(0, 5);
    return sameGenreBooks;
  }
}

export async function getPersonalizedRecommendations(
  readBooks: Book[],
  allBooks: Book[]
): Promise<Book[]> {
  if (readBooks.length === 0) {
    return allBooks.slice(0, 6);
  }

  try {
    const prompt = `Based on these books the user has read:
${readBooks.map((b) => `- "${b.title}" by ${b.author} (${b.genre || "Unknown"})`).join("\n")}

Recommend 5-6 books from this list that they might enjoy. Return ONLY the book titles as a JSON array of strings.

Available books:
${allBooks.map((b) => `- "${b.title}" by ${b.author} (${b.genre || "Unknown"})`).join("\n")}

Return format: ["Book Title 1", "Book Title 2", "Book Title 3"]`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get recommendations");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullText += text;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    const jsonMatch = fullText.match(/\[.*\]/s);
    if (!jsonMatch) {
      return allBooks.slice(0, 6);
    }

    const recommendedTitles: string[] = JSON.parse(jsonMatch[0]);

    const recommendedBooks = allBooks.filter((book) =>
      recommendedTitles.some((title) =>
        book.title.toLowerCase().includes(title.toLowerCase()) ||
        title.toLowerCase().includes(book.title.toLowerCase())
      )
    );

    return recommendedBooks.slice(0, 6);
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    return allBooks.slice(0, 6);
  }
}
