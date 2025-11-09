const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessageToGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
      throw new Error('Gemini API key is not configured. Please add your API key to the .env file.');
    }

    // Build conversation history in Gemini format
    const contents = [];
    
    // Add conversation history (excluding the initial system message)
    for (const msg of conversationHistory) {
      // Skip the initial greeting message
      if (msg.role === 'assistant' && msg.content.includes('BookVerse AI assistant')) {
        continue;
      }
      
      // Gemini requires alternating user/model messages
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Ensure we start with a user message
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    console.log('Sending request to Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Could not parse error response');
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Received response from Gemini API');
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
    }

    // Check if content was blocked
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }

    throw new Error('No valid response received from Gemini API');
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with AI service');
  }
}
