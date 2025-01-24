'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  points: number
  progress: number
  total: number
  achieved: boolean
}

export function AchievementSystem() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    if (user) {
      fetchAchievements()
    }
  }, [user])

  async function fetchAchievements() {
    try {
      // جلب معلومات الإنجازات
      const { data: userStats } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      const achievementsList: Achievement[] = [
        {
          id: 'first_lesson',
          title: 'بداية الرحلة',
          description: 'أكمل أول درس',
          icon: '🎯',
          points: 10,
          progress: userStats?.completed_lessons || 0,
          total: 1,
          achieved: (userStats?.completed_lessons || 0) >= 1
        },
        {
          id: 'word_master',
          title: 'سيد الكلمات',
          description: 'تعلم 100 كلمة',
          icon: '📚',
          points: 50,
          progress: userStats?.learned_words || 0,
          total: 100,
          achieved: (userStats?.learned_words || 0) >= 100
        },
        {
          id: 'test_champion',
          title: 'بطل الاختبارات',
          description: 'احصل على درجة كاملة في 5 اختبارات',
          icon: '🏆',
          points: 100,
          progress: userStats?.perfect_tests || 0,
          total: 5,
          achieved: (userStats?.perfect_tests || 0) >= 5
        }
      ]

      setAchievements(achievementsList)
      calculateTotalPoints(achievementsList)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  function calculateTotalPoints(achievementsList: Achievement[]) {
    const points = achievementsList
      .filter(a => a.achieved)
      .reduce((sum, a) => sum + a.points, 0)
    setTotalPoints(points)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">الإنجازات</h2>
        <div className="bg-yellow-100 px-4 py-2 rounded-full">
          <span className="text-yellow-800 font-medium">{totalPoints} نقطة</span>
        </div>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-lg border ${
              achievement.achieved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start">
              <div className="text-2xl mr-4">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        achievement.achieved ? 'bg-green-600' : 'bg-indigo-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          (achievement.progress / achievement.total) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {achievement.progress}/{achievement.total}
                  </p>
                </div>
              </div>
              {achievement.achieved && (
                <div className="text-green-600 ml-4">✓</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
