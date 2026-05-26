'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Topbar } from '@/components/dashboard/topbar'
import { AIChatbot } from '@/components/dashboard/ai-chatbot'
import { supabase } from '@/lib/supabase'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={sidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
      <AIChatbot />
    </div>
  )
}