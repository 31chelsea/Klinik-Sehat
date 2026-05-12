"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Clock, User, MapPin } from "lucide-react"

const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

const appointments = [
  { id: 1, date: "2026-05-11", time: "09:00", patient: "Siti Aminah", service: "Pemeriksaan Kehamilan", status: "confirmed" },
  { id: 2, date: "2026-05-11", time: "10:00", patient: "Dewi Lestari", service: "Imunisasi Bayi", status: "confirmed" },
  { id: 3, date: "2026-05-11", time: "11:00", patient: "Rina Hartati", service: "Konsultasi KB", status: "pending" },
  { id: 4, date: "2026-05-12", time: "09:30", patient: "Aisyah Putri", service: "USG", status: "confirmed" },
  { id: 5, date: "2026-05-12", time: "14:00", patient: "Maya Sari", service: "Kontrol Nifas", status: "confirmed" },
  { id: 6, date: "2026-05-13", time: "10:00", patient: "Fitri Handayani", service: "Pemeriksaan Kehamilan", status: "pending" },
]

const practiceHours = [
  { day: "Senin - Jumat", hours: "08:00 - 16:00" },
  { day: "Sabtu", hours: "08:00 - 12:00" },
  { day: "Minggu", hours: "Tutup" },
]

export default function JadwalPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)) // May 2026
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-11")
  const [showModal, setShowModal] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const formatDateKey = (day: number) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return `${currentDate.getFullYear()}-${month}-${dayStr}`
  }

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(a => a.date === date)
  }

  const selectedAppointments = getAppointmentsForDate(selectedDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Jadwal Praktik</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola jadwal kunjungan pasien</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-xl hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Buat Jadwal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={prevMonth}
                className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="h-8 w-8 rounded-lg hover:bg-muted grid place-items-center transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateKey = formatDateKey(day)
              const hasAppointments = appointments.some(a => a.date === dateKey)
              const isSelected = dateKey === selectedDate
              const isToday = dateKey === "2026-05-11"

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`aspect-square rounded-xl text-sm font-medium transition-all relative ${
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : isToday
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {day}
                  {hasAppointments && !isSelected && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Practice Hours */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-4">Jam Praktik</h3>
          <div className="space-y-3">
            {practiceHours.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{item.day}</span>
                <span className={`text-sm font-medium ${item.hours === "Tutup" ? "text-destructive" : "text-foreground"}`}>
                  {item.hours}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 text-primary mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-semibold text-sm">Lokasi Praktik</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Jl. Kesehatan No. 123, Kelurahan Sehat, Kecamatan Bahagia
            </p>
          </div>
        </div>
      </div>

      {/* Appointments for Selected Date */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="font-semibold text-foreground mb-4">
          Jadwal {selectedDate === "2026-05-11" ? "Hari Ini" : selectedDate}
        </h3>
        
        {selectedAppointments.length > 0 ? (
          <div className="space-y-3">
            {selectedAppointments.map(apt => (
              <div 
                key={apt.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition"
              >
                <div className="h-12 w-16 rounded-lg bg-primary/10 text-primary grid place-items-center font-bold">
                  {apt.time}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{apt.patient}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{apt.service}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  apt.status === "confirmed" 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {apt.status === "confirmed" ? "Terkonfirmasi" : "Menunggu"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Tidak ada jadwal untuk tanggal ini</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl w-full max-w-lg p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Buat Jadwal Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Pilih Pasien</label>
                <select className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-card">
                  <option>Siti Aminah</option>
                  <option>Dewi Lestari</option>
                  <option>Rina Hartati</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal</label>
                  <input 
                    type="date"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Waktu</label>
                  <input 
                    type="time"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Layanan</label>
                <select className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-card">
                  <option>Pemeriksaan Kehamilan</option>
                  <option>Imunisasi Bayi</option>
                  <option>Konsultasi KB</option>
                  <option>USG</option>
                  <option>Kontrol Nifas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Catatan</label>
                <textarea 
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
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
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
