'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Word } from '@/lib/types'

interface QuestionFormProps {
  testId: string
  words: Word[]
  onSuccess?: () => void
}

export function QuestionForm({ testId, words, onSuccess }: QuestionFormProps) {
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState({
    word_id: '',
    question_type: 'multiple_choice' as 'multiple_choice' | 'write' | 'listen'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('test_questions')
        .insert([
          {
            test_id: testId,
            word_id: question.word_id,
            question_type: question.question_type
          }
        ])

      if (error) throw error

      setQuestion({
        word_id: '',
        question_type: 'multiple_choice'
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error adding question:', error)
      alert('حدث خطأ أثناء إضافة السؤال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="word" className="block text-sm font-medium text-gray-700">
          اختر الكلمة
        </label>
        <select
          id="word"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={question.word_id}
          onChange={(e) => setQuestion({ ...question, word_id: e.target.value })}
        >
          <option value="">اختر كلمة</option>
          {words.map((word) => (
            <option key={word.id} value={word.id}>
              {word.word} - {word.translation}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          نوع السؤال
        </label>
        <select
          id="type"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={question.question_type}
          onChange={(e) => setQuestion({ ...question, question_type: e.target.value as any })}
        >
          <option value="multiple_choice">اختيار من متعدد</option>
          <option value="write">كتابة</option>
          <option value="listen">استماع</option>
        </select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading}>
          إضافة السؤال
        </Button>
      </div>
    </form>
  )
}
