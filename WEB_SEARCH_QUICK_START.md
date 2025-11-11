# Web Search Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Get Google API Credentials

1. **Get API Key:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create a new API key
   - Enable "Custom Search API"

2. **Create Search Engine:**
   - Go to https://programmablesearchengine.google.com/
   - Create a new search engine
   - Set it to search the entire web (`*`)
   - Copy your Search Engine ID

### Step 2: Update .env File

```bash
VITE_GOOGLE_API_KEY=your-api-key-here
VITE_GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id-here
```

### Step 3: Restart Server

```bash
npm run dev
```

---

## ✨ Features

- **Web Search Button** - Globe icon on Browse page
- **Real-time Results** - Powered by Google Custom Search
- **Click to Open** - Results open in new tabs
- **Search Metrics** - Shows result count and search time
- **Error Handling** - Graceful error messages

---

## 📍 Where to Find It

**Browse Page** → Click "Web Search" button (globe icon) → Enter query → View results

---

## 💰 Pricing

- **Free:** 100 queries/day
- **Paid:** $5 per 1,000 queries after first 100

---

## 🔧 Files Added

```
src/services/googleSearch.ts           - Google API integration
src/components/common/WebSearchDialog.tsx  - Search UI component
```

## 📝 Files Modified

```
src/pages/Browse.tsx  - Added Web Search button
.env                  - Added Google API credentials
```

---

## ❓ Troubleshooting

### "API credentials not configured"
→ Add API key and Search Engine ID to `.env` and restart server

### "API key not valid"
→ Check API key in Google Cloud Console and enable Custom Search API

### No results
→ Make sure search engine is set to "Search the entire web"

---

## 📚 Full Documentation

See **GOOGLE_SEARCH_SETUP.md** for complete setup instructions, advanced configuration, and troubleshooting.

---

## ✅ Status

**Ready to use** after adding API credentials to `.env` file!
