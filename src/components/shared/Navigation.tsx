'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600">Englishify</span>
            </Link>
            
            <div className="hidden sm:mr-6 sm:flex sm:space-x-8">
              <Link
                href="/lessons"
                className={`${
                  pathname.startsWith('/lessons')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                الدروس
              </Link>
              <Link
                href="/words"
                className={`${
                  pathname.startsWith('/words')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                الكلمات
              </Link>
              <Link
                href="/tests"
                className={`${
                  pathname.startsWith('/tests')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                الاختبارات
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:flex sm:items-center">
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
