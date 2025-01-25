'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { analytics } from '@/utils/analytics'
import { notificationService } from '@/services/notifications'

interface DailyReward {
  day: number
  points: number
  claimed: boolean
  special: boolean
}

export function DailyRewards() {
  const { user } = useAuth()
  const [rewards, setRewards] = useState<DailyReward[]>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [canClaim, setCanClaim] = useState(false)

  useEffect(() => {
    if (user) {
      loadDailyRewards()
      checkStreak()
    }
  }, [user])

  async function loadDailyRewards() {
    try {
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      const lastClaim = new Date(streakData?.last_claim || 0)
      const today = new Date()
      setCanClaim(
        today.toDateString() !== lastClaim.toDateString() &&
        today.getTime() - lastClaim.getTime() < 48 * 60 * 60 * 1000
      )

      setCurrentStreak(streakData?.current_streak || 0)

      // توليد المكافآت لسبعة أيام
      const rewardsList = Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        points: i === 6 ? 100 : 20, // مكافأة خاصة لليوم السابع
        claimed: i < (streakData?.current_streak || 0),
        special: i === 6
      }))

      setRewards(rewardsList)
    } catch (error) {
      console.error('Error loading daily rewards:', error)
    }
  }

  async function checkStreak() {
    try {
      const { data: activities } = await supabase
        .from('user_activities')
        .select('created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!activities?.length) return

      const lastActivity = new Date(activities[0].created_at)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))

      if (daysDiff > 1) {
        // كسر السلسلة
        await supabase
          .from('user_streaks')
          .update({ current_streak: 0 })
          .eq('user_id', user?.id)
        
        setCurrentStreak(0)
      }
    } catch (error) {
      console.error('Error checking streak:', error)
    }
  }

  async function claimDailyReward() {
    if (!canClaim) return

    try {
      const newStreak = currentStreak + 1
      const points = rewards[currentStreak]?.points || 20

      await supabase.from('user_streaks').upsert({
        user_id: user?.id,
        current_streak: newStreak,
        last_claim: new Date().toISOString()
      })

      await supabase.from('user_points').upsert({
        user_id: user?.id,
        points: supabase.sql`points + ${points}`
      })

      await analytics.trackActivity(user?.id!, 'claim_daily_reward', {
        day: newStreak,
        points
      })

      await notificationService.send(
        user?.id!,
        `حصلت على ${points} نقطة كمكافأة يومية! 🎉`
      )

      setCurrentStreak(newStreak)
      setCanClaim(false)
      loadDailyRewards()
    } catch (error) {
      console.error('Error claiming daily reward:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">المكافآت اليومية</h2>
        <div className="text-sm text-gray-600">
          السلسلة الحالية: {currentStreak} يوم
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {rewards.map((reward) => (
          <div
            key={reward.day}
            className={`relative p-4 rounded-lg border-2 text-center ${
              reward.claimed
                ? 'bg-green-50 border-green-500'
                : reward.special
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-gray-50 border-gray-300'
            }`}
          >
            <div className="text-sm font-medium">يوم {reward.day}</div>
            <div className="text-lg font-bold mt-1">{reward.points}</div>
            {reward.claimed && (
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={claimDailyReward}
          disabled={!canClaim}
          className={`px-6 py-2 rounded-full font-medium ${
            canClaim
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canClaim ? 'استلم مكافأة اليوم' : 'عد غداً للمكافأة التالية'}
        </button>
      </div>
    </div>
  )
}
