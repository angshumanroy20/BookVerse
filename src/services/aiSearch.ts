const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse';

export interface AISearchChunk {
  text: string;
  isComplete: boolean;
  sources?: Array<{
    uri: string;
    title: string;
  }>;
}

export async function* streamAISearch(query: string): AsyncGenerator<AISearchChunk> {
  console.log("🔍 Starting AI Search for query:", query);
  console.log("🔑 Using Gemini API key:", GEMINI_API_KEY?.substring(0, 15) + "...");

  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
    throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const bookContextPrompt = `You are a knowledgeable book expert and librarian. Help users find books based on their interests and queries. 

User query: ${query}

Please provide book recommendations, insights, or answers related to books and literature. If the query is about finding specific types of books, suggest popular and well-regarded titles in that category. Include author names and brief descriptions when relevant.`;

  try {
    const apiUrl = `${GEMINI_API_URL}&key=${GEMINI_API_KEY}`;
    console.log("📤 Sending request to Gemini API...");
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: bookContextPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      
      let errorMessage = `AI Search failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // Error text is not JSON, use as is
      }
      
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";
    let accumulatedText = "";
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Stream complete. Total chunks:", chunkCount);
          yield {
            text: accumulatedText,
            isComplete: true,
          };
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              chunkCount++;

              if (parsed.candidates && parsed.candidates.length > 0) {
                const candidate = parsed.candidates[0];

                if (candidate.content?.parts) {
                  for (const part of candidate.content.parts) {
                    if (part.text) {
                      accumulatedText += part.text;
                    }
                  }
                }

                yield {
                  text: accumulatedText,
                  isComplete: false,
                };
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e, "Data:", data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("❌ AI Search error:", error);
    throw error;
  }
}
