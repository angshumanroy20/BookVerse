# Google Web Search Integration Setup Guide

## Overview
This application now includes Google Custom Search API integration, allowing users to search the web directly from the Browse page and get instant results.

---

## Features

### ✨ What's New
- **Web Search Button** - New "Web Search" button on the Browse page
- **Google-Powered Results** - Real-time web search using Google Custom Search API
- **Clean Interface** - Beautiful dialog with search results, snippets, and links
- **Quick Access** - Click any result to open in a new tab
- **Search Metrics** - Shows total results and search time
- **Error Handling** - Graceful error messages and loading states

---

## Setup Instructions

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Custom Search API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Custom Search API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - (Optional) Restrict the key to "Custom Search API" for security

### Step 2: Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" or "Create a new search engine"
3. Configure your search engine:
   - **Sites to search:** Enter `*` to search the entire web
   - **Name:** Give it a descriptive name (e.g., "My App Web Search")
   - **Language:** Select your preferred language
4. Click "Create"
5. On the next page, click "Customize" or "Control Panel"
6. Copy your **Search Engine ID** (cx parameter)
7. Make sure "Search the entire web" is enabled:
   - Go to "Setup" > "Basics"
   - Enable "Search the entire web"

### Step 3: Configure Environment Variables

Open your `.env` file and update the following variables:

```bash
# Replace with your actual credentials
VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

### Step 4: Restart Development Server

After updating the `.env` file, restart your development server:

```bash
npm run dev
```

---

## Usage

### For Users

1. **Navigate to Browse Page**
   - Go to the Browse page in your application

2. **Click "Web Search" Button**
   - Look for the button with a globe icon next to the search bar

3. **Enter Your Query**
   - Type your search term in the dialog
   - Click "Search" or press Enter

4. **View Results**
   - Browse through the search results
   - Click on any result to open it in a new tab
   - See total results and search time at the top

### For Developers

#### Service File: `src/services/googleSearch.ts`

```typescript
import { searchWeb, formatSearchResponse } from '@/services/googleSearch';

// Basic search
const results = await searchWeb('your query', 10);

// Format results for display
const formattedResponse = formatSearchResponse('your query', results);
```

#### Component: `src/components/common/WebSearchDialog.tsx`

```tsx
import WebSearchDialog from '@/components/common/WebSearchDialog';

<WebSearchDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  initialQuery="optional initial query"
/>
```

---

## API Limits & Pricing

### Free Tier
- **100 queries per day** - Free
- **10,000 queries per day** - $5 per 1,000 queries after first 100

### Paid Tier
- Up to 10,000 queries per day
- $5 per 1,000 queries
- See [Google Custom Search Pricing](https://developers.google.com/custom-search/v1/overview#pricing) for details

### Rate Limiting
- The API has rate limits to prevent abuse
- Implement caching if you expect high traffic
- Consider adding request throttling for production use

---

## Troubleshooting

### Error: "API credentials not configured"
**Solution:** Make sure you've added both `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_SEARCH_ENGINE_ID` to your `.env` file and restarted the server.

### Error: "API key not valid"
**Solution:** 
- Verify your API key is correct
- Make sure the Custom Search API is enabled in Google Cloud Console
- Check if your API key has restrictions that might block requests

### Error: "Search engine ID not found"
**Solution:**
- Verify your Search Engine ID (cx parameter) is correct
- Make sure the search engine is set to "Search the entire web"
- Check that the search engine is active

### No Results Returned
**Solution:**
- Try a different search query
- Make sure "Search the entire web" is enabled in your search engine settings
- Check if you've exceeded your daily quota

### CORS Errors
**Solution:**
- Google Custom Search API should work from any domain
- If you see CORS errors, check your API key restrictions
- Make sure you're using the correct API endpoint

---

## Security Best Practices

### 1. API Key Protection
- **Never commit API keys to version control**
- Use environment variables (`.env` file)
- Add `.env` to `.gitignore`

### 2. API Key Restrictions
In Google Cloud Console, restrict your API key:
- **Application restrictions:** HTTP referrers (websites)
- **API restrictions:** Custom Search API only
- **Referrer whitelist:** Add your production domain

### 3. Rate Limiting
Implement rate limiting to prevent abuse:
```typescript
// Example: Simple rate limiting
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function cachedSearch(query: string) {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.results;
  }
  
  const results = await searchWeb(query);
  searchCache.set(query, { results, timestamp: Date.now() });
  return results;
}
```

### 4. Input Validation
- Sanitize user input before sending to API
- Limit query length (max 2048 characters)
- Prevent injection attacks

---

## Advanced Configuration

### Custom Search Parameters

You can modify `src/services/googleSearch.ts` to add more parameters:

```typescript
// Add language preference
url.searchParams.append("lr", "lang_en");

// Add safe search
url.searchParams.append("safe", "active");

// Add date restriction
url.searchParams.append("dateRestrict", "m1"); // Last month

// Add file type filter
url.searchParams.append("fileType", "pdf");

// Add site restriction
url.searchParams.append("siteSearch", "example.com");
```

### Result Customization

Modify the search engine settings:
- **Look and feel:** Customize colors and layout
- **Refinements:** Add search refinements (categories)
- **Promotions:** Promote specific results
- **Synonyms:** Add custom synonyms

---

## Integration Points

### Current Integration
- **Browse Page** (`src/pages/Browse.tsx`)
  - "Web Search" button next to search bar
  - Opens WebSearchDialog on click

### Potential Future Integrations
- **Book Detail Page** - Search for book reviews or related content
- **Profile Page** - Search for author information
- **Admin Dashboard** - Search for book metadata
- **Global Search** - Add to header for site-wide access

---

## Testing

### Manual Testing Checklist
- [ ] Click "Web Search" button on Browse page
- [ ] Enter a search query and submit
- [ ] Verify results are displayed correctly
- [ ] Click on a result to open in new tab
- [ ] Test with no results query
- [ ] Test with empty query (should show error)
- [ ] Test error handling (invalid API key)
- [ ] Test loading states
- [ ] Test responsive design (mobile/tablet/desktop)

### Test Queries
- **General:** "React TypeScript best practices"
- **Specific:** "Supabase authentication tutorial"
- **No results:** "asdfghjklqwertyuiop123456789"
- **Special characters:** "C++ programming"
- **Long query:** Test with 100+ character query

---

## Performance Optimization

### 1. Implement Caching
```typescript
// Cache search results to reduce API calls
const cache = new Map<string, { data: SearchResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
```

### 2. Debounce Search Input
```typescript
// Debounce search to prevent excessive API calls
import { debounce } from 'lodash';

const debouncedSearch = debounce(handleSearch, 500);
```

### 3. Lazy Loading
```typescript
// Load more results on scroll
const [page, setPage] = useState(1);
const loadMore = () => setPage(p => p + 1);
```

### 4. Request Cancellation
```typescript
// Cancel previous requests when new search starts
const abortController = new AbortController();
fetch(url, { signal: abortController.signal });
```

---

## Monitoring & Analytics

### Track Search Metrics
```typescript
// Log search queries for analytics
console.log('Search query:', query);
console.log('Results count:', results.items.length);
console.log('Search time:', results.searchInformation.searchTime);

// Send to analytics service
analytics.track('web_search', {
  query,
  resultsCount: results.items.length,
  searchTime: results.searchInformation.searchTime,
});
```

### Monitor API Usage
- Check Google Cloud Console for API usage
- Set up billing alerts
- Monitor quota usage
- Track error rates

---

## FAQ

### Q: Is this free?
**A:** Yes, up to 100 queries per day. After that, it's $5 per 1,000 queries.

### Q: Can I search specific websites only?
**A:** Yes, configure your search engine to search specific sites instead of the entire web.

### Q: How do I increase my quota?
**A:** Enable billing in Google Cloud Console to increase your quota to 10,000 queries per day.

### Q: Can I customize the search results?
**A:** Yes, you can customize the search engine settings in the Programmable Search Engine console.

### Q: Is this better than the AI search we removed?
**A:** Different use case. This provides real-time web results from Google, while AI search provided intelligent analysis. Both have their benefits.

### Q: Can I use this with other search engines?
**A:** This implementation is specific to Google. For other search engines (Bing, DuckDuckGo), you'd need different APIs.

---

## Support & Resources

### Official Documentation
- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine](https://developers.google.com/custom-search/docs/overview)
- [API Reference](https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list)

### Useful Links
- [Google Cloud Console](https://console.cloud.google.com/)
- [Programmable Search Engine Console](https://programmablesearchengine.google.com/)
- [Pricing Information](https://developers.google.com/custom-search/v1/overview#pricing)
- [API Quotas](https://console.cloud.google.com/apis/api/customsearch.googleapis.com/quotas)

### Community
- [Stack Overflow - Google Custom Search](https://stackoverflow.com/questions/tagged/google-custom-search)
- [Google Custom Search Forum](https://support.google.com/programmable-search/community)

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Initial implementation
- ✅ Google Custom Search API integration
- ✅ WebSearchDialog component
- ✅ Browse page integration
- ✅ Error handling and loading states
- ✅ Responsive design
- ✅ Documentation

### Future Enhancements
- [ ] Search result caching
- [ ] Advanced search filters
- [ ] Search history
- [ ] Bookmarking results
- [ ] Export search results
- [ ] Image search support
- [ ] News search support
- [ ] Video search support

---

## License & Attribution

This integration uses Google Custom Search API, which is subject to Google's Terms of Service.

**Required Attribution:**
When using Google Custom Search API, you must display the "Powered by Google" logo or text attribution as per Google's branding guidelines.

---

**Last Updated:** 2024
**Status:** ✅ Ready for use (after API key setup)
**Maintainer:** Development Team
