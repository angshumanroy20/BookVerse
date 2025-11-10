const APP_ID = import.meta.env.VITE_APP_ID;
const AI_SEARCH_URL = "https://api-integrations.appmedo.com/app-7flusvzm3281/api-DLEOVEz2yxwa/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse";

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
  console.log("📱 APP_ID:", APP_ID);
  console.log("🔗 API URL:", AI_SEARCH_URL);

  const bookContextPrompt = `You are a knowledgeable book expert and librarian. Help users find books based on their interests and queries. 

User query: ${query}

Please provide book recommendations, insights, or answers related to books and literature. If the query is about finding specific types of books, suggest popular and well-regarded titles in that category. Include author names and brief descriptions when relevant.`;

  try {
    console.log("📤 Sending request to AI Search API...");
    
    const response = await fetch(AI_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": APP_ID,
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
      }),
    });

    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error:", errorText);
      throw new Error(`AI Search failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("Response body is not readable");
    }

    let buffer = "";
    let accumulatedText = "";
    let sources: Array<{ uri: string; title: string }> = [];
    let chunkCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Stream complete. Total chunks:", chunkCount);
          yield {
            text: accumulatedText,
            isComplete: true,
            sources: sources.length > 0 ? sources : undefined,
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

                if (candidate.groundingMetadata?.groundingChunks) {
                  const chunks = candidate.groundingMetadata.groundingChunks;
                  for (const chunk of chunks) {
                    if (chunk.web && !sources.some(s => s.uri === chunk.web.uri)) {
                      sources.push({
                        uri: chunk.web.uri,
                        title: chunk.web.title,
                      });
                    }
                  }
                }

                yield {
                  text: accumulatedText,
                  isComplete: false,
                  sources: sources.length > 0 ? sources : undefined,
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
