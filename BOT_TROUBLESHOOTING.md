# Book Upload Bot - Troubleshooting Guide

## Common Errors and Solutions

### Error: "Failed to send a request to the Edge Function"

This error occurs when the frontend cannot communicate with the Supabase Edge Function.

#### Possible Causes

1. **Edge Function Not Deployed**
   - The function might not be deployed to Supabase
   - Function might be in an error state

2. **Network/CORS Issues**
   - Browser blocking the request
   - CORS headers not properly configured
   - Network connectivity problems

3. **Authentication Issues**
   - Supabase client not properly initialized
   - Missing or invalid API keys
   - User not authenticated

4. **Configuration Issues**
   - Wrong function name
   - Missing environment variables
   - Incorrect Supabase URL

#### Solutions

##### Solution 1: Verify Edge Function Deployment

Check if the function is deployed:
1. Go to Supabase Dashboard
2. Navigate to "Edge Functions"
3. Look for "book-upload-bot"
4. Status should be "ACTIVE"
5. Version should be 4 or higher

If not deployed or in error state:
- Redeploy the function
- Check deployment logs for errors

##### Solution 2: Check Browser Console

Open browser developer tools (F12) and check:
1. **Console Tab**: Look for error messages
2. **Network Tab**: Check if request is being sent
3. **Look for**:
   - Red error messages
   - Failed network requests
   - CORS errors

Common console errors and fixes:
```
Error: "Failed to send a request"
→ Check network connectivity
→ Verify Supabase URL in .env

Error: "CORS policy blocked"
→ Edge Function needs CORS headers (now included in v4)

Error: "Admin profile not found"
→ Ensure you're logged in as admin
→ Check profile exists in database
```

##### Solution 3: Verify Environment Variables

Check `.env` file has correct values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ID=your-app-id
```

If missing or incorrect:
1. Get correct values from Supabase Dashboard
2. Update `.env` file
3. Restart development server
4. Clear browser cache

##### Solution 4: Check Admin Profile

Verify you're logged in as admin:
1. Open browser console
2. Type: `localStorage.getItem('supabase.auth.token')`
3. Should see a token value

Check admin role in database:
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Select "profiles" table
4. Find your user
5. Verify `role` column is "admin"

If not admin:
```sql
-- Run this in Supabase SQL Editor
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

##### Solution 5: Test Edge Function Directly

Test the function using curl:
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/book-upload-bot \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"adminId": "your-admin-user-id"}'
```

Expected response:
```json
{
  "success": true,
  "stats": {
    "total_fetched": 15,
    "uploaded": 12,
    "skipped": 3,
    "subjects_processed": ["fiction", "fantasy", ...],
    "uploaded_by": "your_username"
  }
}
```

If this works but UI doesn't:
- Problem is in frontend code
- Check browser console for errors
- Verify Supabase client initialization

##### Solution 6: Clear Cache and Reload

Sometimes browser cache causes issues:
1. Open browser settings
2. Clear cache and cookies
3. Close all browser tabs
4. Reopen website
5. Login again
6. Try running bot

##### Solution 7: Check Supabase Service Status

Verify Supabase is operational:
1. Go to https://status.supabase.com
2. Check for any outages
3. Check Edge Functions status

If Supabase is down:
- Wait for service to restore
- Check status page for updates
- Try again later

---

## Detailed Error Messages

### "Admin profile not found"

**Meaning**: The admin user ID doesn't exist in the profiles table

**Solutions**:
1. Ensure you're logged in
2. Check profile exists in database
3. Verify user ID is correct
4. Create profile if missing

### "User is not an admin"

**Meaning**: The user exists but doesn't have admin role

**Solutions**:
1. Update user role to "admin" in database
2. Contact system administrator
3. Use correct admin account

### "Admin ID is required"

**Meaning**: The request didn't include admin ID

**Solutions**:
1. Check frontend code is passing `adminId`
2. Verify profile is loaded before calling bot
3. Check browser console for profile data

### "Invalid JSON in request body"

**Meaning**: The request body is malformed

**Solutions**:
1. Check frontend is sending correct JSON
2. Verify `body: { adminId: profile.id }` syntax
3. Check for JSON serialization errors

---

## Debugging Steps

### Step 1: Enable Verbose Logging

Add console logs to see what's happening:

```typescript
// In Admin.tsx, before invoking function
console.log("Profile:", profile);
console.log("Admin ID:", profile?.id);
console.log("Supabase client:", supabase);
```

### Step 2: Check Network Request

1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Run Bot Now"
4. Look for request to `/functions/v1/book-upload-bot`
5. Check:
   - Request method (should be POST)
   - Request headers (should include Authorization)
   - Request body (should include adminId)
   - Response status (should be 200)
   - Response body (should include success: true)

### Step 3: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Edge Functions"
3. Click "book-upload-bot"
4. Click "Logs" tab
5. Look for recent invocations
6. Check for error messages

### Step 4: Verify Database Connection

Test database connection:
```typescript
// In browser console
const { data, error } = await supabase.from('profiles').select('*').limit(1);
console.log({ data, error });
```

Should return profile data without errors.

---

## Prevention Tips

### 1. Regular Testing
- Test bot after any code changes
- Verify function is deployed
- Check logs regularly

### 2. Monitor Supabase Status
- Subscribe to status updates
- Check before reporting issues
- Plan maintenance windows

### 3. Keep Dependencies Updated
- Update Supabase client regularly
- Check for breaking changes
- Test after updates

### 4. Backup Configuration
- Keep `.env` file backed up
- Document API keys securely
- Have rollback plan

---

## Getting Help

### Information to Provide

When reporting issues, include:
1. **Error Message**: Exact error text
2. **Browser Console**: Screenshot or copy/paste
3. **Network Tab**: Request/response details
4. **Supabase Logs**: Edge Function logs
5. **Steps to Reproduce**: What you did before error
6. **Environment**: Browser, OS, network

### Where to Get Help

1. **Check Documentation**:
   - BOT_SETUP_GUIDE.md
   - QUICK_BOT_GUIDE.md
   - HOW_TO_USE_BOT.md

2. **Check Supabase Docs**:
   - https://supabase.com/docs/guides/functions
   - https://supabase.com/docs/reference/javascript/invoke

3. **Community Support**:
   - Supabase Discord
   - GitHub Issues
   - Stack Overflow

---

## Quick Checklist

Before reporting an issue, verify:

- [ ] Edge Function is deployed (version 4+)
- [ ] Logged in as admin user
- [ ] Admin role is set in database
- [ ] Environment variables are correct
- [ ] Browser console shows no errors
- [ ] Network tab shows request is sent
- [ ] Supabase service is operational
- [ ] Cache is cleared
- [ ] Using latest code version

---

## Version History

### Version 4 (Current)
- Added CORS support
- Improved error handling
- Better error messages
- Admin identity usage

### Version 3
- High-quality image fetching
- Admin identity integration
- Enhanced logging

### Version 2
- Image quality improvements
- Original size with fallback

### Version 1
- Initial bot implementation
- Basic book fetching

---

## Contact

If you've tried all solutions and still have issues:
1. Document the problem thoroughly
2. Gather all error messages and logs
3. Contact system administrator
4. Provide all debugging information

**Remember**: Most issues are configuration-related and can be fixed by checking environment variables and database settings.
