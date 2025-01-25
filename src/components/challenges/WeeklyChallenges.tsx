'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/Progress'

interface Challenge {
  id: string
  title: string
  description: string
  target: number
  current: number
  reward: number
  ends_at: string
}

export function WeeklyChallenges() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadChallenges()
    }
  }, [user])

  async function loadChallenges() {
    try {
      // جلب التحديات النشطة
      const { data: activeChallenges } = await supabase
        .from('weekly_challenges')
        .select('*')
        .gte('ends_at', new Date().toISOString())
        .order('ends_at', { ascending: true })

      // جلب تقدم المستخدم في كل تحدي
      const { data: progress } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user?.id)

      const challengesWithProgress = activeChallenges?.map(challenge => ({
        ...challenge,
        current: progress?.find(p => p.challenge_id === challenge.id)?.progress || 0
      }))

      setChallenges(challengesWithProgress || [])
    } catch (error) {
      console.error('Error loading challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6">تحديات الأسبوع</h2>

      {challenges.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          لا توجد تحديات نشطة حالياً
        </div>
      ) : (
        <div className="space-y-6">
          {challenges.map((challenge) => {
            const progress = (challenge.current / challenge.target) * 100
            const timeLeft = getRemainingTime(challenge.ends_at)

            return (
              <div
                key={challenge.id}
                className="border rounded-lg p-4 hover:border-indigo-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                  <div className="text-indigo-600 font-medium">
                    {challenge.reward} نقطة
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>
                      {challenge.current}/{challenge.target}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  متبقي: {timeLeft}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function getRemainingTime(endsAt: string): string {
  const end = new Date(endsAt)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} يوم و ${hours} ساعة`
  }
  return `${hours} ساعة`
}
