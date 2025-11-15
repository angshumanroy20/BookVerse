# Quick Bot Guide - TL;DR

## What Was Built

✅ **Automated Book Upload Bot** - A system that automatically populates your library with books from Open Library API

## How to Use (3 Simple Steps)

1. **Login as Admin**
   - Go to your website
   - Login with your admin account

2. **Navigate to Bot**
   - Click "Admin" in the navigation
   - Click the "Upload Bot" tab

3. **Run the Bot**
   - Click "Run Bot Now" button
   - Wait 30-60 seconds
   - See new books appear in your library!

## What the Bot Does

- Fetches 15 books per run (from 5 random genres)
- Downloads book covers automatically
- Adds books to your library
- Skips duplicates
- No login required for the bot itself

## Key Features

| Feature | Description |
|---------|-------------|
| **Genres** | Fiction, Sci-Fi, Fantasy, Mystery, Thriller, Romance, Horror, Biography, History, Philosophy, Psychology, Business, Self-Help, Poetry, Drama |
| **Books Per Run** | ~15 books (3 per genre × 5 genres) |
| **Duplicates** | Automatically skipped |
| **Authentication** | Bot runs without login |
| **Trigger** | Manual from admin dashboard |

## Example Output

```
Starting book upload bot...
Bot user ID: abc-123-def
Fetching books for subject: science_fiction
Fetching books for subject: fantasy
Fetching books for subject: mystery
Fetching books for subject: thriller
Fetching books for subject: biography
Fetched 15 books total
Successfully uploaded: The Martian
Successfully uploaded: Dune
Book already exists: 1984
...
Bot completed successfully!
Total fetched: 15
Uploaded: 12
Skipped: 3
```

## Tips

💡 **Run Multiple Times**: Each run selects random genres, so run it multiple times for variety

💡 **Check Results**: Go to "Books Management" tab to see all uploaded books

💡 **No Duplicates**: Safe to run as many times as you want - duplicates are automatically skipped

## That's It!

Your library will be populated with books automatically. Just click the button and watch it work! 🚀

---

**For detailed information**, see [BOT_SETUP_GUIDE.md](./BOT_SETUP_GUIDE.md)
