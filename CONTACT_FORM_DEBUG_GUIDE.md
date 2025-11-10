# Contact Form Debugging Guide

## Issue
The contact form is showing "error sending message" when users try to submit feedback.

## What Was Fixed

### 1. ✅ Removed Model Switch Confirmation Message
The chatbot no longer shows "Switched to [model]" messages when changing AI models. The switch happens silently for a cleaner user experience.

### 2. ✅ Enhanced Debugging Capabilities
Added comprehensive logging throughout the contact form submission process to help identify the exact point of failure.

## Debugging Steps

### Step 1: Open Browser Console
1. Open the About page
2. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
3. Click on the "Console" tab

### Step 2: Try Submitting the Form
Fill out the contact form with test data:
- **Name**: Test User
- **Email**: test@example.com
- **Subject**: Test Subject
- **Message**: This is a test message to debug the form

### Step 3: Check Console Output
You should see detailed logging like this:

#### ✅ Successful Submission
```
Supabase client initialized with URL: https://your-project.supabase.co
=== Contact Form Submission ===
Form data: {name: "Test User", email: "test@example.com", ...}
Calling API...
=== API: Creating contact submission ===
Submission data: {name: "Test User", email: "test@example.com", ...}
Supabase URL: https://your-project.supabase.co
=== API: Contact submission created successfully ===
Result: {id: "...", name: "Test User", ...}
API call successful: {id: "...", name: "Test User", ...}
```

#### ❌ Failed Submission
```
Supabase client initialized with URL: https://your-project.supabase.co
=== Contact Form Submission ===
Form data: {name: "Test User", email: "test@example.com", ...}
Calling API...
=== API: Creating contact submission ===
Submission data: {name: "Test User", email: "test@example.com", ...}
Supabase URL: https://your-project.supabase.co
=== API: Supabase error ===
Error object: {...}
Error code: 42501
Error message: new row violates row-level security policy
Error details: ...
Error hint: ...
=== Contact Form Error ===
Error message: new row violates row-level security policy
```

## Common Issues and Solutions

### Issue 1: RLS Policy Error
**Error Message**: `new row violates row-level security policy`

**Cause**: Row Level Security (RLS) is blocking anonymous inserts

**Solution**: The RLS policy should already be fixed. If you still see this error, verify the policy:

```sql
-- Check if the policy exists
SELECT * FROM pg_policies WHERE tablename = 'contact_submissions';

-- The policy should allow INSERT for everyone
-- If not, run this migration again:
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;

CREATE POLICY "Anyone can submit contact form" 
ON contact_submissions 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);
```

### Issue 2: Missing Environment Variables
**Error Message**: `Supabase URL and Anon Key must be provided in environment variables`

**Cause**: `.env` file is missing or not loaded

**Solution**:
1. Check if `.env` file exists in the project root
2. Verify it contains:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Restart the development server: `npm run dev`

### Issue 3: Network Error
**Error Message**: `Failed to fetch` or `Network request failed`

**Cause**: Cannot reach Supabase server

**Solution**:
1. Check internet connection
2. Verify Supabase project is active
3. Check if Supabase URL is correct
4. Try accessing the Supabase URL in browser

### Issue 4: Invalid Data Format
**Error Message**: `invalid input syntax for type uuid`

**Cause**: Data format doesn't match database schema

**Solution**: Check the form data structure matches the database:
```typescript
interface ContactSubmission {
  id: string;           // UUID (auto-generated)
  name: string;         // Required
  email: string;        // Required
  subject: string;      // Required
  message: string;      // Required
  status: string;       // Default: 'pending'
  created_at: string;   // Auto-generated
}
```

### Issue 5: CORS Error
**Error Message**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Cause**: Supabase project doesn't allow requests from your domain

**Solution**:
1. Go to Supabase Dashboard
2. Navigate to Settings > API
3. Add your domain to allowed origins
4. For development, `http://localhost:5173` should be allowed by default

## Testing the Fix

### Manual Test
1. Open the About page
2. Fill out the contact form:
   - Name: Your Name
   - Email: your@email.com
   - Subject: Test Feedback
   - Message: Testing the contact form functionality
3. Click "Send Message"
4. Check console for detailed logs
5. Verify success toast appears
6. Check Supabase dashboard to confirm submission was saved

### Verify in Database
1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Open `contact_submissions` table
4. Look for your test submission
5. Verify all fields are populated correctly

## What the Logs Tell You

### Log Location Analysis

#### "Supabase client initialized"
- ✅ Means: Environment variables are loaded correctly
- ❌ If missing: Check `.env` file and restart server

#### "Contact Form Submission"
- ✅ Means: Form validation passed, submission started
- ❌ If missing: Form validation failed (check required fields)

#### "API: Creating contact submission"
- ✅ Means: API function was called successfully
- ❌ If missing: Error occurred before reaching API layer

#### "API: Supabase error"
- ❌ Means: Supabase rejected the request
- Check the error code, message, and hint for details

#### "API: Contact submission created successfully"
- ✅ Means: Data was saved to database
- Form should show success message

## Next Steps

### If Form Still Fails:

1. **Copy Console Output**
   - Copy all console logs from the failed submission
   - Look for the specific error message

2. **Check Error Code**
   - `42501`: RLS policy issue
   - `23505`: Duplicate entry (unique constraint)
   - `23502`: Missing required field
   - `22P02`: Invalid data format

3. **Verify Database Schema**
   ```sql
   -- Check table structure
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'contact_submissions';
   ```

4. **Test Direct Insert**
   ```sql
   -- Try inserting directly in Supabase SQL Editor
   INSERT INTO contact_submissions (name, email, subject, message)
   VALUES ('Test', 'test@example.com', 'Test', 'Test message')
   RETURNING *;
   ```

5. **Check RLS Policies**
   ```sql
   -- View all policies on the table
   SELECT * FROM pg_policies 
   WHERE tablename = 'contact_submissions';
   ```

## Additional Debugging

### Enable Supabase Debug Mode
Add this to your API file temporarily:

```typescript
const { data, error } = await supabase
  .from("contact_submissions")
  .insert([submission])
  .select()
  .maybeSingle();

// Add this debug output
console.log('Supabase response:', { data, error });
console.log('Request payload:', submission);
```

### Check Network Tab
1. Open DevTools Network tab
2. Filter by "Fetch/XHR"
3. Submit the form
4. Look for the request to Supabase
5. Check:
   - Request URL
   - Request headers
   - Request payload
   - Response status
   - Response body

## Contact Form Requirements

### Required Fields
- ✅ Name (string, not empty)
- ✅ Email (string, valid email format)
- ✅ Subject (string, not empty)
- ✅ Message (string, minimum 10 characters)

### Validation Rules
- Name: Required
- Email: Required, must be valid email
- Subject: Required
- Message: Required, minimum 10 characters

### Expected Behavior
1. User fills out form
2. Clicks "Send Message"
3. Button shows "Sending..." state
4. Form data is validated
5. API call is made to Supabase
6. Success toast appears
7. Form is reset
8. Button returns to normal state

## Summary

The contact form now has extensive debugging capabilities. When you submit the form:

1. ✅ Console will show exactly where the process is
2. ✅ Any errors will be logged with full details
3. ✅ You'll see the exact Supabase error message
4. ✅ Error toast will show the actual error, not generic message

**To fix the issue, please:**
1. Try submitting the form
2. Check the browser console
3. Copy the error logs
4. Share the specific error message

This will help identify whether it's:
- RLS policy issue (should be fixed)
- Environment variable issue
- Network connectivity issue
- Data validation issue
- Or something else entirely
