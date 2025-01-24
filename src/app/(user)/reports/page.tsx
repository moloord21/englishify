'use client'

import { Navigation } from '@/components/shared/Navigation'
import { DetailedReport } from '@/components/reports/DetailedReport'
import { AchievementSystem } from '@/components/achievements/AchievementSystem'

export default function ReportsPage() {
  return (
    <div>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">التقارير والإنجازات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DetailedReport />
          </div>
          <div>
            <AchievementSystem />
          </div>
        </div>
      </main>
    </div>
  )
}
