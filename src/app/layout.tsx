import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'arabic'] })

export const metadata = {
  title: 'Englishify',
  description: 'منصة لتعلم اللغة الإنجليزية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
