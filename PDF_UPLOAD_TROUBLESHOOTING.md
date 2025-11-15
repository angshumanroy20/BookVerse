# PDF Upload Troubleshooting Guide

## Overview

This guide helps you troubleshoot issues when uploading PDF files to Biblios.

---

## Common Error Messages

### 1. "PDF file is too large"

**Error Message**: 
```
PDF file is too large. Maximum size is 10MB, but file is XX.XXMB
```

**Cause**: The PDF file exceeds the 10MB size limit.

**Solutions**:

#### Option 1: Compress the PDF
Use online tools or software to compress the PDF:
- **Online Tools**:
  - https://www.ilovepdf.com/compress_pdf
  - https://smallpdf.com/compress-pdf
  - https://www.adobe.com/acrobat/online/compress-pdf.html

- **Desktop Software**:
  - Adobe Acrobat (File → Save As Other → Reduced Size PDF)
  - Preview on Mac (File → Export → Reduce File Size)
  - PDF Compressor tools

#### Option 2: Split Large PDFs
If the book is very large, consider:
- Splitting into volumes
- Uploading only sample chapters
- Linking to external hosting (Google Drive, Dropbox)

#### Option 3: Optimize the PDF
- Remove unnecessary images
- Reduce image quality/resolution
- Remove embedded fonts
- Remove annotations and comments

---

### 2. "Invalid file type"

**Error Message**: 
```
Invalid file type. Only PDF files are allowed.
```

**Cause**: The file you're trying to upload is not a PDF.

**Solutions**:

#### Check File Extension
- File must end with `.pdf`
- Not `.doc`, `.docx`, `.epub`, `.txt`, etc.

#### Convert to PDF
If you have a different format:
- **Word/Docs**: File → Save As → PDF
- **EPUB**: Use Calibre to convert to PDF
- **Images**: Use online converters or print to PDF
- **Web Pages**: Print to PDF from browser

#### Verify File Type
On Windows:
1. Right-click file → Properties
2. Check "Type of file" should be "PDF Document"

On Mac:
1. Right-click file → Get Info
2. Check "Kind" should be "Portable Document Format (PDF)"

---

### 3. "Failed to upload PDF: [error message]"

**Generic upload error with various causes**

#### Possible Causes and Solutions:

##### A. Network Issues
**Symptoms**: Upload fails midway, timeout errors

**Solutions**:
- Check internet connection
- Try again with stable connection
- Use wired connection instead of WiFi
- Disable VPN temporarily

##### B. Authentication Issues
**Symptoms**: "Not authenticated" or "Unauthorized"

**Solutions**:
- Ensure you're logged in
- Refresh the page
- Log out and log back in
- Clear browser cache and cookies

##### C. Storage Bucket Not Found
**Symptoms**: "Bucket does not exist" or "Storage error"

**Solutions**:
- Contact administrator
- Bucket should be created automatically
- Check Supabase dashboard for bucket status

##### D. Permission Issues
**Symptoms**: "Permission denied" or "Access denied"

**Solutions**:
- Verify you're logged in
- Check your account has upload permissions
- Contact administrator if issue persists

##### E. File Corruption
**Symptoms**: Upload completes but file is corrupted

**Solutions**:
- Try opening the PDF locally first
- Re-download the PDF if from internet
- Try a different PDF file
- Repair PDF using online tools

---

### 4. "Please select a PDF file"

**Error Message**: 
```
Please select a PDF file
```

**Cause**: Trying to submit form without selecting a PDF file.

**Solution**:
- Click the "Click to upload PDF" button
- Select a valid PDF file from your computer
- Verify the file name appears after selection

---

## Step-by-Step Upload Process

### 1. Prepare Your PDF

Before uploading:
- ✅ Verify file is actually a PDF (.pdf extension)
- ✅ Check file size is under 10MB
- ✅ Test opening the PDF locally
- ✅ Ensure PDF is not password-protected
- ✅ Remove any sensitive information

### 2. Navigate to Upload Page

1. Log in to your account
2. Click "Upload Book" in navigation
3. Fill in book details (title, author, etc.)

### 3. Upload Cover Image (Required)

1. Click "Click to upload cover image"
2. Select an image file (JPG, PNG, WebP, GIF)
3. Image will be automatically compressed
4. Wait for "Image compressed" message

### 4. Upload PDF (Optional)

1. Click "Click to upload PDF"
2. Select your PDF file
3. Verify file name appears
4. File will be validated automatically

### 5. Submit

1. Click "Upload Book" button
2. Wait for upload progress messages:
   - "Compressing cover image..."
   - "Uploading cover image..."
   - "Uploading PDF..."
   - "Creating book entry..."
3. Success message appears
4. Redirected to book detail page

---

## File Size Guidelines

### Current Limits

| File Type | Maximum Size | Recommended Size |
|-----------|--------------|------------------|
| PDF | 10MB | 2-5MB |
| Cover Image | 1MB | 100-500KB |

### Why These Limits?

- **Performance**: Faster uploads and downloads
- **Storage**: Efficient use of storage space
- **User Experience**: Quick page loads
- **Bandwidth**: Reduced data usage

### Typical PDF Sizes

| Book Type | Typical Size | Notes |
|-----------|--------------|-------|
| Text-only novel | 500KB - 2MB | Small, efficient |
| Novel with images | 2MB - 5MB | Moderate size |
| Illustrated book | 5MB - 10MB | Near limit |
| Comic/Graphic novel | 10MB+ | May need compression |
| Technical manual | 5MB - 15MB | Often needs compression |

---

## Browser-Specific Issues

### Chrome/Edge

**Issue**: Upload fails silently

**Solution**:
1. Check console (F12 → Console tab)
2. Look for error messages
3. Disable extensions temporarily
4. Try incognito mode

### Firefox

**Issue**: File picker doesn't open

**Solution**:
1. Check browser permissions
2. Allow file access for the site
3. Update Firefox to latest version

### Safari

**Issue**: Upload progress stuck

**Solution**:
1. Clear Safari cache
2. Disable "Prevent cross-site tracking"
3. Try different browser

---

## Advanced Troubleshooting

### Check Browser Console

1. Press F12 (or Cmd+Option+I on Mac)
2. Click "Console" tab
3. Look for red error messages
4. Copy error message for support

### Check Network Tab

1. Press F12
2. Click "Network" tab
3. Click "Upload Book" button
4. Look for failed requests (red)
5. Click failed request to see details

### Verify Storage Bucket

Administrators can check:
1. Go to Supabase Dashboard
2. Click "Storage"
3. Look for "app-7flusvzm3281_book_pdfs" bucket
4. Verify bucket exists and is public
5. Check bucket policies

### Test with Sample PDF

Try uploading a small test PDF:
1. Create a simple PDF (1 page, text only)
2. Ensure it's under 1MB
3. Try uploading this test file
4. If successful, issue is with original file

---

## Prevention Tips

### Before Uploading

1. **Test Locally**: Open PDF on your computer first
2. **Check Size**: Verify file is under 10MB
3. **Stable Connection**: Use reliable internet
4. **Valid Format**: Ensure file is actually PDF
5. **No Passwords**: Remove password protection

### Best Practices

1. **Compress First**: Always compress large PDFs
2. **Optimize Images**: Reduce image quality in PDF
3. **Remove Extras**: Delete unnecessary pages
4. **Test Upload**: Try with small file first
5. **Save Backup**: Keep original file safe

---

## Error Code Reference

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 413 | Payload too large | File exceeds 10MB limit |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | No upload permission |
| 404 | Not found | Bucket doesn't exist |
| 500 | Server error | Contact administrator |

---

## Getting Help

### Information to Provide

When reporting PDF upload issues:

1. **Error Message**: Exact error text
2. **File Details**:
   - File size
   - File name
   - Where file came from
3. **Browser**: Chrome, Firefox, Safari, etc.
4. **Steps Taken**: What you tried before error
5. **Console Errors**: Screenshot of browser console
6. **Network Tab**: Screenshot of failed request

### Where to Get Help

1. **Check This Guide**: Review all sections
2. **Check Browser Console**: Look for specific errors
3. **Try Different File**: Test with another PDF
4. **Contact Support**: Provide all information above

---

## Quick Fixes Checklist

Try these in order:

- [ ] Verify file is actually a PDF (.pdf extension)
- [ ] Check file size is under 10MB
- [ ] Compress PDF if too large
- [ ] Ensure you're logged in
- [ ] Refresh the page
- [ ] Clear browser cache
- [ ] Try different browser
- [ ] Check internet connection
- [ ] Try smaller test PDF
- [ ] Check browser console for errors
- [ ] Disable browser extensions
- [ ] Try incognito/private mode

---

## Technical Details

### Storage Configuration

```
Bucket Name: app-7flusvzm3281_book_pdfs
Public Access: Yes (read-only)
File Size Limit: 10MB (10,485,760 bytes)
Allowed MIME Types: application/pdf
```

### Upload Process

1. **Frontend Validation**:
   - File type check (must be PDF)
   - File size check (must be ≤ 10MB)
   - Filename sanitization

2. **Backend Upload**:
   - Upload to Supabase Storage
   - Generate public URL
   - Store URL in database

3. **Security**:
   - Authentication required
   - RLS policies enforced
   - File type validation

---

## Success Indicators

Upload is successful when:
- ✅ No error messages appear
- ✅ Success toast notification shows
- ✅ Redirected to book detail page
- ✅ PDF download link appears on book page
- ✅ PDF can be downloaded and opened

---

## Still Having Issues?

If you've tried everything and still can't upload:

1. **Document the Issue**:
   - Take screenshots
   - Copy error messages
   - Note exact steps

2. **Try Alternatives**:
   - Upload without PDF (add later)
   - Link to external PDF hosting
   - Contact administrator

3. **Report the Bug**:
   - Provide all details
   - Include browser/OS info
   - Attach sample file (if possible)

---

**Remember**: PDF upload is optional. You can always upload the book without a PDF and add it later!
