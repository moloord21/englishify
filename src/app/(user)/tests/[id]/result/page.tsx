'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function TestResultPage() {
  const params = useParams()
  const { user } = useAuth()
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResult()
  }, [params.id])

  async function fetchResult() {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select(`
          *,
          test:test_id(
            title,
            questions:test_questions(
              id,
              word:word_id(
                word,
                translation
              )
            )
          )
        `)
        .eq('test_id', params.id)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ في تحميل النتيجة')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">{result.test.title} - النتيجة</h1>
        
        <div className="mb-8">
          <div className="text-4xl font-bold text-center text-indigo-600">
            {result.score}%
          </div>
          <div className="text-center text-gray-600 mt-2">
            {result.score >= 70 ? 'أحسنت!' : 'حاول مرة أخرى'}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">مراجعة الإجابات:</h2>
          {result.answers.map((answer: any, index: number) => {
            const question = result.test.questions.find((q: any) => q.id === answer.question_id)
            return (
              <div
                key={answer.question_id}
                className={`p-4 rounded-lg ${
                  answer.is_correct ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{question.word.word}</p>
                    <p className="text-sm text-gray-600">{question.word.translation}</p>
                  </div>
                  <div className="text-sm">
                    <p>إجابتك: {answer.answer}</p>
                    {!answer.is_correct && (
                      <p className="text-red-600">
                        الإجابة الصحيحة: {question.word.translation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href={`/tests/${params.id}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            حاول مرة أخرى
          </Link>
          <Link
            href="/lessons"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            العودة للدروس
          </Link>
        </div>
      </div>
    </div>
  )
}
