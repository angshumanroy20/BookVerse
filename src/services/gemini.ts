const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Fallback responses for when API is unavailable
function getFallbackResponse(message: string): string {
  return "I'm currently experiencing connectivity issues with the AI service. Please check the browser console for detailed error information, or try again in a moment. If the issue persists, please verify that:\n\n1. Your Gemini API key is valid and active\n2. The API key has the Gemini API enabled in Google Cloud Console\n3. Billing is enabled for your Google Cloud project\n4. You haven't exceeded API quota limits";
}

export async function sendMessageToGemini(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    // Check API key
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-api-key-here') {
      console.error('❌ Gemini API key not configured');
      return "API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.";
    }

    console.log('✅ API key found:', GEMINI_API_KEY.substring(0, 15) + '...');

    // Build conversation history in Gemini format
    const contents = [];
    
    // Add conversation history (excluding the initial greeting message)
    for (const msg of conversationHistory) {
      // Skip the initial greeting message
      if (msg.role === 'assistant' && msg.content.includes('BookVerse AI assistant')) {
        continue;
      }
      
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
    while (contents.length > 0 && contents[0].role === 'model') {
      contents.shift();
    }

    // Ensure alternating messages
    for (let i = 1; i < contents.length; i++) {
      if (contents[i].role === contents[i - 1].role) {
        // Remove duplicate consecutive roles
        contents.splice(i, 1);
        i--;
      }
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    console.log('📤 Sending request to Gemini API...');
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log('🔗 API URL:', GEMINI_API_URL);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      let errorMessage = `API Error (${response.status}): `;
      
      try {
        const errorData = JSON.parse(errorText);
        console.error('❌ Parsed error:', errorData);
        
        if (errorData.error?.message) {
          errorMessage += errorData.error.message;
          console.error('❌ Error message:', errorData.error.message);
          
          // Provide specific guidance based on error
          if (errorData.error.message.includes('API key not valid')) {
            errorMessage += '\n\n🔑 Your API key appears to be invalid. Please verify it in Google AI Studio.';
          } else if (errorData.error.message.includes('API key not found')) {
            errorMessage += '\n\n🔑 API key not found. Please check your .env file.';
          } else if (errorData.error.message.includes('billing')) {
            errorMessage += '\n\n💳 Billing must be enabled for this API key.';
          } else if (errorData.error.message.includes('quota')) {
            errorMessage += '\n\n📊 API quota exceeded. Please check your usage limits.';
          }
        } else {
          errorMessage += errorText;
        }
      } catch (e) {
        errorMessage += errorText;
        console.error('❌ Could not parse error response');
      }
      
      return errorMessage;
    }

    const data = await response.json();
    console.log('✅ Received response from Gemini API');
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      // Check if response was blocked
      if (candidate.finishReason === 'SAFETY') {
        console.warn('⚠️ Response blocked by safety filters');
        return "I apologize, but I cannot respond to that message due to content safety filters. Please try rephrasing your question.";
      }
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const responseText = candidate.content.parts[0].text;
        console.log('✅ Successfully extracted response text');
        console.log('💬 Response:', responseText.substring(0, 100) + '...');
        return responseText;
      }
    }

    // Check if content was blocked at prompt level
    if (data.promptFeedback?.blockReason) {
      console.warn('⚠️ Prompt blocked:', data.promptFeedback.blockReason);
      return "I apologize, but your message was blocked by content safety filters. Please try rephrasing your question.";
    }

    console.error('❌ Unexpected API response structure:', data);
    return "Received an unexpected response format from the API. Please check the console for details.";
    
  } catch (error) {
    console.error('❌ Exception calling Gemini API:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "Network error: Unable to connect to Gemini API. Please check your internet connection.";
    }
    
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check the console for details.`;
  }
}
