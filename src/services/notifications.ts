import { supabase } from '@/lib/supabase/client'

export const notificationService = {
  async send(userId: string, message: string, type: string = 'info') {
    try {
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            message,
            type,
            read: false
          }
        ])
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  },

  async markAsRead(notificationId: string) {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  },

  async getUnreadCount(userId: string) {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('read', false)

      return count || 0
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}
