"use client"

import { useState } from "react"
import { Download, FileText, Calendar, TrendingUp, Users, CreditCard, BarChart3, PieChart } from "lucide-react"

const reports = [
  { id: 1, name: "Laporan Kunjungan Pasien", period: "Mei 2026", type: "visits", count: 156, icon: Users },
  { id: 2, name: "Laporan Keuangan", period: "Mei 2026", type: "finance", count: 45, icon: CreditCard },
  { id: 3, name: "Laporan Rekam Medis", period: "Mei 2026", type: "records", count: 89, icon: FileText },
  { id: 4, name: "Laporan Layanan", period: "Mei 2026", type: "services", count: 234, icon: BarChart3 },
]

const monthlyStats = [
  { month: "Jan", visits: 120, income: 18500000 },
  { month: "Feb", visits: 135, income: 21200000 },
  { month: "Mar", visits: 142, income: 22800000 },
  { month: "Apr", visits: 128, income: 19600000 },
  { month: "Mei", visits: 156, income: 24850000 },
]

const serviceDistribution = [
  { service: "Pemeriksaan Kehamilan", count: 45, percentage: 35, color: "bg-primary" },
  { service: "Imunisasi Bayi", count: 32, percentage: 25, color: "bg-emerald-500" },
  { service: "Konsultasi KB", count: 26, percentage: 20, color: "bg-amber-500" },
  { service: "USG", count: 15, percentage: 12, color: "bg-rose-500" },
  { service: "Lainnya", count: 10, percentage: 8, color: "bg-gray-400" },
]

export default function LaporanPage() {
  const [period, setPeriod] = useState("monthly")

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  const maxVisits = Math.max(...monthlyStats.map(s => s.visits))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laporan</h1>
          <p className="text-sm text-muted-foreground mt-1">Analisis dan laporan klinik</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 h-10 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition">
            <Download className="h-4 w-4" />
            Export Laporan
          </button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <div 
            key={report.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <report.icon className="h-5 w-5" />
              </div>
              <button className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg hover:bg-muted grid place-items-center transition">
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <h3 className="font-semibold text-foreground text-sm">{report.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{report.period}</span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-3">{report.count}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visits Chart */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Tren Kunjungan</h3>
              <p className="text-xs text-muted-foreground mt-1">Jumlah kunjungan pasien per bulan</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              +12.5%
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-40">
            {monthlyStats.map((stat, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden transition-all hover:bg-primary/30"
                  style={{ height: `${(stat.visits / maxVisits) * 100}%` }}
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg"
                    style={{ height: `${(stat.visits / maxVisits) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{stat.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Kunjungan</p>
              <p className="text-lg font-bold text-foreground">{monthlyStats.reduce((acc, s) => acc + s.visits, 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rata-rata/bulan</p>
              <p className="text-lg font-bold text-foreground">{Math.round(monthlyStats.reduce((acc, s) => acc + s.visits, 0) / monthlyStats.length)}</p>
            </div>
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Distribusi Layanan</h3>
              <p className="text-xs text-muted-foreground mt-1">Persentase layanan yang paling sering digunakan</p>
            </div>
            <PieChart className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-4">
            {serviceDistribution.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-foreground">{item.service}</span>
                  <span className="text-sm font-semibold text-foreground">{item.count} ({item.percentage}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Pendapatan Bulanan</h3>
              <p className="text-xs text-muted-foreground mt-1">Grafik pendapatan klinik 5 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              +18.7%
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Bulan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Kunjungan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Pendapatan</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">Grafik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyStats.map((stat, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition">
                    <td className="py-3 font-medium text-foreground">{stat.month} 2026</td>
                    <td className="py-3 text-muted-foreground">{stat.visits} pasien</td>
                    <td className="py-3 font-semibold text-foreground">{formatCurrency(stat.income)}</td>
                    <td className="py-3">
                      <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(stat.income / 25000000) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(monthlyStats.reduce((acc, s) => acc + s.income, 0))}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rata-rata/bulan</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(Math.round(monthlyStats.reduce((acc, s) => acc + s.income, 0) / monthlyStats.length))}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
