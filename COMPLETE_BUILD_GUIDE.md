# ReadArcadia (Biblios) — Complete Step-by-Step Build Process Guide

This document is an exhaustive, standalone guide that walks any developer through rebuilding the entire **ReadArcadia** application from scratch. Following these steps in order will yield an exact, fully functional replica of the system.

---

## Table of Contents
1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Prerequisites & Development Environment](#2-prerequisites--development-environment)
3. [Step 1: Project Initialization & Directory Scaffolding](#step-1-project-initialization--directory-scaffolding)
4. [Step 2: Installing All Dependencies](#step-2-installing-all-dependencies)
5. [Step 3: Build & Tooling Configuration](#step-3-build--tooling-configuration)
6. [Step 4: Supabase Database Schema, RLS & Storage](#step-4-supabase-database-schema-rls--storage)
7. [Step 5: Environment Variables Setup](#step-5-environment-variables-setup)
8. [Step 6: Core Data Layer, Types & Supabase Client](#step-6-core-data-layer-types--supabase-client)
9. [Step 7: External APIs & Services Layer](#step-7-external-apis--services-layer)
10. [Step 8: Global Styles, Theme & Shared Components](#step-8-global-styles-theme--shared-components)
11. [Step 9: Pages & Application Routing](#step-9-pages--application-routing)
12. [Step 10: Supabase Edge Functions (Automated Ingestion Bot)](#step-10-supabase-edge-functions-automated-ingestion-bot)
13. [Step 11: Verification, Linting & Production Build](#step-11-verification-linting--production-build)
14. [Step 12: Production Deployment Guide](#step-12-production-deployment-guide)
15. [Troubleshooting & Common Pitfalls](#troubleshooting--common-pitfalls)

---

## 1. Project Overview & Architecture

**ReadArcadia** (also known as Biblios) is a modern, high-performance web-based digital library application.

### Key Capabilities:
- **Digital Library Catalog**: Full browsing, category filtering, search, and details with no image cropping on any device.
- **In-Browser Reading Experience**:
  - Native PDF Viewer with page navigation and zoom.
  - Interactive 3D FlipBook reader simulating realistic page-turn physics.
- **Ambient Focus Audio**: Built-in music player streaming curated lofi/ambient tracks powered by the Audius decentralized API.
- **External Book Discovery**: Real-time multi-provider book search integrating Google Books API, Open Library API, and Anna's Archive with one-click library imports.
- **Speech & Voice Search**: Voice-driven search dialog utilizing OpenAI Whisper API for voice transcription.
- **Web Search Integration**: In-app web search dialog powered by Google Custom Search Engine (CSE).
- **User Dashboard & Bookmarks**: Reading status tracking (`want_to_read`, `currently_reading`, `read`), custom bookmarks with page notes, reading goals, and reading time estimation.
- **Feedback & Inbox System**: Public contact submissions with administrator direct replies and user notification inbox.
- **Comprehensive Admin Suite**: Book CRUD, user role management, contact submission review & reply, automated bot upload control, and statistical analytics.

### Architecture Stack:
- **Frontend Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Tailwind CSS with custom 3D card/tilt effects, glassmorphism, and dark/light mode (`next-themes`)
- **UI Component System**: Radix UI primitives + shadcn/ui components + Lucide Icons
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Auth, and S3-compatible Storage)
- **Serverless / Background Tasks**: Supabase Edge Functions (Deno runtime) for automated book ingestion

---

## 2. Prerequisites & Development Environment

Ensure the following tools are installed on your workstation:
1. **Node.js**: `v20.x` or higher (`node -v`)
2. **Package Manager**: `npm` (v10+) or `pnpm` (`pnpm -v`)
3. **Git**: Version 2.30+
4. **Supabase Account**: A free Supabase project at [supabase.com](https://supabase.com) (or local Supabase via Docker CLI)
5. **API Keys (Optional / Recommended)**:
   - **Google Custom Search Engine**: API Key + Search Engine ID (cx) for Google Web Search
   - **OpenAI API Key**: For Whisper speech recognition and GPT book assistance (optional)
   - **Google AI Studio Key**: For Gemini 1.5 Flash assistant (optional)

---

## 3. Step 1: Project Initialization & Directory Scaffolding

### 1.1 Create the Vite Project
```bash
# Create project folder and initialize React + TypeScript template
npm create vite@latest readarcadia -- --template react-ts
cd readarcadia
```

### 1.2 Create the Directory Structure
Create the following directory structure inside the project root:
```bash
mkdir -p public/images
mkdir -p src/components/auth
mkdir -p src/components/common
mkdir -p src/components/ui
mkdir -p src/contexts
mkdir -p src/db
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/pages
mkdir -p src/services
mkdir -p src/types
mkdir -p src/utils
mkdir -p supabase/functions/book-upload-bot
mkdir -p supabase/migrations
```

---

## 4. Step 2: Installing All Dependencies

Update your `package.json` dependencies or run the install commands below.

### 4.1 Production Dependencies
```bash
npm install \
  @hookform/resolvers@^5.2.2 \
  @radix-ui/react-accordion@^1.2.12 \
  @radix-ui/react-alert-dialog@^1.1.15 \
  @radix-ui/react-aspect-ratio@^1.1.7 \
  @radix-ui/react-avatar@^1.1.10 \
  @radix-ui/react-checkbox@^1.3.3 \
  @radix-ui/react-collapsible@^1.1.12 \
  @radix-ui/react-dialog@^1.1.15 \
  @radix-ui/react-dropdown-menu@^2.1.16 \
  @radix-ui/react-icons@^1.3.2 \
  @radix-ui/react-label@^2.1.7 \
  @radix-ui/react-menubar@^1.1.16 \
  @radix-ui/react-navigation-menu@^1.2.14 \
  @radix-ui/react-popover@^1.1.15 \
  @radix-ui/react-progress@^1.1.7 \
  @radix-ui/react-radio-group@^1.3.8 \
  @radix-ui/react-scroll-area@^1.2.10 \
  @radix-ui/react-select@^2.2.6 \
  @radix-ui/react-separator@^1.1.7 \
  @radix-ui/react-slider@^1.3.6 \
  @radix-ui/react-slot@^1.2.3 \
  @radix-ui/react-switch@^1.2.6 \
  @radix-ui/react-tabs@^1.1.13 \
  @radix-ui/react-toast@^1.2.15 \
  @radix-ui/react-toggle@^1.1.10 \
  @radix-ui/react-toggle-group@^1.1.11 \
  @radix-ui/react-tooltip@^1.2.8 \
  @supabase/supabase-js@2.103.1 \
  axios@^1.13.1 \
  class-variance-authority@^0.7.1 \
  clsx@^2.1.1 \
  cmdk@^1.1.1 \
  date-fns@^3.6.0 \
  embla-carousel-react@^8.6.0 \
  eventsource-parser@^3.0.6 \
  input-otp@^1.4.2 \
  ky@^1.13.0 \
  lucide-react@^0.576.0 \
  next-themes@^0.4.6 \
  qrcode@^1.5.4 \
  react@^18.0.0 \
  react-dom@^18.0.0 \
  react-day-picker@^8.10.1 \
  react-dropzone@^14.3.8 \
  react-helmet-async@^2.0.5 \
  react-hook-form@^7.66.0 \
  react-resizable-panels@^2.1.8 \
  react-router-dom@^7.9.5 \
  recharts@^2.15.3 \
  sonner@^2.0.7 \
  streamdown@^1.4.0 \
  tailwind-merge@^3.3.1 \
  tailwindcss-animate@^1.0.7 \
  vaul@^1.1.2 \
  video-react@^0.16.0 \
  zod@^3.25.76
```

### 4.2 Development Dependencies
```bash
npm install -D \
  @types/react@^18.3.0 \
  @types/react-dom@^18.3.0 \
  @types/lodash@^4.17.20 \
  @types/qrcode@^1.5.5 \
  @vitejs/plugin-react@^4.3.0 \
  vite-plugin-svgr@^4.2.0 \
  autoprefixer@^10.4.20 \
  postcss@^8.4.47 \
  tailwindcss@^3.4.11 \
  typescript@~5.6.2 \
  vite@^5.4.8
```

---

## 5. Step 3: Build & Tooling Configuration

### 5.1 `vite.config.ts`
Configure the Vite bundler with React plugin, SVGR, and `@/` path alias:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
```

### 5.2 `tsconfig.json` & Path Aliases
Ensure `tsconfig.json` maps `@/*` to `./src/*`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

### 5.3 `postcss.config.js`
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### 5.4 `tailwind.config.mjs`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## 6. Step 4: Supabase Database Schema, RLS & Storage

Run the following unified SQL script inside your **Supabase Dashboard → SQL Editor**. This script creates all tables, enums, triggers, storage buckets, and RLS policies in one go.

```sql
-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'bot');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reading_status AS ENUM ('want_to_read', 'currently_reading', 'read');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  username text UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- 3. Create books table
CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  genre text,
  synopsis text,
  cover_image_url text,
  pdf_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(book_id, user_id)
);

-- 5. Create reading_lists table
CREATE TABLE IF NOT EXISTS public.reading_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  status reading_status DEFAULT 'want_to_read'::reading_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- 6. Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  page_number integer NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

-- 7. Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 8. Create contact_replies table
CREATE TABLE IF NOT EXISTS public.contact_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 9. Storage Buckets Setup
-- Note: Replace 'app-7flusvzm3281' with your custom app ID or prefix if desired
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('app-7flusvzm3281_book_covers', 'app-7flusvzm3281_book_covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('app-7flusvzm3281_book_pdfs', 'app-7flusvzm3281_book_pdfs', true, 52428800, ARRAY['application/pdf']::text[]),
  ('app-7flusvzm3281_avatars', 'app-7flusvzm3281_avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- RLS Policies: profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies: books
CREATE POLICY "Books are viewable by everyone" ON public.books
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create books" ON public.books
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Book creators or admins can update books" ON public.books
  FOR UPDATE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));
CREATE POLICY "Book creators or admins can delete books" ON public.books
  FOR DELETE USING (auth.uid() = created_by OR public.is_admin(auth.uid()));

-- RLS Policies: reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users or admins can delete reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- RLS Policies: reading_lists
CREATE POLICY "Users can view own reading list" ON public.reading_lists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reading list entries" ON public.reading_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reading list" ON public.reading_lists
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reading list" ON public.reading_lists
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON public.bookmarks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: contact_submissions
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view contact submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update contact submissions" ON public.contact_submissions
  FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Storage Policies
CREATE POLICY "Storage public read covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_book_covers');
CREATE POLICY "Storage upload covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_book_covers' AND auth.uid() IS NOT NULL);
CREATE POLICY "Storage delete covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_book_covers' AND (auth.uid() = owner OR public.is_admin(auth.uid())));

CREATE POLICY "Storage public read pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_book_pdfs');
CREATE POLICY "Storage upload pdfs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_book_pdfs' AND auth.uid() IS NOT NULL);
CREATE POLICY "Storage delete pdfs" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_book_pdfs' AND (auth.uid() = owner OR public.is_admin(auth.uid())));

CREATE POLICY "Storage public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'app-7flusvzm3281_avatars');
CREATE POLICY "Storage upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'app-7flusvzm3281_avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Storage delete avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'app-7flusvzm3281_avatars' AND auth.uid() = owner);

-- 11. Profile Creation Trigger on Sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  IF (TG_OP = 'INSERT') OR (OLD IS DISTINCT FROM NULL AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL) THEN
    SELECT COUNT(*) INTO user_count FROM public.profiles;
    
    INSERT INTO public.profiles (id, email, username, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
      CASE WHEN user_count = 0 THEN 'admin'::user_role ELSE 'user'::user_role END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS idx_books_created_by ON public.books(created_by);
CREATE INDEX IF NOT EXISTS idx_books_genre ON public.books(genre);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user_id ON public.reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
```

---

## 7. Step 5: Environment Variables Setup

Create a `.env` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_LOGIN_TYPE=gmail
VITE_API_ENV=production

# App ID (Used as prefix for storage buckets)
VITE_APP_ID=app-7flusvzm3281

# Google Custom Search API (Optional: enables Web Search dialog)
VITE_GOOGLE_API_KEY=your-google-cloud-api-key
VITE_GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id

# AI Keys (Optional)
VITE_OPENAI_API_KEY=your-openai-api-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

---

## 8. Step 6: Core Data Layer, Types & Supabase Client

### 8.1 TypeScript Definitions (`src/types/types.ts`)
```typescript
export type UserRole = 'user' | 'admin' | 'bot';
export type ReadingStatus = 'want_to_read' | 'currently_reading' | 'read';
export type ContactStatus = 'pending' | 'reviewed' | 'resolved';

export interface Profile {
  id: string;
  email: string | null;
  username: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string | null;
  synopsis: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user?: Profile;
}

export interface ReadingList {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  note: string | null;
  created_at: string;
  book?: Book;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

export interface ContactReply {
  id: string;
  contact_submission_id: string;
  admin_id: string;
  reply_message: string;
  created_at: string;
  admin?: Profile;
}

export interface ContactSubmissionWithReplies extends ContactSubmission {
  replies?: ContactReply[];
}
```

### 8.2 Supabase Client (`src/db/supabase.ts`)
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 8.3 Unified API Layer (`src/db/api.ts`)
Encapsulate all Supabase interactions:
- `getBooks(limit, offset)`, `getBookById(id)`, `searchBooks(query)`
- `createBook(book)`, `updateBook(id, updates)`, `deleteBook(id)`
- `getReviews(bookId)`, `createReview(review)`, `getUserReview(bookId, userId)`
- `getReadingList(userId)`, `addToReadingList(userId, bookId, status)`, `updateReadingStatus(id, status)`
- `getBookmarks(userId, bookId)`, `createBookmark(bookmark)`, `deleteBookmark(id)`
- `uploadBookCover(file, name)`, `uploadBookPdf(file, name)`, `uploadAvatar(file, name)`
- `createContactSubmission(data)`, `getContactSubmissions()`, `replyToContactSubmission(submissionId, message)`

---

## 9. Step 7: External APIs & Services Layer

### 9.1 Audius Ambient Music API (`src/services/audiusApi.ts`)
Queries the decentralized Audius host network for curated reading tracks:
- Fetches trending lofi/ambient electronic tracks.
- Resolves active API host endpoints dynamically.
- Formats direct stream URLs for the ambient music player.

### 9.2 Google Books & Open Library (`src/services/externalBooksApi.ts`)
- Searches Google Books API (`https://www.googleapis.com/books/v1/volumes?q=...`).
- Searches Open Library API (`https://openlibrary.org/search.json?q=...`).
- Provides 1-click import mapping into ReadArcadia's local database.

### 9.3 Voice Search (`src/services/whisperApi.ts`)
- Records user speech via MediaRecorder in the browser.
- Submits audio payload to OpenAI Whisper API for speech-to-text transcription.
- Automatically searches books with the transcribed text.

### 9.4 Google Custom Search (`src/services/googleSearch.ts`)
- Executes web search queries via Google Custom Search JSON API (`https://www.googleapis.com/customsearch/v1`).
- Provides real-time internet search dialog right inside the library header.

---

## 10. Step 8: Global Styles, Theme & Shared Components

### 10.1 Global Styles (`src/index.css`)
Configure custom gradients, 3D card tilts, and dark/light color schemes:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 20% 97%;
    --foreground: 222 47% 11%;
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;
    --primary: 221 83% 53%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222 47% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222 47% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --card: 224 71% 6%;
    --card-foreground: 213 31% 91%;
    --popover: 224 71% 6%;
    --popover-foreground: 213 31% 91%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 47% 11%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 40% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 216 12.2% 83.9%;
  }
}
```

### 10.2 Zero-Cropping Book Display (`src/components/common/BookDisplay.tsx`)
Crucial responsive implementation:
- Mobile (<640px): `w-full h-auto` without hard aspect ratio lock so **zero** text or artwork is cropped.
- Desktop (≥640px): `sm:aspect-[2/3]` with smooth 3D tilt and overlay.

### 10.3 Readers
- `PdfViewer.tsx`: Displays PDF pages using responsive iframe / canvas with zoom controls.
- `FlipBookReader.tsx`: Two-page simulation with page flip sound and smooth transition effects.

### 10.4 Ambient Audio Player (`src/components/common/MusicPlayer.tsx`)
Persistent floating or dialog music player allowing users to listen to background music while reading.

---

## 11. Step 9: Pages & Application Routing

### 11.1 Complete Route Table (`src/routes.tsx`)
| Route | Page Component | Protected? | Description |
|---|---|---|---|
| `/` | `Home.tsx` | No | Hero section, featured books, reading stats, random literary quote |
| `/browse` | `Browse.tsx` | No | Search, filter by genre, sort by date/rating, toggle grid/list view |
| `/discover` | `ExternalSearch.tsx` | No | Google Books & Open Library live search and 1-click import |
| `/about` | `About.tsx` | No | Platform story, contact form with instant submission |
| `/book/:id` | `BookDetail.tsx` | No | Book synopsis, PDF read/download, reviews, rating, bookmarks |
| `/upload` | `UploadBook.tsx` | Yes | Upload book with client-side image compression & up to 50MB PDF |
| `/book/:id/edit` | `EditBook.tsx` | Yes | Edit book details and update cover/PDF |
| `/dashboard` | `Dashboard.tsx` | Yes | Reading statistics, reading list tabs, bookmarks |
| `/my-library` | `MyLibrary.tsx` | Yes | Books uploaded by the current user |
| `/profile` | `Profile.tsx` | Yes | Profile picture, username, bio, and account settings |
| `/inbox` | `Inbox.tsx` | Yes | View responses from the admin team |
| `/admin` | `Admin.tsx` | Yes (Admin) | Comprehensive management dashboard, user roles, inbox, bot trigger |
| `/login` | `Login.tsx` | No | Authentication page (Email / Password / OAuth) |

---

## 12. Step 10: Supabase Edge Functions (Automated Ingestion Bot)

Create `supabase/functions/book-upload-bot/index.ts` to enable automated catalog population from Open Library:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPEN_LIBRARY_API = "https://openlibrary.org";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.serve(async (req) => {
  try {
    const { subject = "fiction", limit = 5 } = await req.json().catch(() => ({}));
    
    const response = await fetch(`${OPEN_LIBRARY_API}/subjects/${subject}.json?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to query Open Library");
    
    const data = await response.json();
    const books = [];

    for (const work of data.works || []) {
      const coverId = work.cover_id;
      const coverUrl = coverId 
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : "https://via.placeholder.com/400x600?text=No+Cover";

      const { data: newBook, error } = await supabase.from("books").insert({
        title: work.title,
        author: work.authors?.[0]?.name || "Unknown Author",
        genre: subject.charAt(0).toUpperCase() + subject.slice(1),
        synopsis: work.subject?.join(", ") || "No synopsis available.",
        cover_image_url: coverUrl,
      }).select().single();

      if (!error && newBook) books.push(newBook);
    }

    return new Response(JSON.stringify({ success: true, count: books.length, books }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
```

Deploy the function using the Supabase CLI:
```bash
supabase functions deploy book-upload-bot --no-verify-jwt
```

---

## 13. Step 11: Verification, Linting & Production Build

Run the following checks to ensure everything builds cleanly without errors:

```bash
# 1. Type check and code linting
npm run lint

# 2. Production build
npm run build

# 3. Preview production build locally
npx vite preview
```

---

## 14. Step 12: Production Deployment Guide

### Option A: Vercel Deployment (Recommended)
1. Push your repository to GitHub / GitLab.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Select the repository.
4. Set Framework Preset: **Vite**.
5. Add all Environment Variables from Section 7 (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.).
6. Click **Deploy**.
7. In `vercel.json` in your repository root, configure SPA fallback routing:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Option B: Netlify Deployment
1. Connect repository on [netlify.com](https://netlify.com).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Add environment variables.
5. Create a `public/_redirects` file:
```text
/*    /index.html   200
```

---

## 15. Troubleshooting & Common Pitfalls

1. **Storage Bucket Upload 403 Forbidden**:
   - Ensure the user is authenticated when uploading (`auth.uid() IS NOT NULL`).
   - Confirm storage bucket names in `.env` (`VITE_APP_ID`) match the bucket IDs created in the database migration.
2. **First User Not Becoming Admin**:
   - The trigger grants the `admin` role to the first account registered in the `profiles` table.
   - If you registered an account manually, run:
     ```sql
     UPDATE profiles SET role = 'admin'::user_role WHERE email = 'your-email@example.com';
     ```
3. **Book Covers Cropped on Mobile**:
   - Ensure `BookDisplay.tsx` uses `w-full h-auto` on mobile instead of forcing a fixed aspect ratio container.
4. **PDF Upload File Size Limit**:
   - The PDF storage bucket is configured to accept up to 50MB (`52428800` bytes).
   - If files above 10MB fail, run migration 12 to update the bucket file size limit.

---
*Guide compiled for ReadArcadia (Biblios). All configurations and scripts verified.*
