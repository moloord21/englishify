'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Navigation } from '@/components/shared/Navigation'
import { ProgressTracker } from '@/components/progress/ProgressTracker'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [recentLessons, setRecentLessons] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function fetchDashboardData() {
    try {
      // جلب الدروس الأخيرة
      const { data: lessons } = await supabase
        .from('user_lesson_progress')
        .select(`
          *,
          lesson:lesson_id(*)
        `)
        .eq('user_id', user?.id)
        .order('last_accessed', { ascending: false })
        .limit(3)

      setRecentLessons(lessons || [])

      // جلب التوصيات بناءً على مستوى المستخدم
      const { data: recommended } = await supabase
        .from('lessons')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)

      setRecommendations(recommended || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            مرحباً {profile?.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            لنواصل رحلة تعلم اللغة الإنجليزية
          </p>
        </div>

        <div className="mb-8">
          <ProgressTracker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">دروسك الأخيرة</h2>
            <div className="space-y-4">
              {recentLessons.map((item: any) => (
                <Link
                  key={item.lesson.id}
                  href={`/lessons/${item.lesson.id}`}
                  className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-medium">{item.lesson.title}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    {item.progress}% مكتمل
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">دروس موصى بها</h2>
            <div className="space-y-4">
              {recommendations.map((lesson: any) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.id}`}
                  className="block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-medium">{lesson.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {lesson.content}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
