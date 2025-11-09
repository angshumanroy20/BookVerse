export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: number;
  title: string;
  content: string;
}

export interface Bookmark {
  bookId: string;
  chapterId: number;
  position: number;
  text: string;
  timestamp: number;
}