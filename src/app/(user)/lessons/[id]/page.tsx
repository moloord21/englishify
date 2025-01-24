'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Lesson, Word } from '@/lib/types'
import { Navigation } from '@/components/shared/Navigation'

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id as string
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchLessonAndWords()
  }, [lessonId])

  async function fetchLessonAndWords() {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError
      setLesson(lessonData)

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

  const toggleTranslation = (wordId: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [wordId]: !prev[wordId]
    }))
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
          <h1 className="text-3xl font-bold mb-4">{lesson?.title}</h1>
          <div className="prose max-w-none">
            {lesson?.content}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">كلمات الدرس</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.map((word) => (
              <div
                key={word.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer"
                onClick={() => toggleTranslation(word.id)}
              >
                <h3 className="text-lg font-medium mb-2">{word.word}</h3>
                {word.phonetic && (
                  <p className="text-sm text-gray-500 mb-2">{word.phonetic}</p>
                )}
                <p className={`text-gray-600 transition-opacity duration-200 ${
                  showTranslation[word.id] ? 'opacity-100' : 'opacity-0'
                }`}>
                  {word.translation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
