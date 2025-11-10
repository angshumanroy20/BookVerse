# Biblios AI Chatbot - Multi-Model Support

## Overview
The Biblios AI chatbot now supports **two AI models** with seamless switching capability, providing users with redundancy and flexibility.

## Supported Models

### 🌟 Google Gemini (Default)
- **Model**: Gemini 1.5 Flash
- **Icon**: ✨ Sparkles
- **Best For**: Fast responses, general book recommendations
- **Free Tier**: 60 requests/minute

### 🤖 OpenAI GPT
- **Model**: GPT-3.5 Turbo  
- **Icon**: 🤖 CPU
- **Best For**: Detailed literary discussions, high-quality responses
- **Pricing**: Pay-as-you-go (~$0.002/1K tokens)

## Key Features

### 1. **Model Switching**
Users can switch between AI models at any time using the dropdown selector in the chat header.

**How it works:**
- Click the dropdown labeled "AI Model"
- Select either "Google Gemini" or "OpenAI GPT"
- The chatbot confirms the switch with a message
- Your preference is saved for future sessions

### 2. **Redundancy & Reliability**
If one model is unavailable (quota exceeded, rate limits, API issues), users can instantly switch to the alternative model.

**Error Scenarios Handled:**
- ✅ API key not configured
- ✅ Quota exceeded
- ✅ Rate limits reached
- ✅ Network connectivity issues
- ✅ Billing not enabled

### 3. **Persistent Preferences**
The selected model is stored in `localStorage`, so users don't need to re-select their preferred model each time they open the chatbot.

### 4. **Conversation Context**
Both models maintain conversation history, allowing for contextual follow-up questions and natural dialogue flow.

### 5. **User-Friendly Error Messages**
When errors occur, the chatbot provides:
- Clear explanation of what went wrong
- Specific guidance on how to fix it
- Suggestions to switch models if applicable
- Alternative features to use while AI is unavailable

## UI Components

### Chat Header
```
┌─────────────────────────────────────┐
│ 🤖 Biblios AI              ✕       │
│    Your Literary Assistant          │
│                                     │
│ AI Model: [Google Gemini ▼]        │
└─────────────────────────────────────┘
```

### Model Selector Dropdown
```
┌─────────────────────────┐
│ ✨ Google Gemini        │ ← Currently selected
│ 🤖 OpenAI GPT           │
└─────────────────────────┘
```

### Model Switch Confirmation
```
Assistant: Switched to OpenAI GPT. How can I assist you?
```

## Technical Architecture

### Service Layer
```
src/services/
├── gemini.ts       # Google Gemini API integration
├── openai.ts       # OpenAI API integration
└── aiService.ts    # Unified interface for both models
```

### Key Functions

**aiService.ts:**
- `getSelectedModel()` - Retrieves user's saved preference
- `setSelectedModel(model)` - Saves user's model choice
- `sendMessage(message, history, model)` - Routes to appropriate AI service
- `getModelDisplayName(model)` - Returns human-readable name
- `getModelIcon(model)` - Returns emoji icon for model

### Data Flow
```
User Input
    ↓
AIChatbot Component
    ↓
aiService.sendMessage()
    ↓
    ├─→ gemini.ts (if Gemini selected)
    └─→ openai.ts (if OpenAI selected)
    ↓
AI Provider API
    ↓
Response to User
```

## Configuration

### Environment Variables
```env
# Google Gemini API Key
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# OpenAI API Key  
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### Getting API Keys

**Google Gemini:**
1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Add to `.env` file

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Create secret key
3. Add to `.env` file

## Error Handling Examples

### Quota Exceeded (Gemini)
```
⚠️ Gemini Service Temporarily Unavailable

The Gemini API has reached its usage limit. Please try 
switching to the OpenAI model or try again later.

You can still browse books, search by genre/author, and 
use all other features of the platform.
```

### Rate Limit (OpenAI)
```
⚠️ OpenAI Rate Limit Reached

Too many requests to OpenAI. Please wait a moment and 
try again, or switch to the Gemini model.

You can still browse books and use other platform features.
```

### API Key Not Configured
```
OpenAI API key is not configured. Please add 
VITE_OPENAI_API_KEY to your .env file.
```

## Benefits

### For Users
- ✅ **Reliability**: Always have a backup if one model fails
- ✅ **Choice**: Select preferred AI model based on response quality
- ✅ **Continuity**: Keep chatting even if one service has issues
- ✅ **Flexibility**: Switch models mid-conversation

### For Developers
- ✅ **Redundancy**: Multiple AI providers reduce single point of failure
- ✅ **Cost Management**: Balance between free and paid tiers
- ✅ **Scalability**: Easy to add more models in the future
- ✅ **Maintainability**: Clean separation of concerns with service layer

## Future Enhancements

Potential improvements for future versions:
- Add more AI models (Claude, Llama, etc.)
- Automatic fallback if primary model fails
- Model performance comparison
- Usage statistics per model
- Custom model parameters (temperature, max tokens)
- Model-specific system prompts

## Testing Checklist

- [x] Model switching works correctly
- [x] Conversation history maintained across switches
- [x] Error messages display properly
- [x] localStorage saves preference
- [x] Both models handle context correctly
- [x] UI updates reflect current model
- [x] Graceful degradation when API key missing
- [x] Rate limit errors handled appropriately

## Support

For issues or questions:
1. Check browser console for detailed error logs
2. Verify API keys in `.env` file
3. Review `AI_SETUP.md` for configuration help
4. Try switching to alternative model
5. Check AI provider status pages for outages
