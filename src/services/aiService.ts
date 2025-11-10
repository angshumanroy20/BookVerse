import { sendMessageToGemini, type ChatMessage as GeminiChatMessage } from './gemini';
import { sendMessageToOpenAI, type ChatMessage as OpenAIChatMessage } from './openai';

export type AIModel = 'gemini' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MODEL_STORAGE_KEY = 'biblios_ai_model';

export function getSelectedModel(): AIModel {
  const stored = localStorage.getItem(MODEL_STORAGE_KEY);
  return (stored === 'openai' || stored === 'gemini') ? stored : 'gemini';
}

export function setSelectedModel(model: AIModel): void {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
}

export async function sendMessage(
  message: string,
  conversationHistory: ChatMessage[] = [],
  model?: AIModel
): Promise<string> {
  const selectedModel = model || getSelectedModel();
  
  console.log(`🤖 Using AI model: ${selectedModel}`);
  
  try {
    if (selectedModel === 'openai') {
      return await sendMessageToOpenAI(message, conversationHistory as OpenAIChatMessage[]);
    } else {
      return await sendMessageToGemini(message, conversationHistory as GeminiChatMessage[]);
    }
  } catch (error) {
    console.error(`Error with ${selectedModel} model:`, error);
    throw error;
  }
}

export function getModelDisplayName(model: AIModel): string {
  switch (model) {
    case 'gemini':
      return 'Google Gemini';
    case 'openai':
      return 'OpenAI GPT';
    default:
      return 'Unknown';
  }
}

export function getModelIcon(model: AIModel): string {
  switch (model) {
    case 'gemini':
      return '✨';
    case 'openai':
      return '🤖';
    default:
      return '💬';
  }
}
