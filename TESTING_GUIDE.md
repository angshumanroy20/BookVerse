# AI Features Testing Guide

This guide will help you test and debug the three AI features in Biblios: Voice Search, AI Chatbot, and AI Search.

## Prerequisites

1. **Open Browser Console**: Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. **Check Console Tab**: All features now have detailed logging with emojis for easy identification

## Feature 1: Voice Search 🎤

### How to Test:
1. Go to the **Browse** page
2. Click the **microphone icon** in the search bar
3. A dialog should open with a large microphone icon
4. Click **"Start Listening"** button
5. Speak clearly (e.g., "science fiction books")
6. Your speech should appear in real-time in the text box
7. Click **"Search"** to perform the search

### Console Logs to Look For:
```
🎤 Initializing voice recognition...
✅ Voice recognition started
📝 Received speech result
⏳ Interim text: [your speech as you speak]
✅ Final text: [your complete sentence]
🛑 Voice recognition ended
```

### Common Issues & Solutions:

#### Issue: "Voice recognition is not supported"
- **Solution**: Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)

#### Issue: "Microphone access denied"
- **Solution**: 
  1. Click the camera/microphone icon in your browser's address bar
  2. Allow microphone access
  3. Refresh the page and try again

#### Issue: "No speech detected"
- **Solution**:
  1. Check your microphone is working (test in system settings)
  2. Speak louder and clearer
  3. Make sure you're not on mute
  4. Try a different microphone if available

#### Issue: Dialog opens but nothing happens
- **Solution**:
  1. Check console for error messages
  2. Make sure microphone permissions are granted
  3. Try clicking "Start Listening" again

---

## Feature 2: AI Chatbot 💬

### How to Test:
1. Look for the **chat bubble icon** in the bottom-right corner
2. Click it to open the chatbot
3. Type a message (e.g., "Recommend a mystery book")
4. Press Enter or click Send
5. Wait for the AI response

### Console Logs to Look For:
```
💬 Sending message to AI: [your message]
🤖 Using model: gemini
✅ API key found: AIzaSyD3pxRKU...
📤 Sending request to Gemini API...
📋 Request body: [request details]
📥 Response received
✅ Received AI response: [response preview]
```

### Common Issues & Solutions:

#### Issue: "API key is not configured"
- **Solution**: The API key should already be in `.env` file. If you see this error, check:
  ```bash
  cat .env | grep GEMINI
  ```
  Should show: `VITE_GEMINI_API_KEY=AIzaSyD3pxRKUoI4Y3oyF_a1VuWTZNEOQEW5HDQ`

#### Issue: "403 Forbidden" or "API key not valid"
- **Solution**: The Gemini API key might have expired or reached quota limits
  1. Try switching to OpenAI model using the dropdown in the chatbot
  2. Or get a new Gemini API key from https://makersuite.google.com/app/apikey

#### Issue: "Network error" or "Failed to fetch"
- **Solution**:
  1. Check your internet connection
  2. Check if the API endpoint is accessible
  3. Look for CORS errors in console
  4. Try switching AI models

#### Issue: Chatbot doesn't respond
- **Solution**:
  1. Open browser console and look for error messages
  2. Try switching between Gemini and OpenAI models
  3. Check if you see any red error messages in console
  4. Refresh the page and try again

---

## Feature 3: AI Search ✨

### How to Test:
1. Go to the **Browse** page
2. Click the **"AI Search"** button (with sparkles icon)
3. A dialog opens with a search input
4. Type a query (e.g., "Best science fiction books of 2024")
5. Click **"Search"**
6. Watch the response stream in real-time
7. Check the "Sources" section for web references

### Console Logs to Look For:
```
🔍 Starting AI search for: [your query]
🔍 Starting AI Search for query: [your query]
📱 APP_ID: app-7flusvzm3281
🔗 API URL: https://api-integrations.appmedo.com/...
📤 Sending request to AI Search API...
📥 Response status: 200 OK
📦 Received chunk: [text preview]
✅ Stream complete. Total chunks: [number]
✅ AI search completed successfully
```

### Common Issues & Solutions:

#### Issue: "AI Search failed: 401 Unauthorized"
- **Solution**: The APP_ID might not be configured correctly
  1. Check `.env` file: `cat .env | grep APP_ID`
  2. Should show: `VITE_APP_ID=app-7flusvzm3281`
  3. If missing, add it and restart the dev server

#### Issue: "AI Search failed: 403 Forbidden"
- **Solution**: API access might be restricted
  1. Check if the API endpoint is accessible
  2. Verify APP_ID is correct
  3. Check console for detailed error message

#### Issue: "No data received from AI Search"
- **Solution**:
  1. Check your internet connection
  2. Look for network errors in console
  3. Try a different query
  4. Check if the API endpoint is responding

#### Issue: Response is very slow or times out
- **Solution**:
  1. This is normal - first token can take up to 30 seconds
  2. Wait patiently for the first response
  3. Once started, streaming should be fast
  4. Check your internet speed

---

## General Debugging Steps

### Step 1: Check Environment Variables
```bash
cd /workspace/app-7flusvzm3281
cat .env
```

Should contain:
```
VITE_APP_ID=app-7flusvzm3281
VITE_GEMINI_API_KEY=AIzaSyD3pxRKUoI4Y3oyF_a1VuWTZNEOQEW5HDQ
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### Step 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for colored emoji logs:
   - 🎤 = Voice Search
   - 💬 = AI Chatbot
   - 🔍 = AI Search
   - ✅ = Success
   - ❌ = Error
   - ⚠️ = Warning

### Step 3: Check Network Tab
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try the feature again
4. Look for failed requests (red)
5. Click on failed requests to see error details

### Step 4: Test Each Feature Individually
1. Test Voice Search first (doesn't require API)
2. Then test AI Chatbot (uses Gemini API)
3. Finally test AI Search (uses custom API)

### Step 5: Check for CORS Errors
If you see CORS errors in console:
- This means the browser is blocking the request
- Check if the API endpoint allows requests from your domain
- Try using a different browser
- Check if you need to configure CORS on the API side

---

## Success Indicators

### Voice Search Working ✅
- Dialog opens smoothly
- Microphone icon turns red when listening
- Speech appears in real-time as you speak
- Search button becomes enabled when you have text
- Search executes and shows results

### AI Chatbot Working ✅
- Chat bubble appears in bottom-right
- Dialog opens when clicked
- Messages send successfully
- AI responds within a few seconds
- Responses are relevant and helpful

### AI Search Working ✅
- Dialog opens with search input
- Search button triggers the search
- "Searching and analyzing..." message appears
- Response streams in real-time (text appears gradually)
- Sources section shows web references
- Complete response appears within 30 seconds

---

## Still Having Issues?

If none of the above solutions work:

1. **Clear Browser Cache**:
   - Press `Ctrl+Shift+Delete` (Windows/Linux) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - Refresh the page

2. **Try Incognito/Private Mode**:
   - This helps identify if browser extensions are interfering
   - Press `Ctrl+Shift+N` (Chrome) or `Ctrl+Shift+P` (Firefox)

3. **Check API Status**:
   - Gemini API: https://status.cloud.google.com/
   - Check if there are any ongoing outages

4. **Restart Development Server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm run dev
   ```

5. **Check Console for Specific Error Messages**:
   - Copy the full error message
   - Search for it online
   - The error message usually contains the solution

---

## Contact & Support

If you're still experiencing issues after trying all the above steps:

1. Take a screenshot of the browser console showing the error
2. Note which feature is not working
3. Note what you were trying to do when it failed
4. Share this information for further assistance

---

## Quick Reference: Console Log Meanings

| Emoji | Meaning |
|-------|---------|
| 🎤 | Voice recognition event |
| 💬 | Chatbot message |
| 🔍 | AI Search event |
| ✅ | Success |
| ❌ | Error |
| ⚠️ | Warning |
| 📤 | Sending request |
| 📥 | Receiving response |
| 📝 | Processing data |
| 🤖 | AI model info |
| 🔗 | API endpoint |
| 📱 | App configuration |
| 🛑 | Process stopped |
| ⏳ | In progress |
| 📦 | Data chunk received |
