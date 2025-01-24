'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Lesson } from '@/lib/types'
import { LessonCard } from '@/components/lessons/LessonCard'
import { Navigation } from '@/components/shared/Navigation'

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLessons() {
      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (error) throw error
        setLessons(data || [])
      } catch (error) {
        console.error('Error fetching lessons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">الدروس المتاحة</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center text-gray-600">
            لا توجد دروس متاحة حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
