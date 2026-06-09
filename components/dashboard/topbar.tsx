"use client"

import { Search, Bell, Menu } from "lucide-react"
import { useState } from "react"
import { supabase } from '@/lib/supabase'

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async (query: string) => {
    if (query.length < 2) { setSearchResults([]); setShowResults(false); return }
    
    const { data: pasien } = await supabase
      .from('pasien')
      .select('nama, alamat')
      .ilike('nama', `%${query}%`)
      .limit(5)

    const { data: rekam } = await supabase
      .from('rekam_medis')
      .select('nama_pasien, diagnosis, tanggal_pemeriksaan')
      .or(`nama_pasien.ilike.%${query}%,diagnosis.ilike.%${query}%`)
      .limit(5)

    const results = [
      ...(pasien || []).map(p => ({
        type: 'pasien',
        title: p.nama,
        subtitle: p.alamat,
        href: `/dashboard/pasien?nama=${encodeURIComponent(p.nama)}`
      })),
      ...(rekam || []).map(r => ({
        type: 'rekam',
        title: r.nama_pasien,
        subtitle: `${r.diagnosis} • ${r.tanggal_pemeriksaan}`,
        href: `/dashboard/rekam-medis?nama=${encodeURIComponent(r.nama_pasien)}`
      }))
    ]

    setSearchResults(results)
    setShowResults(true)
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
        <button 
          onClick={onToggleSidebar}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Cari pasien, rekam medis…"
            className="w-full bg-muted/50 rounded-lg pl-9 pr-3 h-9 text-sm outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            onFocus={() => searchQuery && setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 300)}
          />
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-10 left-0 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm border-b last:border-0"
                  onClick={() => {
                    window.location.href = r.href
                    setShowResults(false)
                    setSearchQuery('')
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === 'pasien' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.type === 'pasien' ? 'Pasien' : 'Rekam Medis'}
                    </span>
                    <span className="font-medium">{r.title}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{r.subtitle}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-border h-9">
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Bidan Sari</p>
            <p className="text-[11px] text-muted-foreground">Administrator</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary grid place-items-center text-primary-foreground text-xs font-bold">
            BS
          </div>
        </div>
      </div>
    </header>
  )
}