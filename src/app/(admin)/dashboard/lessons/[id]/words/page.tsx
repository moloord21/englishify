'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Word, Lesson } from '@/lib/types'
import { Navigation } from '@/components/shared/Navigation'
import { WordForm } from '@/components/admin/WordForm'
import { Button } from '@/components/ui/Button'

export default function LessonWordsPage() {
  const params = useParams()
  const lessonId = params.id as string
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessonAndWords()
  }, [lessonId])

  async function fetchLessonAndWords() {
    try {
      // Fetch lesson details
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

      // Fetch lesson words
      const { data: wordsData, error: wordsError } = await supabase
        .from('words')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: true })

      if (wordsError) throw wordsError
      setWords(wordsData || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteWord(wordId: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الكلمة؟')) return

    try {
      const { error } = await supabase
        .from('words')
        .delete()
        .eq('id', wordId)

      if (error) throw error
      await fetchLessonAndWords()
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء حذف الكلمة')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{lesson?.title}</h1>
          <p className="text-gray-600">إدارة كلمات الدرس</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">إضافة كلمة جديدة</h2>
          <WordForm lessonId={lessonId} onSuccess={fetchLessonAndWords} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">قائمة الكلمات</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {words.map((word) => (
                <li key={word.id} className="px-4 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{word.word}</h3>
                      <p className="text-gray-600">{word.translation}</p>
                      {word.phonetic && (
                        <p className="text-sm text-gray-500">{word.phonetic}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteWord(word.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
