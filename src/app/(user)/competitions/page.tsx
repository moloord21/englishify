'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/Button'

interface Competition {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  participants_count: number
  max_participants: number
  prize: number
  registered: boolean
}

export default function CompetitionsPage() {
  const { user } = useAuth()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCompetitions()
    }
  }, [user])

  async function loadCompetitions() {
    try {
      // جلب المسابقات النشطة
      const { data: activeCompetitions } = await supabase
        .from('competitions')
        .select(`
          *,
          participants:competition_participants(count)
        `)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true })

      // التحقق من تسجيل المستخدم في كل مسابقة
      const { data: userRegistrations } = await supabase
        .from('competition_participants')
        .select('competition_id')
        .eq('user_id', user?.id)

      const competitionsWithStatus = activeCompetitions?.map(comp => ({
        ...comp,
        participants_count: comp.participants[0].count,
        registered: userRegistrations?.some(r => r.competition_id === comp.id) || false
      }))

      setCompetitions(competitionsWithStatus || [])
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegistration(competitionId: string, isRegistered: boolean) {
    try {
      if (isRegistered) {
        await supabase
          .from('competition_participants')
          .delete()
          .eq('competition_id', competitionId)
          .eq('user_id', user?.id)
      } else {
        await supabase
          .from('competition_participants')
          .insert([
            {
              competition_id: competitionId,
              user_id: user?.id
            }
          ])
      }

      await loadCompetitions()
    } catch (error) {
      console.error('Error updating registration:', error)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">المسابقات</h1>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => (
              <div
                key={competition.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{competition.title}</h2>
                  <p className="text-gray-600 mb-4">{competition.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">تاريخ البدء:</span>
                      <span>{new Date(competition.start_date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">تاريخ الانتهاء:</span>
                      <span>{new Date(competition.end_date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">المشاركون:</span>
                      <span>{competition.participants_count}/{competition.max_participants}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-indigo-600">
                      <span>الجائزة:</span>
                      <span>{competition.prize} نقطة</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRegistration(competition.id, competition.registered)}
                    className={`w-full ${
                      competition.registered
                        ? 'bg-red-600 hover:bg-red-700'
                        : competition.participants_count >= competition.max_participants
                        ? 'bg-gray-400 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!competition.registered && competition.participants_count >= competition.max_participants}
                  >
                    {competition.registered
                      ? 'إلغاء التسجيل'
                      : competition.participants_count >= competition.max_participants
                      ? 'اكتمل العدد'
                      : 'سجل الآن'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
