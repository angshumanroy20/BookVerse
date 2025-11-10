export type UserRole = 'user' | 'admin';
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
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface ReadingList {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  note: string | null;
  created_at: string;
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
}

export interface ContactSubmissionWithReplies extends ContactSubmission {
  replies?: ContactReplyWithAdmin[];
}

export interface ContactReplyWithAdmin extends ContactReply {
  admin?: Profile;
}

export interface BookWithDetails extends Book {
  creator?: Profile;
  reviews?: ReviewWithUser[];
  avg_rating?: number;
  review_count?: number;
  user_reading_status?: ReadingStatus | null;
}

export interface ReviewWithUser extends Review {
  user?: Profile;
}
