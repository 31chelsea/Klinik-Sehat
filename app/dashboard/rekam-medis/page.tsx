"use client"

import { useState } from "react"
import { Search, Plus, Filter, FileText, Calendar, User, Eye, Download, Printer } from "lucide-react"

const records = [
  { id: "RM001", patientId: "P001", patientName: "Siti Aminah", type: "Pemeriksaan Kehamilan", date: "10 Mei 2026", doctor: "Bidan Sari", diagnosis: "Kehamilan normal 32 minggu", notes: "Kondisi ibu dan janin sehat" },
  { id: "RM002", patientId: "P002", patientName: "Dewi Lestari", type: "Imunisasi Bayi", date: "09 Mei 2026", doctor: "Bidan Sari", diagnosis: "Imunisasi BCG", notes: "Tidak ada reaksi alergi" },
  { id: "RM003", patientId: "P003", patientName: "Rina Hartati", type: "Konsultasi KB", date: "08 Mei 2026", doctor: "Bidan Sari", diagnosis: "Pemasangan IUD", notes: "Prosedur berjalan lancar" },
  { id: "RM004", patientId: "P004", patientName: "Aisyah Putri", type: "USG", date: "07 Mei 2026", doctor: "Bidan Sari", diagnosis: "Kehamilan 20 minggu", notes: "Jenis kelamin: Perempuan" },
  { id: "RM005", patientId: "P005", patientName: "Maya Sari", type: "Kontrol Nifas", date: "06 Mei 2026", doctor: "Bidan Sari", diagnosis: "Nifas hari ke-14", notes: "Pemulihan baik, ASI lancar" },
  { id: "RM006", patientId: "P006", patientName: "Fitri Handayani", type: "Pemeriksaan Kehamilan", date: "05 Mei 2026", doctor: "Bidan Sari", diagnosis: "Kehamilan 28 minggu", notes: "Tekanan darah normal" },
]

export default function RekamMedisPage() {
  const [search, setSearch] = useState("")
  const [showDetail, setShowDetail] = useState<typeof records[0] | null>(null)

  const filteredRecords = records.filter(r => 
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rekam Medis</h1>
          <p className="text-sm text-muted-foreground mt-1">Riwayat pemeriksaan dan tindakan medis</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition">
          <Plus className="h-4 w-4" />
          Tambah Rekam Medis
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari rekam medis..." 
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 bg-card border border-border px-4 h-11 rounded-xl text-sm font-medium hover:bg-muted transition">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((record) => (
          <div 
            key={record.id}
            className="bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
            onClick={() => setShowDetail(record)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                {record.id}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{record.type}</h3>
            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                {record.patientName}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {record.date}
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{record.diagnosis}</p>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDetail(null)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-xs font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  {showDetail.id}
                </span>
                <h2 className="text-xl font-bold text-foreground mt-2">{showDetail.type}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-lg hover:bg-muted grid place-items-center transition" title="Cetak">
                  <Printer className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="h-9 w-9 rounded-lg hover:bg-muted grid place-items-center transition" title="Download">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Pasien</p>
                <p className="font-semibold text-foreground">{showDetail.patientName}</p>
                <p className="text-sm text-muted-foreground">{showDetail.patientId}</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Tanggal Pemeriksaan</p>
                <p className="font-semibold text-foreground">{showDetail.date}</p>
                <p className="text-sm text-muted-foreground">{showDetail.doctor}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Diagnosis</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
                  {showDetail.diagnosis}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Catatan</h3>
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-xl p-4">
                  {showDetail.notes}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button 
                onClick={() => setShowDetail(null)}
                className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted transition"
              >
                Tutup
              </button>
              <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                Edit Rekam Medis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
