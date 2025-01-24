'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export function ProgressTracker() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalWords: 0,
    learnedWords: 0,
    completedTests: 0,
    averageScore: 0,
    streak: 0
  })

  useEffect(() => {
    if (user) {
      fetchProgress()
    }
  }, [user])

  async function fetchProgress() {
    try {
      // جلب إحصائيات الكلمات المتعلمة
      const { data: learnedWords, error: wordsError } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'learned')

      // جلب نتائج الاختبارات
      const { data: testResults, error: testsError } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user?.id)

      if (wordsError || testsError) throw wordsError || testsError

      // حساب المتوسط
      const averageScore = testResults?.length
        ? testResults.reduce((acc, curr) => acc + curr.score, 0) / testResults.length
        : 0

      setStats({
        totalWords: await getTotalWords(),
        learnedWords: learnedWords?.length || 0,
        completedTests: testResults?.length || 0,
        averageScore: Math.round(averageScore),
        streak: await calculateStreak()
      })
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  async function getTotalWords() {
    const { count } = await supabase
      .from('words')
      .select('*', { count: 'exact' })
    
    return count || 0
  }

  async function calculateStreak() {
    const { data: activities } = await supabase
      .from('user_activities')
      .select('created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (!activities?.length) return 0

    let streak = 0
    const today = new Date()
    let currentDate = new Date(activities[0].created_at)

    while (
      currentDate.getTime() > today.getTime() - (streak + 1) * 24 * 60 * 60 * 1000 &&
      activities.find(a => 
        new Date(a.created_at).toDateString() === new Date(today.getTime() - streak * 24 * 60 * 60 * 1000).toDateString()
      )
    ) {
      streak++
    }

    return streak
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">تقدمك في التعلم</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-indigo-600">
            {stats.learnedWords}/{stats.totalWords}
          </div>
          <div className="text-sm text-gray-600">الكلمات المتعلمة</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-green-600">
            {stats.averageScore}%
          </div>
          <div className="text-sm text-gray-600">متوسط درجات الاختبارات</div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600">
            {stats.streak} أيام
          </div>
          <div className="text-sm text-gray-600">سلسلة التعلم المتواصل</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${(stats.learnedWords / stats.totalWords) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-600 mt-2">
          أكملت {Math.round((stats.learnedWords / stats.totalWords) * 100)}% من المحتوى
        </div>
      </div>
    </div>
  )
}
