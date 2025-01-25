'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/Button'

interface Friend {
  id: string
  full_name: string
  status: 'online' | 'offline'
  last_active: string
  level: number
  studied_today: boolean
}

interface FriendRequest {
  id: string
  sender: {
    id: string
    full_name: string
  }
  created_at: string
}

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFriends()
      loadFriendRequests()
    }
  }, [user])

  async function loadFriends() {
    try {
      const { data: friendsList } = await supabase
        .from('friendships')
        .select(`
          friend:friend_id(
            id,
            full_name,
            last_active,
            user_statistics(level),
            user_activities(created_at)
          )
        `)
        .eq('user_id', user?.id)

      const processedFriends = friendsList?.map(f => ({
        id: f.friend.id,
        full_name: f.friend.full_name,
        status: isOnline(f.friend.last_active) ? 'online' : 'offline',
        last_active: f.friend.last_active,
        level: f.friend.user_statistics?.[0]?.level || 1,
        studied_today: hasStudiedToday(f.friend.user_activities)
      })) || []

      setFriends(processedFriends)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  async function loadFriendRequests() {
    try {
      const { data: requestsList } = await supabase
        .from('friend_requests')
        .select(`
          id,
          sender:sender_id(
            id,
            full_name
          ),
          created_at
        `)
        .eq('recipient_id', user?.id)
        .eq('status', 'pending')

      setRequests(requestsList || [])
    } catch (error) {
      console.error('Error loading friend requests:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .ilike('full_name', `%${searchQuery}%`)
        .neq('id', user?.id)
        .limit(5)

      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  async function sendFriendRequest(recipientId: string) {
    try {
      await supabase
        .from('friend_requests')
        .insert([
          {
            sender_id: user?.id,
            recipient_id: recipientId,
            status: 'pending'
          }
        ])

      setSearchResults([])
      setSearchQuery('')
    } catch (error) {
      console.error('Error sending friend request:', error)
    }
  }

  async function handleFriendRequest(requestId: string, accept: boolean) {
    try {
      if (accept) {
        const request = requests.find(r => r.id === requestId)
        if (request) {
          await supabase
            .from('friendships')
            .insert([
              {
                user_id: user?.id,
                friend_id: request.sender.id
              },
              {
                user_id: request.sender.id,
                friend_id: user?.id
              }
            ])
        }
      }

      await supabase
        .from('friend_requests')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', requestId)

      loadFriendRequests()
      if (accept) loadFriends()
    } catch (error) {
      console.error('Error handling friend request:', error)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* قائمة الأصدقاء */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">الأصدقاء</h2>
              
              <div className="space-y-4">
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className={`w-3 h-3 rounded-full ${
                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium">{friend.full_name}</div>
                        <div className="text-sm text-gray-500">
                          المستوى {friend.level}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {friend.studied_today ? '✅ تعلم اليوم' : '⏳ لم يتعلم بعد'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* طلبات الصداقة والبحث */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">إضافة صديق</h2>
              <div className="space-y-4">
                <div className="flex space-x-2 space-x-reverse">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن صديق..."
                    className="flex-1 rounded-md border-gray-300"
                  />
                  <Button onClick={handleSearch}>بحث</Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map(result => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>{result.full_name}</span>
                        <Button
                          onClick={() => sendFriendRequest(result.id)}
                          size="sm"
                        >
                          إرسال طلب
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">طلبات الصداقة</h2>
              <div className="space-y-4">
                {requests.map(request => (
                  <div
                    key={request.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {request.sender.full_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                      <Button
                        onClick={() => handleFriendRequest(request.id, true)}
                        className="w-full"
                        size="sm"
                      >
                        قبول
                      </Button>
                      <Button
                        onClick={() => handleFriendRequest(request.id, false)}
                        variant="secondary"
                        className="w-full"
                        size="sm"
                      >
                        رفض
                      </Button>
                    </div>
                  </div>
                ))}

                {requests.length === 0 && (
                  <div className="text-center text-gray-500">
                    لا توجد طلبات صداقة جديدة
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function isOnline(lastActive: string): boolean {
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  return now.getTime() - lastActiveDate.getTime() < 5 * 60 * 1000 // 5 minutes
}

function hasStudiedToday(activities: any[]): boolean {
  if (!activities?.length) return false
  const today = new Date().toDateString()
  return activities.some(activity => 
    new Date(activity.created_at).toDateString() === today
  )
}
