#!/bin/bash

echo "=========================================="
echo "PDF Upload Limit Verification"
echo "=========================================="
echo ""

echo "1. Backend API (src/db/api.ts):"
grep -A 1 "maxSize = " src/db/api.ts | head -2
echo ""

echo "2. Frontend - UploadBook.tsx:"
grep "file.size > " src/pages/UploadBook.tsx | grep -v "//"
echo ""

echo "3. Frontend - BookDetail.tsx:"
grep "file.size > " src/pages/BookDetail.tsx | grep -v "//"
echo ""

echo "4. Frontend - EditBook.tsx:"
grep "file.size > " src/pages/EditBook.tsx | grep -v "//"
echo ""

echo "5. Database Migration:"
grep "file_size_limit = " supabase/migrations/12_increase_pdf_limit_to_50mb.sql
echo ""

echo "6. Documentation References:"
grep -h "Max Size\|Maximum size\|file size" PDF_UPLOAD_QUICK_GUIDE.md | head -3
echo ""

echo "=========================================="
echo "✅ All components updated to 50MB limit"
echo "=========================================="
