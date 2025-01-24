'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Lesson } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Navigation } from '@/components/shared/Navigation'

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
  }, [])

  async function fetchLessons() {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLessons(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleLessonStatus(lesson: Lesson) {
    try {
      const newStatus = lesson.status === 'published' ? 'draft' : 'published'
      const { error } = await supabase
        .from('lessons')
        .update({ status: newStatus })
        .eq('id', lesson.id)

      if (error) throw error
      await fetchLessons()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة الدروس</h1>
          <Button
            onClick={() => window.location.href = '/admin/lessons/new'}
          >
            إضافة درس جديد
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium">{lesson.title}</h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {lesson.content}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={lesson.status === 'published' ? 'secondary' : 'primary'}
                          onClick={() => toggleLessonStatus(lesson)}
                        >
                          {lesson.status === 'published' ? 'إلغاء النشر' : 'نشر'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => window.location.href = `/admin/lessons/${lesson.id}/edit`}
                        >
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  )
}
