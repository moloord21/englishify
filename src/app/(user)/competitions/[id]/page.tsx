'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'

interface CompetitionDetails {
  id: string
  title: string
  description: string
  rules: string[]
  start_date: string
  end_date: string
  prize: number
  participants: {
    user: {
      full_name: string
    }
    score: number
  }[]
}

export default function CompetitionDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const [competition, setCompetition] = useState<CompetitionDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadCompetitionDetails()
    }
  }, [params.id])

  async function loadCompetitionDetails() {
    try {
      const { data } = await supabase
        .from('competitions')
        .select(`
          *,
          participants:competition_participants(
            score,
            user:user_id(
              full_name
            )
          )
        `)
        .eq('id', params.id)
        .single()

      setCompetition(data)
    } catch (error) {
      console.error('Error loading competition details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!competition) {
    return (
      <div>
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">المسابقة غير موجودة</h1>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{competition.title}</h1>
            <p className="text-gray-600 mb-6">{competition.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">قواعد المسابقة</h2>
                <ul className="list-disc list-inside space-y-2">
                  {competition.rules.map((rule, index) => (
                    <li key={index} className="text-gray-600">{rule}</li>
                  ))}
                </ul>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">تاريخ البدء:</span>
                    <span>{new Date(competition.start_date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">تاريخ الانتهاء:</span>
                    <span>{new Date(competition.end_date).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-indigo-600">
                    <span>الجائزة:</span>
                    <span>{competition.prize} نقطة</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">المتسابقون</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  {competition.participants
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((participant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center">
                          <span className="w-8 text-center font-medium">
                            {index + 1}
                          </span>
                          <span>{participant.user.full_name}</span>
                        </div>
                        <span className="font-medium">{participant.score || 0}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
