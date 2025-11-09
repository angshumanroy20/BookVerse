# Admin Panel Setup Guide

## Overview
The Admin Panel has been completely redesigned with comprehensive book and user management capabilities.

## Features

### 1. Statistics Dashboard
- **Total Users**: Count of all registered users
- **Total Books**: Count of all books in the library
- **Total Reviews**: Count of all user reviews

### 2. Books Management Tab
- View all books in a table format with:
  - Book cover thumbnail
  - Title, Author, Genre
  - Creation date
- Actions for each book:
  - **View** (👁️): Navigate to book detail page
  - **Edit** (✏️): Edit book information
  - **Delete** (🗑️): Remove book from library (with confirmation dialog)
- **Add New Book** button in the header

### 3. Users Management Tab
- View all users in a table format with:
  - Username, Email
  - Role (User/Admin)
  - Join date
- Actions for each user:
  - **Change Role**: Dropdown to switch between User and Admin roles
  - **Delete** (🗑️): Remove user (with confirmation dialog)
  - Note: You cannot delete yourself or change your own role

## How to Access Admin Panel

### Step 1: Navigate to Admin Page
Go to: `http://your-domain.com/admin`

### Step 2: Ensure You Have Admin Access
The admin panel requires your user account to have the 'admin' role.

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **profiles**
3. Find your user account
4. Change the `role` field from `user` to `admin`
5. Save the changes
6. Refresh the admin page

#### Option B: Using SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run this query (replace `your-email@example.com` with your actual email):
```sql
UPDATE profiles 
SET role = 'admin'::user_role 
WHERE email = 'your-email@example.com';
```
4. Refresh the admin page

### Step 3: Verify Access
After setting your role to admin:
1. Refresh the browser (Ctrl+F5 or Cmd+Shift+R)
2. You should see the Admin Dashboard with statistics cards
3. You should see two tabs: "Books Management" and "Users Management"

## Troubleshooting

### Issue: Seeing "Access Denied" message
**Solution**: Your user role is not set to 'admin'. Follow Step 2 above.

### Issue: Seeing analytics/statistics page instead of admin panel
**Solution**: 
- Clear your browser cache (Ctrl+Shift+Delete)
- Hard refresh the page (Ctrl+F5)
- Ensure you're on the correct URL: `/admin`

### Issue: No books showing in Books Management tab
**Solution**: 
- Upload some books first using the "Add New Book" button
- Or navigate to `/upload` to add books

### Issue: Cannot delete or edit books
**Solution**: 
- Ensure you're logged in as an admin
- Check browser console for any error messages

## API Functions Added

The following new API functions have been added to support the admin panel:

1. `api.getAllReviews()` - Fetch all reviews for statistics
2. `api.deleteProfile(userId)` - Delete a user account
3. `api.getBooks(limit)` - Fetch books with pagination

## Security Notes

- Only users with 'admin' role can access the admin panel
- Admins cannot delete their own account
- Admins cannot change their own role (prevents accidental lockout)
- All delete operations require confirmation
- All operations are logged and can be tracked

## Next Steps

1. Set your account to admin role using one of the methods above
2. Clear browser cache and refresh
3. Navigate to `/admin`
4. Start managing books and users!

---

If you continue to experience issues, please check:
- Browser console for JavaScript errors
- Network tab for failed API requests
- Supabase logs for database errors
