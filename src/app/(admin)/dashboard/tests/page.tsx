'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/Button'
import { TestForm } from '@/components/admin/TestForm'

export default function AdminTestsPage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewTestForm, setShowNewTestForm] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [])

  async function fetchTests() {
    try {
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          lessons:lesson_id (title),
          questions:test_questions (id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTests(data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة الاختبارات</h1>
          <Button onClick={() => setShowNewTestForm(!showNewTestForm)}>
            {showNewTestForm ? 'إلغاء' : 'إضافة اختبار جديد'}
          </Button>
        </div>

        {showNewTestForm && (
          <div className="mb-8">
            <TestForm onSuccess={() => {
              fetchTests()
              setShowNewTestForm(false)
            }} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tests.map((test: any) => (
                <li key={test.id} className="px-4 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{test.title}</h3>
                      <p className="text-sm text-gray-500">
                        الدرس: {test.lessons?.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        عدد الأسئلة: {test.questions?.length || 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.location.href = `/admin/tests/${test.id}/questions`}
                      >
                        إدارة الأسئلة
                      </Button>
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
