'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface ReviewWord {
  id: string
  word: string
  translation: string
  phonetic: string
  strength: number
  last_reviewed: string
}

export function SmartReview() {
  const { user } = useAuth()
  const [words, setWords] = useState<ReviewWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadReviewWords()
    }
  }, [user])

  async function loadReviewWords() {
    try {
      // جلب الكلمات التي تحتاج مراجعة باستخدام خوارزمية التكرار المتباعد
      const { data } = await supabase
        .from('user_word_progress')
        .select(`
          word_id,
          strength,
          last_reviewed,
          word:word_id(
            id,
            word,
            translation,
            phonetic
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'learning')
        .order('last_reviewed', { ascending: true })

      // تصفية الكلمات التي تحتاج مراجعة بناءً على قوتها
      const now = new Date()
      const reviewWords = data
        ?.filter(item => {
          const lastReview = new Date(item.last_reviewed)
          const daysSinceReview = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24)
          const reviewInterval = Math.pow(2, item.strength) // مضاعفة الفترة مع كل مستوى قوة
          return daysSinceReview >= reviewInterval
        })
        .map(item => ({
          id: item.word.id,
          word: item.word.word,
          translation: item.word.translation,
          phonetic: item.word.phonetic,
          strength: item.strength,
          last_reviewed: item.last_reviewed
        }))

      setWords(reviewWords || [])
    } catch (error) {
      console.error('Error loading review words:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleResponse(remembered: boolean) {
    try {
      const currentWord = words[currentIndex]
      const newStrength = remembered
        ? Math.min(currentWord.strength + 1, 5)
        : Math.max(currentWord.strength - 1, 0)

      await supabase
        .from('user_word_progress')
        .update({
          strength: newStrength,
          last_reviewed: new Date().toISOString(),
          status: newStrength >= 3 ? 'learned' : 'learning'
        })
        .eq('user_id', user?.id)
        .eq('word_id', currentWord.id)

      setShowAnswer(false)
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        await loadReviewWords() // إعادة تحميل الكلمات إذا انتهينا
        setCurrentIndex(0)
      }
    } catch (error) {
      console.error('Error updating word progress:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">جاري تحميل كلمات المراجعة...</p>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold mb-2">لا توجد كلمات للمراجعة</h2>
        <p className="text-gray-600">عد لاحقاً للمراجعة</p>
      </div>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{currentWord.word}</h2>
          <p className="text-gray-600">{currentWord.phonetic}</p>
        </div>

        {showAnswer ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">الترجمة</h3>
              <p className="text-gray-800">{currentWord.translation}</p>
            </div>

            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button
                onClick={() => handleResponse(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                تذكرت ✓
              </Button>
              <Button
                onClick={() => handleResponse(false)}
                className="bg-red-600 hover:bg-red-700"
              >
                لم أتذكر ✗
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Button onClick={() => setShowAnswer(true)}>
              إظهار الترجمة
            </Button>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          {currentIndex + 1} من {words.length} كلمات
        </div>
      </div>
    </div>
  )
}
