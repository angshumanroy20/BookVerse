# How to Use the Book Upload Bot - Complete Guide

## Quick Start (3 Steps)

### Step 1: Login as Admin
- Open your Biblios website
- Click "Login" in the navigation
- Enter your admin credentials

### Step 2: Go to Bot Dashboard
- Click "Admin" in the navigation menu
- Click the "Upload Bot" tab (4th tab)

### Step 3: Run the Bot
- Click the blue "Run Bot Now" button
- Wait 30-60 seconds
- Watch the logs appear in real-time
- See success message with statistics

**That's it!** New books will now appear in your library.

---

## What Happens When You Run the Bot

### 1. Bot Starts (0-5 seconds)
```
Starting book upload bot...
Admin ID: your-user-id
Admin username: your_username
```

### 2. Fetching Books (5-30 seconds)
```
Fetching books for subject: science_fiction
Fetching books for subject: fantasy
Fetching books for subject: mystery
Fetching books for subject: thriller
Fetching books for subject: biography
Fetched 15 books total
```

### 3. Uploading Books (30-60 seconds)
```
Successfully uploaded: The Martian
Successfully uploaded: Dune
Book already exists: 1984
Successfully uploaded: Foundation
...
```

### 4. Completion (60 seconds)
```
Bot completed successfully!
Uploaded by: your_username
Total fetched: 15
Uploaded: 12
Skipped: 3
Subjects: Science Fiction, Fantasy, Mystery, Thriller, Biography
```

---

## Understanding the Results

### Statistics Explained

| Stat | Meaning | Example |
|------|---------|---------|
| **Total Fetched** | Books retrieved from API | 15 |
| **Uploaded** | New books added to library | 12 |
| **Skipped** | Books that already existed | 3 |
| **Uploaded By** | Your admin username | john_admin |
| **Subjects** | Genres processed | Fiction, Fantasy, etc. |

### Why Books Are Skipped

Books are skipped if:
- ✅ Same title and author already exists
- ✅ Prevents duplicates
- ✅ Safe to run multiple times

---

## What Gets Uploaded

### Book Information

Each book includes:
- ✅ **Title**: Full book title
- ✅ **Author**: Primary author name
- ✅ **Genre**: Category (Fiction, Fantasy, etc.)
- ✅ **Synopsis**: Book description (up to 500 characters)
- ✅ **Cover Image**: High-quality cover (original size)
- ✅ **ISBN**: International Standard Book Number (if available)
- ✅ **Created By**: Your admin user ID

### Image Quality

The bot fetches the highest quality images:
- **First Choice**: Original size (unlimited resolution)
- **Fallback**: Large size (500x500px)
- **Last Resort**: Placeholder image

Average resolution: **800x1200px** (excellent quality!)

---

## Viewing Uploaded Books

### Method 1: Books Management Tab

1. Stay in Admin Dashboard
2. Click "Books Management" tab (1st tab)
3. Scroll through the list
4. Look for books with your username as uploader

### Method 2: Browse Page

1. Click "Browse" in the navigation
2. New books will appear in the grid
3. Filter by genre to find specific books
4. Click any book to see details

### Method 3: Home Page

1. Click "Home" in the navigation
2. New books may appear in "New Arrivals"
3. Browse through the featured books

---

## Managing Bot-Uploaded Books

### Editing Books

1. Go to Admin Dashboard → Books Management
2. Find the book you want to edit
3. Click the "Edit" button (pencil icon)
4. Modify any field (title, author, synopsis, etc.)
5. Click "Save Changes"

### Deleting Books

1. Go to Admin Dashboard → Books Management
2. Find the book you want to delete
3. Click the "Delete" button (trash icon)
4. Confirm deletion in the dialog
5. Book is permanently removed

**Note**: You can edit/delete any book uploaded by the bot since they're under your admin account.

---

## Running the Bot Multiple Times

### Is It Safe?

✅ **Yes!** The bot is designed to be run multiple times:
- Automatically skips duplicate books
- Fetches random genres each time
- No risk of data corruption
- Safe to run daily, weekly, or anytime

### Best Practices

**Daily Runs**
- Keeps library fresh with new content
- Different genres each time
- Builds library quickly

**Weekly Runs**
- Good balance of content and variety
- Less chance of duplicates
- Manageable library growth

**On-Demand Runs**
- Run when you need more books
- Perfect for specific events
- Full control over timing

### Expected Results Per Run

| Run # | New Books | Total Books | Notes |
|-------|-----------|-------------|-------|
| 1st | ~12-15 | 12-15 | Most books are new |
| 2nd | ~10-13 | 22-28 | Some duplicates |
| 3rd | ~8-12 | 30-40 | More duplicates |
| 4th+ | ~5-10 | 35-50+ | Increasing duplicates |

---

## Troubleshooting

### Problem: Button Doesn't Work

**Symptoms**: Clicking "Run Bot Now" does nothing

**Solutions**:
1. Check that you're logged in as admin
2. Refresh the page (F5 or Cmd+R)
3. Check browser console for errors (F12)
4. Try logging out and back in

### Problem: "Admin profile not found"

**Symptoms**: Error message in logs

**Solutions**:
1. Ensure you're logged in
2. Verify you have admin role
3. Contact system administrator
4. Check database for your profile

### Problem: No Books Uploaded (0 uploaded)

**Symptoms**: Bot completes but uploads 0 books

**Possible Causes**:
- All fetched books already exist (run again for different genres)
- Open Library API is down (try again later)
- Network connectivity issues (check internet)

**Solutions**:
1. Run the bot again (different genres will be selected)
2. Check "Books Management" to see existing books
3. Wait a few minutes and try again
4. Check browser console for specific errors

### Problem: Images Not Loading

**Symptoms**: Books appear but covers are placeholders

**Possible Causes**:
- Open Library image server issues
- Network connectivity problems
- Books don't have cover images

**Solutions**:
1. Refresh the page (images may load)
2. Check internet connection
3. Run bot again (may fetch books with covers)
4. Some books genuinely don't have covers

### Problem: Bot Takes Too Long

**Symptoms**: Bot runs for more than 2 minutes

**Possible Causes**:
- Slow network connection
- Open Library API is slow
- Server load

**Solutions**:
1. Wait patiently (it will complete)
2. Check network speed
3. Try again during off-peak hours
4. Bot has built-in timeouts for safety

---

## Advanced Usage

### Customizing Books Per Run

To change the number of books fetched per run, you would need to modify the Edge Function:

```typescript
// In supabase/functions/book-upload-bot/index.ts
const booksPerSubject = 3; // Change this number (1-10 recommended)
const selectedSubjects = BOOK_SUBJECTS
  .sort(() => Math.random() - 0.5)
  .slice(0, 5); // Change this number (1-15 for more/fewer genres)
```

**Example Configurations**:
- **Small**: 2 books × 3 genres = 6 books per run
- **Medium**: 3 books × 5 genres = 15 books per run (default)
- **Large**: 5 books × 7 genres = 35 books per run

### Monitoring Bot Activity

**Check Supabase Logs**:
1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click "book-upload-bot"
4. View logs for detailed information

**Check Database**:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select "books" table
4. Filter by `created_by` = your admin ID

---

## Tips for Best Results

### 1. Run Regularly
- Schedule weekly runs for consistent content
- Builds library over time
- Keeps content fresh

### 2. Review Uploaded Books
- Check quality of books periodically
- Edit any incorrect information
- Delete low-quality entries

### 3. Combine with Manual Uploads
- Use bot for bulk content
- Manually add special books
- Best of both worlds

### 4. Monitor Library Growth
- Track total books in Admin Dashboard
- Aim for 50-100 books for good variety
- Don't over-populate (quality > quantity)

### 5. Share with Users
- Announce new books to users
- Highlight interesting additions
- Encourage user engagement

---

## FAQ

### Q: How many books can I upload?
**A**: No limit! Run the bot as many times as you want. Each run adds ~10-15 new books.

### Q: Can I choose specific genres?
**A**: Not from the UI currently. The bot randomly selects 5 genres per run for variety.

### Q: Will the bot overwrite existing books?
**A**: No! The bot checks for duplicates and skips them. Existing books are never modified.

### Q: Can other admins run the bot?
**A**: Yes! Each admin can run the bot, and books will be uploaded under their account.

### Q: What if I want to remove all bot-uploaded books?
**A**: Go to Books Management, filter by your username, and delete books individually.

### Q: Can regular users see who uploaded books?
**A**: Users can see the uploader's username on the book detail page.

### Q: Does the bot work offline?
**A**: No, the bot requires internet to fetch books from Open Library API.

### Q: Can I schedule automatic runs?
**A**: Not currently. You must manually trigger the bot from the dashboard.

---

## Summary

The Book Upload Bot is a powerful tool for quickly populating your library with quality books:

✅ **Easy to Use**: Just click a button
✅ **High Quality**: Original size images
✅ **Safe**: Automatic duplicate detection
✅ **Transparent**: Books uploaded under your account
✅ **Reliable**: Robust error handling
✅ **Fast**: 15 books in 60 seconds

**Enjoy building your library!** 📚✨

---

**Need Help?**
- Check the logs for specific error messages
- Review the troubleshooting section
- Contact system administrator
- Check documentation files (BOT_SETUP_GUIDE.md)
