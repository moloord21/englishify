import { supabase } from '@/lib/supabase/client'
import { notificationService } from '@/services/notifications'

export const rewardsSystem = {
  async awardPoints(userId: string, points: number, reason: string) {
    try {
      // إضافة النقاط للمستخدم
      await supabase.from('user_points').upsert({
        user_id: userId,
        points: supabase.sql`points + ${points}`
      })

      // تسجيل العملية
      await supabase.from('point_transactions').insert([
        {
          user_id: userId,
          points,
          reason,
          type: 'credit'
        }
      ])

      // إرسال إشعار
      await notificationService.send(
        userId,
        `حصلت على ${points} نقطة! (${reason}) 🎉`
      )

      return true
    } catch (error) {
      console.error('Error awarding points:', error)
      return false
    }
  },

  async checkAchievements(userId: string) {
    try {
      // التحقق من الإنجازات المتاحة
      const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .eq('claimed', false)

      for (const achievement of achievements || []) {
        if (await this.validateAchievement(userId, achievement)) {
          await this.claimAchievement(userId, achievement)
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  },

  async validateAchievement(userId: string, achievement: any) {
    // التحقق من شروط الإنجاز
    const { data: stats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .single()

    switch (achievement.type) {
      case 'words_learned':
        return stats.learned_words >= achievement.target
      case 'streak_days':
        return stats.current_streak >= achievement.target
      case 'tests_completed':
        return stats.completed_tests >= achievement.target
      default:
        return false
    }
  },

  async claimAchievement(userId: string, achievement: any) {
    await supabase
      .from('achievements')
      .update({ claimed: true })
      .eq('id', achievement.id)

    await this.awardPoints(
      userId,
      achievement.points,
      `إنجاز: ${achievement.title}`
    )
  }
}
