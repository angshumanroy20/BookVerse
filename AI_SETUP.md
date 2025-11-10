# AI Chatbot Setup Guide

The Biblios platform includes an AI-powered chatbot that can help users discover books and answer questions about literature. The chatbot supports two AI models:

## Supported AI Models

### 1. Google Gemini (Default)
- **Model**: Gemini 1.5 Flash
- **Provider**: Google AI
- **Features**: Fast responses, good for general book recommendations

### 2. OpenAI GPT
- **Model**: GPT-3.5 Turbo
- **Provider**: OpenAI
- **Features**: High-quality responses, excellent for detailed literary discussions

## Setup Instructions

### Getting API Keys

#### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

#### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the generated API key (you won't be able to see it again!)
5. Add it to your `.env` file:
   ```
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

### Configuration

The `.env` file should contain both API keys:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

## Using the Chatbot

### Switching Between Models

1. Open the chatbot by clicking the chat icon in the bottom-right corner
2. Use the "AI Model" dropdown at the top of the chat window
3. Select either "Google Gemini" or "OpenAI GPT"
4. Your selection will be saved for future sessions

### When to Switch Models

- **If one model is unavailable**: The chatbot will show an error message. Simply switch to the other model.
- **If you hit rate limits**: Switch to the alternative model to continue chatting.
- **For different response styles**: Try both models to see which one you prefer.

## Error Handling

The chatbot includes comprehensive error handling:

- **API Key Not Configured**: You'll see a message asking you to add the API key to your `.env` file
- **Quota Exceeded**: The chatbot will suggest switching to the alternative model
- **Rate Limits**: Clear guidance on waiting or switching models
- **Network Errors**: Helpful messages about connectivity issues

## Cost Considerations

### Google Gemini
- **Free Tier**: 60 requests per minute
- **Pricing**: Very affordable for most use cases
- **Best For**: High-volume usage, development, testing

### OpenAI GPT-3.5 Turbo
- **Free Tier**: Limited free credits for new accounts
- **Pricing**: Pay-as-you-go, approximately $0.002 per 1K tokens
- **Best For**: Production use, high-quality responses

## Troubleshooting

### "API key not configured" Error
- Check that your `.env` file contains the correct API key
- Ensure the key starts with the correct prefix:
  - Gemini: `AIza...`
  - OpenAI: `sk-...`
- Restart your development server after adding the key

### "Quota exceeded" Error
- **Gemini**: You've exceeded the free tier limit. Wait a few minutes or upgrade your plan.
- **OpenAI**: Add billing information to your OpenAI account or wait for the limit to reset.
- **Solution**: Switch to the alternative model in the meantime.

### Model Not Responding
1. Check your internet connection
2. Verify the API key is correct
3. Check the browser console for detailed error messages
4. Try switching to the alternative model

## Privacy & Security

- API keys are stored in environment variables and never exposed to users
- Conversation history is stored locally in the browser
- No conversation data is sent to our servers
- Each API call is made directly from the user's browser to the AI provider

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your API keys are correctly configured
3. Try switching between models
4. Check the AI provider's status page for outages
