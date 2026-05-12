"use client"

import { useState } from "react"
import { Search, Plus, Filter, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react"

const summary = [
  { label: "Total Pendapatan", value: "Rp 24.850.000", delta: "+15.3%", up: true, icon: TrendingUp, color: "emerald" },
  { label: "Total Pengeluaran", value: "Rp 8.420.000", delta: "+5.2%", up: true, icon: TrendingDown, color: "rose" },
  { label: "Saldo Bersih", value: "Rp 16.430.000", delta: "+18.7%", up: true, icon: Wallet, color: "primary" },
]

const transactions = [
  { id: "TRX001", date: "10 Mei 2026", description: "Pemeriksaan Kehamilan - Siti Aminah", type: "income", amount: 150000 },
  { id: "TRX002", date: "10 Mei 2026", description: "Imunisasi Bayi - Dewi Lestari", type: "income", amount: 200000 },
  { id: "TRX003", date: "10 Mei 2026", description: "Pembelian Alat Medis", type: "expense", amount: 500000 },
  { id: "TRX004", date: "09 Mei 2026", description: "USG - Aisyah Putri", type: "income", amount: 350000 },
  { id: "TRX005", date: "09 Mei 2026", description: "Gaji Asisten", type: "expense", amount: 2000000 },
  { id: "TRX006", date: "09 Mei 2026", description: "Konsultasi KB - Rina Hartati", type: "income", amount: 100000 },
  { id: "TRX007", date: "08 Mei 2026", description: "Kontrol Nifas - Maya Sari", type: "income", amount: 125000 },
  { id: "TRX008", date: "08 Mei 2026", description: "Pembelian Obat-obatan", type: "expense", amount: 750000 },
]

const servicesPrices = [
  { service: "Pemeriksaan Kehamilan", price: 150000 },
  { service: "Imunisasi Bayi", price: 200000 },
  { service: "Konsultasi KB", price: 100000 },
  { service: "USG", price: 350000 },
  { service: "Kontrol Nifas", price: 125000 },
  { service: "Persalinan Normal", price: 3500000 },
]

export default function KeuanganPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [showModal, setShowModal] = useState(false)

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || t.type === filter
    return matchSearch && matchFilter
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Keuangan</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola pendapatan dan pengeluaran klinik</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summary.map((item, index) => (
          <div 
            key={index}
            className="bg-card rounded-2xl border border-border p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
              <div className={`h-9 w-9 rounded-lg grid place-items-center ${
                item.color === 'primary' ? 'bg-primary/10 text-primary' :
                item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
            <p className={`text-xs font-semibold mt-2 ${item.up ? 'text-emerald-600' : 'text-rose-600'}`}>
              {item.delta} dari bulan lalu
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border">
          {/* Search & Filter */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi..." 
                className="w-full bg-muted/50 rounded-xl pl-10 pr-4 h-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFilter("all")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === "all" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                Semua
              </button>
              <button 
                onClick={() => setFilter("income")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === "income" ? "bg-emerald-500 text-white" : "hover:bg-muted"}`}
              >
                Masuk
              </button>
              <button 
                onClick={() => setFilter("expense")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === "expense" ? "bg-rose-500 text-white" : "hover:bg-muted"}`}
              >
                Keluar
              </button>
            </div>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-border">
            {filteredTransactions.map(trx => (
              <div key={trx.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition">
                <div className={`h-10 w-10 rounded-xl grid place-items-center ${
                  trx.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                }`}>
                  {trx.type === "income" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{trx.description}</p>
                  <p className="text-xs text-muted-foreground">{trx.date} • {trx.id}</p>
                </div>
                <p className={`font-semibold ${trx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {trx.type === "income" ? "+" : "-"}{formatCurrency(trx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Price List */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Daftar Harga Layanan</h3>
          <div className="space-y-3">
            {servicesPrices.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.service}</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Transaksi Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Tipe Transaksi</label>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 rounded-xl border border-emerald-500 text-emerald-600 font-medium text-sm hover:bg-emerald-50 transition">
                    Pemasukan
                  </button>
                  <button className="flex-1 py-2.5 rounded-xl border border-rose-500 text-rose-600 font-medium text-sm hover:bg-rose-50 transition">
                    Pengeluaran
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi</label>
                <input 
                  className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Contoh: Pemeriksaan Kehamilan - Siti Aminah"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah</label>
                  <input 
                    type="number"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
                  <input 
                    type="date"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition"
              >
                Batal
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
