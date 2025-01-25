'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    fullName: '',
    dailyGoal: 10,
    notifications: {
      email: true,
      dailyReminder: true,
      weeklyProgress: true
    },
    preferences: {
      language: 'ar',
      theme: 'light',
      exerciseType: 'mixed'
    }
  })

  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        fullName: profile.full_name,
        ...profile.settings
      }))
    }
  }, [profile])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: settings.fullName,
          settings: {
            dailyGoal: settings.dailyGoal,
            notifications: settings.notifications,
            preferences: settings.preferences
          }
        })
        .eq('id', user?.id)

      if (error) throw error

      alert('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">إعدادات الحساب</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* المعلومات الشخصية */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">المعلومات الشخصية</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  id="fullName"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={settings.fullName}
                  onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
                  value={user?.email}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* أهداف التعلم */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">أهداف التعلم</h2>
            <div>
              <label htmlFor="dailyGoal" className="block text-sm font-medium text-gray-700">
                الهدف اليومي (عدد الكلمات)
              </label>
              <input
                type="number"
                id="dailyGoal"
                min="1"
                max="50"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* الإشعارات */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">إعدادات الإشعارات</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">إشعارات البريد الإلكتروني</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        email: e.target.checked
                      }
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">التذكير اليومي</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.notifications.dailyReminder}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: {
                        ...settings.notifications,
                        dailyReminder: e.target.checked
                      }
                    })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* التفضيلات */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">تفضيلات التعلم</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  المظهر
                </label>
                <select
                  id="theme"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={settings.preferences.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      theme: e.target.value
                    }
                  })}
                >
                  <option value="light">فاتح</option>
                  <option value="dark">داكن</option>
                </select>
              </div>

              <div>
                <label htmlFor="exerciseType" className="block text-sm font-medium text-gray-700">
                  نوع التمارين المفضل
                </label>
                <select
                  id="exerciseType"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={settings.preferences.exerciseType}
                  onChange={(e) => setSettings({
                    ...settings,
                    preferences: {
                      ...settings.preferences,
                      exerciseType: e.target.value
                    }
                  })}
                >
                  <option value="mixed">متنوع</option>
                  <option value="writing">كتابة</option>
                  <option value="reading">قراءة</option>
                  <option value="listening">استماع</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" isLoading={loading}>
              حفظ الإعدادات
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
