'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase/client'
import { Navigation } from '@/components/shared/Navigation'
import { Button } from '@/components/ui/Button'

interface StudyGroup {
  id: string
  name: string
  description: string
  members_count: number
  level: string
  created_by: {
    id: string
    full_name: string
  }
  is_member: boolean
}

export default function StudyGroupsPage() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    level: 'beginner'
  })

  useEffect(() => {
    if (user) {
      loadStudyGroups()
    }
  }, [user])

  async function loadStudyGroups() {
    try {
      const { data: groupsList } = await supabase
        .from('study_groups')
        .select(`
          *,
          created_by:creator_id(
            id,
            full_name
          ),
          members:study_group_members(count)
        `)
        .order('created_at', { ascending: false })

      // التحقق من عضوية المستخدم في كل مجموعة
      const { data: userMemberships } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user?.id)

      const processedGroups = groupsList?.map(group => ({
        ...group,
        members_count: group.members[0].count,
        is_member: userMemberships?.some(m => m.group_id === group.id) || false
      }))

      setGroups(processedGroups || [])
    } catch (error) {
      console.error('Error loading study groups:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data: group } = await supabase
        .from('study_groups')
        .insert([
          {
            name: newGroup.name,
            description: newGroup.description,
            level: newGroup.level,
            creator_id: user?.id
          }
        ])
        .select()
        .single()

      if (group) {
        await supabase
          .from('study_group_members')
          .insert([
            {
              group_id: group.id,
              user_id: user?.id,
              role: 'admin'
            }
          ])

        loadStudyGroups()
        setShowCreateModal(false)
        setNewGroup({ name: '', description: '', level: 'beginner' })
      }
    } catch (error) {
      console.error('Error creating study group:', error)
    }
  }

  async function handleJoinGroup(groupId: string) {
    try {
      await supabase
        .from('study_group_members')
        .insert([
          {
            group_id: groupId,
            user_id: user?.id,
            role: 'member'
          }
        ])

      loadStudyGroups()
    } catch (error) {
      console.error('Error joining study group:', error)
    }
  }

  return (
    <div>
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مجموعات الدراسة</h1>
          <Button onClick={() => setShowCreateModal(true)}>
            إنشاء مجموعة جديدة
          </Button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {groups.map(group => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{group.name}</h2>
                    <p className="text-gray-600 mt-2">{group.description}</p>
                    <div className="mt-4 flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                      <span>المستوى: {group.level}</span>
                      <span>الأعضاء: {group.members_count}</span>
                    <span>المنشئ: {group.created_by.full_name}</span>
                    </div>
                  </div>
                  
                  {!group.is_member ? (
                    <Button onClick={() => handleJoinGroup(group.id)}>
                      انضم للمجموعة
                    </Button>
                  ) : (
                    <Link
                      href={`/study-groups/${group.id}`}
                      className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200"
                    >
                      الذهاب للمجموعة
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* نافذة إنشاء مجموعة جديدة */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">إنشاء مجموعة جديدة</h2>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    اسم المجموعة
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    الوصف
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    rows={3}
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    المستوى
                  </label>
                  <select
                    value={newGroup.level}
                    onChange={(e) => setNewGroup({ ...newGroup, level: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300"
                  >
                    <option value="beginner">مبتدئ</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">متقدم</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-2 space-x-reverse">
                  <Button type="submit">إنشاء</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
