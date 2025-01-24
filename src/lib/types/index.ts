export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  full_name?: string
  created_at: string
}

export interface Lesson {
  id: string
  title: string
  content: string
  created_by: string
  status: 'draft' | 'published'
  created_at: string
}

export interface Word {
  id: string
  lesson_id: string
  word: string
  translation: string
  phonetic?: string
  audio_url?: string
  image_url?: string
  difficulty_level: number
}
