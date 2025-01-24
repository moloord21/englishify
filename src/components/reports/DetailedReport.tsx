'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export function DetailedReport() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState({
    weeklyProgress: [],
    categoryStrength: {},
    recentActivities: []
  })

  useEffect(() => {
    if (user) {
      fetchReportData()
    }
  }, [user])

  async function fetchReportData() {
    try {
      // جلب تقدم الأسبوع
      const { data: weeklyData } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true })

      // تنظيم البيانات للرسم البياني
      const weeklyProgress = processWeeklyData(weeklyData || [])

      // جلب قوة كل فئة
      const { data: strengthData } = await supabase
        .from('user_word_progress')
        .select(`
          word_id,
          strength,
          words:word_id(
            category
          )
        `)
        .eq('user_id', user?.id)

      const categoryStrength = processCategoryStrength(strengthData || [])

      // جلب آخر الأنشطة
      const { data: activities } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setReportData({
        weeklyProgress,
        categoryStrength,
        recentActivities: activities || []
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    }
  }

  function processWeeklyData(data: any[]) {
    const days = new Array(7).fill(0).map((_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    return days.map(day => ({
      date: day,
      activities: data.filter(d => 
        d.created_at.startsWith(day)
      ).length
    }))
  }

  function processCategoryStrength(data: any[]) {
    const categories: Record<string, { total: number, count: number }> = {}
    
    data.forEach(item => {
      const category = item.words?.category || 'other'
      if (!categories[category]) {
        categories[category] = { total: 0, count: 0 }
      }
      categories[category].total += item.strength
      categories[category].count++
    })

    return Object.entries(categories).reduce((acc, [category, data]) => ({
      ...acc,
      [category]: data.total / data.count
    }), {})
  }

  return (
    <div className="space-y-8">
      {/* الرسم البياني للتقدم الأسبوعي */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">التقدم الأسبوعي</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="activities"
                stroke="#4F46E5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* قوة الفئات */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">قوة الفئات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(reportData.categoryStrength).map(([category, strength]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">{category}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${(strength as number) * 20}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* آخر الأنشطة */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">آخر الأنشطة</h2>
        <div className="space-y-4">
          {reportData.recentActivities.map((activity: any) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <p className="font-medium">{activity.activity_type}</p>
                <p className="text-sm text-gray-600">
                  {new Date(activity.created_at).toLocaleDateString('ar-EG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
