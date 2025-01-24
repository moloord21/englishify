export type Role = 'admin' | 'user';
export type TestQuestionType = 'multiple_choice' | 'write' | 'listen';
export type WordStatus = 'new' | 'learning' | 'mastered';

export interface Profile {
  id: string;
  full_name: string | null;
  role: Role;
  points: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: string | null;
  created_by: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface Word {
  id: string;
  lesson_id: string;
  word: string;
  translation: string;
  phonetic: string | null;
  audio_url: string | null;
  image_url: string | null;
  difficulty_level: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  word_id: string;
  status: WordStatus;
  repetition_count: number;
  next_review_date: string;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: string;
  title: string;
  lesson_id: string;
  created_by: string;
  duration: number;
  created_at: string;
}
