const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessageToOpenAI(message: string, conversationHistory: ChatMessage[] = []): Promise<string> {
  try {
    // Check API key
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-api-key-here') {
      console.error('❌ OpenAI API key not configured');
      return "OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.";
    }

    console.log('✅ OpenAI API key found:', OPENAI_API_KEY.substring(0, 15) + '...');

    // Build conversation history in OpenAI format
    const messages = [];
    
    // Add system message for context
    messages.push({
      role: 'system',
      content: 'You are a helpful AI assistant for Biblios, a book management and discovery platform. Help users discover books, answer questions about literature, and provide reading recommendations.'
    });

    // Add conversation history (excluding the initial greeting message)
    for (const msg of conversationHistory) {
      // Skip the initial greeting message
      if (msg.role === 'assistant' && (msg.content.includes('Biblios AI assistant') || msg.content.includes('BookVerse AI assistant'))) {
        continue;
      }
      
      messages.push({
        role: msg.role,
        content: msg.content
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.9,
      max_tokens: 2048,
    };

    console.log('📤 Sending request to OpenAI API...');
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
          if (errorData.error.message.includes('API key')) {
            errorMessage += '\n\n🔑 Your OpenAI API key appears to be invalid. Please verify it in your OpenAI dashboard.';
          } else if (errorData.error.message.includes('quota') || errorData.error.code === 'insufficient_quota') {
            return "⚠️ OpenAI Service Temporarily Unavailable\n\nThe OpenAI API has reached its usage limit. Please try switching to the Gemini model or try again later.\n\nYou can still browse books, search by genre/author, and use all other features of the platform.";
          } else if (response.status === 429) {
            return "⚠️ OpenAI Rate Limit Reached\n\nToo many requests to OpenAI. Please wait a moment and try again, or switch to the Gemini model.\n\nYou can still browse books and use other platform features.";
          }
        } else {
          errorMessage += errorText;
        }
      } catch (e) {
        // Handle 429 status even if JSON parsing fails
        if (response.status === 429) {
          return "⚠️ OpenAI Service Temporarily Unavailable\n\nThe OpenAI API rate limit has been reached. Please try the Gemini model or try again later.";
        }
        errorMessage += errorText;
        console.error('❌ Could not parse error response');
      }
      
      return errorMessage;
    }

    const data = await response.json();
    console.log('✅ Received response from OpenAI API');
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      
      // Check if response was blocked
      if (choice.finish_reason === 'content_filter') {
        console.warn('⚠️ Response blocked by content filter');
        return "I apologize, but I cannot respond to that message due to content safety filters. Please try rephrasing your question.";
      }
      
      if (choice.message && choice.message.content) {
        const responseText = choice.message.content;
        console.log('✅ Successfully extracted response text');
        console.log('💬 Response:', responseText.substring(0, 100) + '...');
        return responseText;
      }
    }

    console.error('❌ Unexpected API response structure:', data);
    return "Received an unexpected response format from the OpenAI API. Please check the console for details.";
    
  } catch (error) {
    console.error('❌ Exception calling OpenAI API:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "Network error: Unable to connect to OpenAI API. Please check your internet connection.";
    }
    
    return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please check the console for details.`;
  }
}
