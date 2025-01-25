'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'

interface LeaderboardEntry {
  user_id: string
  full_name: string
  points: number
  level: number
  rank: number
  avatar_url?: string
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [timeFrame])

  async function loadLeaderboard() {
    try {
      let query = supabase
        .from('user_rankings')
        .select('*')
        .order('points', { ascending: false })
        .limit(100)

      if (timeFrame !== 'all') {
        const date = new Date()
        if (timeFrame === 'weekly') {
          date.setDate(date.getDate() - 7)
        } else {
          date.setMonth(date.getMonth() - 1)
        }
        query = query.gte('updated_at', date.toISOString())
      }

      const { data } = await query

      // إضافة الترتيب للنتائج
      const rankedData = data?.map((entry, index) => ({
        ...entry,
        rank: index + 1
      })) || []

      setLeaderboard(rankedData)

      // تحديد ترتيب المستخدم الحالي
      const currentUserRank = rankedData.find(entry => entry.user_id === user?.id)
      if (currentUserRank) {
        setUserRank(currentUserRank)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">لوحة المتصدرين</h1>

            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setTimeFrame('all')}
                  className={`px-4 py-2 rounded-md ${
                    timeFrame === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setTimeFrame('monthly')}
                  className={`px-4 py-2 rounded-md ${
                    timeFrame === 'monthly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  الشهر
                </button>
                <button
                  onClick={() => setTimeFrame('weekly')}
                  className={`px-4 py-2 rounded-md ${
                    timeFrame === 'weekly'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  الأسبوع
                </button>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center p-4 rounded-lg ${
                        entry.user_id === user?.id
                          ? 'bg-indigo-50 border border-indigo-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-8 text-center font-bold">
                        {entry.rank}
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="font-medium">{entry.full_name}</div>
                        <div className="text-sm text-gray-500">
                          المستوى {entry.level}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-indigo-600">
                        {entry.points}
                      </div>
                    </div>
                  ))}
                </div>

                {userRank && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg border-t">
                    <div className="text-center">
                      <div className="text-gray-600">ترتيبك</div>
                      <div className="text-3xl font-bold text-indigo-600">
                        #{userRank.rank}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
