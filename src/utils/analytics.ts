import { supabase } from '@/lib/supabase/client'

export const analytics = {
  async trackActivity(userId: string, activityType: string, data: any = {}) {
    try {
      await supabase
        .from('user_activities')
        .insert([
          {
            user_id: userId,
            activity_type: activityType,
            activity_data: data
          }
        ])
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  },

  async trackLessonProgress(userId: string, lessonId: string, progress: number) {
    try {
      const { data: existing } = await supabase
        .from('user_lesson_progress')
        .select()
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (existing) {
        await supabase
          .from('user_lesson_progress')
          .update({ progress, last_accessed: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_lesson_progress')
          .insert([
            {
              user_id: userId,
              lesson_id: lessonId,
              progress,
              last_accessed: new Date().toISOString()
            }
          ])
      }
    } catch (error) {
      console.error('Error tracking lesson progress:', error)
    }
  },

  async trackWordLearning(userId: string, wordId: string, success: boolean) {
    try {
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select()
        .eq('user_id', userId)
        .eq('word_id', wordId)
        .single()

      const newStrength = success
        ? Math.min((existing?.strength || 0) + 1, 5)
        : Math.max((existing?.strength || 0) - 1, 0)

      if (existing) {
        await supabase
          .from('user_word_progress')
          .update({
            strength: newStrength,
            last_reviewed: new Date().toISOString(),
            status: newStrength >= 3 ? 'learned' : 'learning'
          })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('user_word_progress')
          .insert([
            {
              user_id: userId,
              word_id: wordId,
              strength: success ? 1 : 0,
              status: 'learning',
              last_reviewed: new Date().toISOString()
            }
          ])
      }
    } catch (error) {
      console.error('Error tracking word learning:', error)
    }
  }
}
