'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  id: string
  word: {
    id: string
    word: string
    translation: string
    phonetic: string
  }
  question_type: 'multiple_choice' | 'write' | 'listen'
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    fetchTest()
  }, [params.id])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && test) {
      submitTest()
    }
  }, [timeLeft])

  async function fetchTest() {
    try {
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select(`
          *,
          questions:test_questions(
            id,
            question_type,
            word:word_id(
              id,
              word,
              translation,
              phonetic
            )
          )
        `)
        .eq('id', params.id)
        .single()

      if (testError) throw testError

      setTest(testData)
      setQuestions(testData.questions)
      setTimeLeft(testData.duration * 60) // تحويل الدقائق إلى ثواني
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ في تحميل الاختبار')
    } finally {
      setLoading(false)
    }
  }

  async function submitTest() {
    try {
      setLoading(true)
      let score = 0
      const results = questions.map(question => {
        const isCorrect = 
          question.question_type === 'multiple_choice' ? 
            answers[question.id] === question.word.translation :
            answers[question.id]?.toLowerCase() === question.word.word.toLowerCase()
        
        if (isCorrect) score++
        return {
          question_id: question.id,
          answer: answers[question.id],
          is_correct: isCorrect
        }
      })

      const finalScore = (score / questions.length) * 100

      const { error } = await supabase
        .from('test_results')
        .insert([
          {
            test_id: params.id,
            user_id: user?.id,
            score: finalScore,
            answers: results
          }
        ])

      if (error) throw error

      router.push(`/tests/${params.id}/result`)
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ في حفظ نتيجة الاختبار')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const currentQuestionData = questions[currentQuestion]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <div className="text-xl font-semibold">
          الوقت المتبقي: {Math.floor(timeLeft / 60)}:{timeLeft % 60}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">
            السؤال {currentQuestion + 1} من {questions.length}
          </div>
          {currentQuestionData.question_type === 'multiple_choice' ? (
            <div>
              <h3 className="text-lg font-medium mb-4">
                ما معنى كلمة: {currentQuestionData.word.word}
              </h3>
              {/* توليد خيارات عشوائية مع الإجابة الصحيحة */}
              <div className="space-y-3">
                {generateOptions(currentQuestionData.word.translation, questions).map((option, index) => (
                  <label key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name={`question-${currentQuestionData.id}`}
                      value={option}
                      checked={answers[currentQuestionData.id] === option}
                      onChange={(e) => setAnswers({
                        ...answers,
                        [currentQuestionData.id]: e.target.value
                      })}
                      className="h-4 w-4 text-indigo-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium mb-4">
                اكتب الكلمة الإنجليزية لـ: {currentQuestionData.word.translation}
              </h3>
              <input
                type="text"
                value={answers[currentQuestionData.id] || ''}
                onChange={(e) => setAnswers({
                  ...answers,
                  [currentQuestionData.id]: e.target.value
                })}
                className="w-full p-2 border rounded-md"
                placeholder="اكتب إجابتك هنا"
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            السابق
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button onClick={submitTest}>
              إنهاء الاختبار
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            >
              التالي
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function generateOptions(correctAnswer: string, questions: Question[]): string[] {
  const options = [correctAnswer]
  const allTranslations = questions.map(q => q.word.translation)
  
  while (options.length < 4) {
    const randomTranslation = allTranslations[Math.floor(Math.random() * allTranslations.length)]
    if (!options.includes(randomTranslation)) {
      options.push(randomTranslation)
    }
  }

  return shuffle(options)
}

function shuffle(array: any[]): any[] {
  return array.sort(() => Math.random() - 0.5)
}
