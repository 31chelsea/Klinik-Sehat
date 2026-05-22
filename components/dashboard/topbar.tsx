"use client"

import { Search, Bell, Menu } from "lucide-react"

interface TopbarProps {
  onToggleSidebar: () => void
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value
              if (val.trim()) window.location.href = `/dashboard/pasien?search=${encodeURIComponent(val)}`
            }
          }}
          />
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
