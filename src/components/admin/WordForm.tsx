'use client'

import { useState } from 'react'
import { Word } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase/client'

interface WordFormProps {
  lessonId: string
  onSuccess?: () => void
}

export function WordForm({ lessonId, onSuccess }: WordFormProps) {
  const [loading, setLoading] = useState(false)
  const [word, setWord] = useState({
    word: '',
    translation: '',
    phonetic: '',
    difficulty_level: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('words')
        .insert([
          {
            ...word,
            lesson_id: lessonId
          }
        ])

      if (error) throw error

      setWord({
        word: '',
        translation: '',
        phonetic: '',
        difficulty_level: 1
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error adding word:', error)
      alert('حدث خطأ أثناء إضافة الكلمة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="word" className="block text-sm font-medium text-gray-700">
            الكلمة بالإنجليزية
          </label>
          <input
            type="text"
            id="word"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={word.word}
            onChange={(e) => setWord({ ...word, word: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="translation" className="block text-sm font-medium text-gray-700">
            الترجمة بالعربية
          </label>
          <input
            type="text"
            id="translation"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={word.translation}
            onChange={(e) => setWord({ ...word, translation: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="phonetic" className="block text-sm font-medium text-gray-700">
            النطق الصوتي
          </label>
          <input
            type="text"
            id="phonetic"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={word.phonetic}
            onChange={(e) => setWord({ ...word, phonetic: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
            مستوى الصعوبة
          </label>
          <select
            id="difficulty"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={word.difficulty_level}
            onChange={(e) => setWord({ ...word, difficulty_level: parseInt(e.target.value) })}
          >
            <option value={1}>سهل</option>
            <option value={2}>متوسط</option>
            <option value={3}>صعب</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading}>
          إضافة الكلمة
        </Button>
      </div>
    </form>
  )
}
