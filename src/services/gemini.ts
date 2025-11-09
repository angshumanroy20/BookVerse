const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback responses for when API is unavailable
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Book recommendations
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return "I'd love to help you discover new books! Based on popular choices, I recommend:\n\n📚 Fiction: 'The Midnight Library' by Matt Haig - A beautiful story about life's infinite possibilities\n📚 Mystery: 'The Thursday Murder Club' by Richard Osman - A delightful cozy mystery\n📚 Fantasy: 'The House in the Cerulean Sea' by TJ Klune - A heartwarming magical tale\n\nWhat genre interests you most?";
  }
  
  // Genre questions
  if (lowerMessage.includes('genre') || lowerMessage.includes('type')) {
    return "BookVerse has a wide variety of genres including:\n\n• Fiction & Literary\n• Mystery & Thriller\n• Fantasy & Sci-Fi\n• Romance\n• Non-Fiction\n• Biography\n• Self-Help\n\nWhich genre would you like to explore?";
  }
  
  // Reading questions
  if (lowerMessage.includes('read') || lowerMessage.includes('reading')) {
    return "Reading is a wonderful journey! Here are some tips:\n\n✨ Set aside dedicated reading time each day\n✨ Find a comfortable, quiet space\n✨ Start with books that genuinely interest you\n✨ Join a book club for motivation\n\nWhat are you currently reading?";
  }
  
  // Help questions
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return "I'm here to help! You can:\n\n• Browse books by genre, author, or rating\n• Get personalized book recommendations\n• Create reading lists\n• Track your reading progress\n• Write reviews and ratings\n\nWhat would you like to do?";
  }
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! 👋 Welcome to BookVerse! I'm here to help you discover amazing books and enhance your reading experience. What can I help you with today?";
  }
  
  // Default response
  return "That's an interesting question! While I'm currently in demo mode, I can help you with:\n\n📖 Book recommendations\n📚 Genre exploration\n✍️ Reading tips\n🔍 Platform features\n\nFeel free to ask me anything about books or reading!";
}

export async function sendMessageToGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
      console.warn('Gemini API key not configured, using fallback responses');
      return getFallbackResponse(message);
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

    // Ensure we start with a user message (Gemini requirement)
    if (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log('Sending request to Gemini API...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Gemini API error response:', errorData);
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Could not parse error response');
      }
      
      // Use fallback for API errors
      console.warn('API request failed, using fallback response');
      return getFallbackResponse(message);
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
      console.warn('Content blocked, using fallback response');
      return getFallbackResponse(message);
    }

    console.error('Unexpected API response structure:', data);
    // Use fallback for unexpected responses
    return getFallbackResponse(message);
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Use fallback for any errors
    console.warn('Using fallback response due to error');
    return getFallbackResponse(message);
  }
}
