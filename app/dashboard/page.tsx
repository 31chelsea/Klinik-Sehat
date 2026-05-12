"use client"

import Link from "next/link"
import { 
  Users, Calendar, FileText, CreditCard, 
  Plus, Clock, ChevronRight
} from "lucide-react"

const stats = [
  { label: "Total Pasien", value: "1,284", delta: "+12.5%", up: true, icon: Users, color: "primary", href: "/dashboard/pasien" },
  { label: "Kunjungan Hari Ini", value: "38", delta: "+8.2%", up: true, icon: Calendar, color: "emerald", href: "/dashboard/jadwal" },
  { label: "Rekam Medis Baru", value: "24", delta: "+4.1%", up: true, icon: FileText, color: "rose", href: "/dashboard/rekam-medis" },
  { label: "Pendapatan Hari Ini", value: "Rp 4.8M", delta: "-2.3%", up: false, icon: CreditCard, color: "amber", href: "/dashboard/keuangan" },
]

const queue = [
  { no: "A-012", initial: "SA", name: "Siti Aminah", service: "Pemeriksaan Kehamilan", time: "09:30", status: "Menunggu" },
  { no: "A-013", initial: "DL", name: "Dewi Lestari", service: "Imunisasi Bayi", time: "09:45", status: "Diperiksa" },
  { no: "A-014", initial: "RH", name: "Rina Hartati", service: "Konsultasi KB", time: "10:00", status: "Menunggu" },
  { no: "A-015", initial: "AP", name: "Aisyah Putri", service: "USG", time: "10:15", status: "Menunggu" },
  { no: "A-016", initial: "MS", name: "Maya Sari", service: "Kontrol Nifas", time: "10:30", status: "Menunggu" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl p-6 lg:p-8 text-primary-foreground shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-primary/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_30%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.12),transparent_35%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-primary-foreground/85">Selamat Datang Kembali</p>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mt-2 leading-tight">
              Bidan Sari Wijayanti
            </h2>
            <p className="text-primary-foreground/85 mt-2 text-sm max-w-md">
              Hari ini ada <b>12 pasien</b> dijadwalkan dan <b>5 antrean</b> menunggu pemeriksaan.
            </p>
          </div>
          <Link 
            href="/dashboard/pasien?new=true"
            className="self-start lg:self-auto inline-flex items-center gap-2 bg-white text-primary font-semibold px-5 py-3 rounded-xl shadow hover:shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            Daftarkan Pasien
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link 
            key={index}
            href={stat.href}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <div className={`h-9 w-9 rounded-lg grid place-items-center ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                stat.color === 'rose' ? 'bg-rose-100 text-rose-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
            <p className={`text-xs font-semibold mt-2 inline-flex items-center gap-1 ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d={stat.up ? "M7 17 17 7M7 7h10v10" : "M17 7 7 17M17 17H7V7"} />
              </svg>
              {stat.delta}
              <span className="text-muted-foreground font-medium ml-1">vs minggu lalu</span>
            </p>
          </Link>
        ))}
      </div>

      {/* Queue */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Antrean Pasien Hari Ini</h3>
            <p className="text-xs text-muted-foreground mt-1">Daftar antrean berdasarkan waktu kunjungan</p>
          </div>
          <Link 
            href="/dashboard/jadwal"
            className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {queue.map((item, index) => (
            <Link 
              key={index}
              href={`/dashboard/pasien/${item.no}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="h-10 w-14 rounded-lg bg-primary/10 text-primary grid place-items-center font-display font-bold text-sm">
                {item.no}
              </div>
              <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground grid place-items-center text-xs font-bold">
                {item.initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.service}</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {item.time}
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                item.status === "Diperiksa" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {item.status}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
