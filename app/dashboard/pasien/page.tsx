"use client"

import { useState } from "react"
import { Search, Plus, Filter, MoreHorizontal, Phone, Mail, Calendar, Eye, Edit, Trash2 } from "lucide-react"

const patients = [
  { id: "P001", name: "Siti Aminah", phone: "081234567890", email: "siti@email.com", birthDate: "15 Mar 1995", lastVisit: "10 Mei 2026", status: "Hamil" },
  { id: "P002", name: "Dewi Lestari", phone: "081234567891", email: "dewi@email.com", birthDate: "22 Jun 1990", lastVisit: "09 Mei 2026", status: "Nifas" },
  { id: "P003", name: "Rina Hartati", phone: "081234567892", email: "rina@email.com", birthDate: "08 Jan 1988", lastVisit: "08 Mei 2026", status: "KB" },
  { id: "P004", name: "Aisyah Putri", phone: "081234567893", email: "aisyah@email.com", birthDate: "30 Sep 1992", lastVisit: "07 Mei 2026", status: "Hamil" },
  { id: "P005", name: "Maya Sari", phone: "081234567894", email: "maya@email.com", birthDate: "12 Dec 1994", lastVisit: "06 Mei 2026", status: "Nifas" },
  { id: "P006", name: "Fitri Handayani", phone: "081234567895", email: "fitri@email.com", birthDate: "05 Apr 1991", lastVisit: "05 Mei 2026", status: "KB" },
  { id: "P007", name: "Nur Aini", phone: "081234567896", email: "nur@email.com", birthDate: "18 Jul 1993", lastVisit: "04 Mei 2026", status: "Hamil" },
  { id: "P008", name: "Ratna Dewi", phone: "081234567897", email: "ratna@email.com", birthDate: "25 Feb 1989", lastVisit: "03 Mei 2026", status: "Imunisasi" },
]

export default function PasienPage() {
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Pasien</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data pasien klinik</p>
        </div>
        <button 
          onClick={() => { setSelectedPatient(null); setShowModal(true) }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Tambah Pasien
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau ID pasien..." 
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <button className="inline-flex items-center gap-2 bg-card border border-border px-4 h-11 rounded-xl text-sm font-medium hover:bg-muted transition">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Nama Pasien</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Kontak</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Tanggal Lahir</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Kunjungan Terakhir</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-mono font-semibold text-primary">{patient.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-foreground">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {patient.birthDate}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">{patient.lastVisit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                      patient.status === "Hamil" ? "bg-pink-100 text-pink-700" :
                      patient.status === "Nifas" ? "bg-purple-100 text-purple-700" :
                      patient.status === "KB" ? "bg-blue-100 text-blue-700" :
                      "bg-emerald-100 text-emerald-700"
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => { setSelectedPatient(patient); setShowModal(true) }}
                        className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center transition"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        onClick={() => { setSelectedPatient(patient); setShowModal(true) }}
                        className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center transition"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button 
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 grid place-items-center transition"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-sm text-muted-foreground">Menampilkan {filteredPatients.length} dari {patients.length} pasien</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition">Sebelumnya</button>
            <button className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition">2</button>
            <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition">Selanjutnya</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">
              {selectedPatient ? "Detail Pasien" : "Tambah Pasien Baru"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nama Lengkap</label>
                <input 
                  defaultValue={selectedPatient?.name || ""}
                  className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">No. Telepon</label>
                  <input 
                    defaultValue={selectedPatient?.phone || ""}
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal Lahir</label>
                  <input 
                    type="date"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <input 
                  defaultValue={selectedPatient?.email || ""}
                  className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                <select className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-card">
                  <option>Hamil</option>
                  <option>Nifas</option>
                  <option>KB</option>
                  <option>Imunisasi</option>
                </select>
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
                {selectedPatient ? "Simpan Perubahan" : "Tambah Pasien"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
