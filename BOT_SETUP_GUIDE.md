# Book Upload Bot Setup Guide

## Overview

The Biblios Book Upload Bot is an automated system that fetches book data from the Open Library API and populates your library with books. The bot runs without requiring authentication and can be triggered manually from the admin dashboard.

## Features

- ✅ **Automated Book Fetching**: Retrieves book data from Open Library API
- ✅ **Multi-Genre Support**: Fetches books from 15+ different genres
- ✅ **Duplicate Prevention**: Automatically skips books that already exist
- ✅ **No Authentication Required**: Bot runs with elevated privileges
- ✅ **Manual Trigger**: Run the bot anytime from the admin dashboard
- ✅ **Real-time Logs**: See bot activity in real-time

## How It Works

### 1. Bot User Creation

The bot automatically creates a special "biblios_bot" user account with the following properties:
- **Username**: `biblios_bot`
- **Email**: `bot@biblios.internal`
- **Role**: `bot`
- **Privileges**: Can create books without authentication

### 2. Book Fetching Process

Each time the bot runs, it:
1. Randomly selects 5 genres from the available list
2. Fetches 3 books from each selected genre (15 books total)
3. Retrieves book metadata including:
   - Title
   - Author
   - Genre
   - Synopsis
   - **High-quality cover image** (original size with fallback to large)
   - ISBN (if available)

### 3. Image Quality Enhancement

The bot uses an intelligent image fetching strategy:
- **First attempt**: Fetches original size images (highest quality available)
- **Verification**: Checks if the original image exists
- **Fallback**: Uses large size (-L) if original is unavailable
- **Result**: Clear, high-resolution book covers for the best visual experience

### 4. Upload Process

For each book:
1. Checks if the book already exists (by title and author)
2. If new, uploads the book to the database
3. If exists, skips to avoid duplicates
4. Logs the result

## Available Genres

The bot fetches books from these genres:
- Fiction
- Science Fiction
- Fantasy
- Mystery
- Thriller
- Romance
- Horror
- Biography
- History
- Philosophy
- Psychology
- Business
- Self Help
- Poetry
- Drama

## How to Use

### Manual Trigger (Admin Dashboard)

1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Click on the "Upload Bot" tab
4. Click the "Run Bot Now" button
5. Watch the logs to see the bot's progress
6. Once complete, check the "Books Management" tab to see new books

### Bot Statistics

After each run, you'll see:
- **Total Fetched**: Number of books retrieved from API
- **Uploaded**: Number of new books added to library
- **Skipped**: Number of books that already existed
- **Subjects Processed**: List of genres that were processed

## Technical Details

### Edge Function

The bot is implemented as a Supabase Edge Function located at:
```
supabase/functions/book-upload-bot/index.ts
```

### Database Schema

The bot uses the following tables:
- `profiles`: Stores the bot user account
- `books`: Stores book metadata

### API Integration

- **Data Source**: Open Library API (https://openlibrary.org)
- **Rate Limiting**: 1 second delay between genre requests
- **Error Handling**: Gracefully handles API failures

## Customization

### Adjust Books Per Run

To change the number of books fetched per run, edit the Edge Function:

```typescript
const booksPerSubject = 3; // Change this number
const selectedSubjects = BOOK_SUBJECTS
  .sort(() => Math.random() - 0.5)
  .slice(0, 5); // Change this number for more/fewer genres
```

### Add More Genres

To add more genres, edit the `BOOK_SUBJECTS` array in the Edge Function:

```typescript
const BOOK_SUBJECTS = [
  "fiction",
  "science_fiction",
  // Add more genres here
];
```

## Troubleshooting

### Bot Not Running

**Issue**: Bot button doesn't work
**Solution**: 
1. Check that you're logged in as an admin
2. Verify the Edge Function is deployed
3. Check browser console for errors

### No Books Uploaded

**Issue**: Bot runs but uploads 0 books
**Solution**:
1. All books may already exist in the database
2. Check the logs for API errors
3. Try running the bot again (it selects random genres each time)

### API Rate Limiting

**Issue**: Bot fails with rate limit errors
**Solution**:
1. The bot includes delays to prevent rate limiting
2. If issues persist, increase the delay in the Edge Function
3. Wait a few minutes before running again

## Best Practices

1. **Run Periodically**: Run the bot once a day or week to keep fresh content
2. **Monitor Logs**: Check the logs to ensure successful uploads
3. **Check Quality**: Review uploaded books and remove any with poor data
4. **Variety**: The bot randomly selects genres for variety

## Security

- Bot uses Supabase Service Role Key (bypasses RLS)
- Bot user cannot be used for regular login
- Only admins can trigger the bot
- All operations are logged

## Future Enhancements

Potential improvements:
- Scheduled automatic runs (cron jobs)
- PDF upload support for public domain books
- More data sources (Google Books API, etc.)
- Custom genre selection
- Batch size configuration from UI
- Book quality filtering

## Support

For issues or questions:
1. Check the bot logs in the admin dashboard
2. Review the Edge Function code
3. Check Supabase logs for detailed errors
4. Verify database permissions

---

**Note**: The bot fetches data from Open Library, which is a free, open-source project. Book availability and data quality depend on their database.
