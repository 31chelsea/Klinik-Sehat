"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Heart, Users, Calendar, FileText, CreditCard, BarChart3, Settings, LogOut,
  LayoutDashboard
} from "lucide-react"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "pasien", label: "Data Pasien", icon: Users, href: "/dashboard/pasien" },
  { id: "rekam-medis", label: "Rekam Medis", icon: FileText, href: "/dashboard/rekam-medis" },
  { id: "jadwal", label: "Jadwal Praktik", icon: Calendar, href: "/dashboard/jadwal" },
  { id: "keuangan", label: "Keuangan", icon: CreditCard, href: "/dashboard/keuangan" },
  { id: "laporan", label: "Laporan", icon: BarChart3, href: "/dashboard/laporan" },
]

const systemItems = [
  { id: "pengaturan", label: "Pengaturan", icon: Settings, href: "/dashboard/pengaturan" },
]

export function Sidebar({ open }: { open: boolean }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className={`${open ? 'w-64' : 'w-0 -ml-64'} bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300 fixed lg:relative h-full z-40`}>
      <div className="px-5 py-5 flex items-center gap-3 border-b border-border">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-lg shadow-primary/30">
          <Heart className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display font-bold text-foreground leading-none">KlinikSehat</p>
          <p className="text-[11px] text-muted-foreground mt-1">Manajemen Klinik Bidan</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold tracking-widest text-muted-foreground mb-2">MENU UTAMA</p>
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href) 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
                : "text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        
        <p className="px-3 mt-6 text-[10px] font-bold tracking-widest text-muted-foreground mb-2">SISTEM</p>
        {systemItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(item.href) 
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" 
                : "text-foreground hover:bg-muted"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <Link 
        href="/login"
        className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Keluar
      </Link>
    </aside>
  )
}
