'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface TestFormProps {
  lessonId: string
  onSuccess?: () => void
}

export function TestForm({ lessonId, onSuccess }: TestFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    duration: 30, // مدة الاختبار بالدقائق
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('User not authenticated')

      const { data: test, error } = await supabase
        .from('tests')
        .insert([
          {
            title: formData.title,
            lesson_id: lessonId,
            created_by: userData.user.id,
            duration: formData.duration
          }
        ])
        .select()
        .single()

      if (error) throw error

      setFormData({
        title: '',
        duration: 30
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating test:', error)
      alert('حدث خطأ أثناء إنشاء الاختبار')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          عنوان الاختبار
        </label>
        <input
          type="text"
          id="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          مدة الاختبار (بالدقائق)
        </label>
        <input
          type="number"
          id="duration"
          min="5"
          max="180"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" isLoading={loading}>
          إنشاء الاختبار
        </Button>
      </div>
    </form>
  )
}
