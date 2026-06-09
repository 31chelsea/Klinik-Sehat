'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Jadwal = {
  id: string
  nama_pasien: string
  tanggal: string
  waktu: string
  layanan: string
  catatan: string
}

const emptyForm = { nama_pasien: '', tanggal: '', waktu: '', layanan: '', catatan: '' }

const layananOptions = [
  'Pemeriksaan Kehamilan',
  'Imunisasi Bayi',
  'Konsultasi KB',
  'USG',
  'Kontrol Nifas',
]

export default function JadwalPage() {
  const [list, setList] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
  const now = new Date()
  return new Date(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T12:00:00`)
})

  const fetchData = async () => {
    const { data } = await supabase.from('jadwal_praktik').select('*').order('tanggal').order('waktu')
    if (data) setList(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSimpan = async () => {
    if (editId) {
      const { error } = await supabase.from('jadwal_praktik').update(form).eq('id', editId)
      if (error) { alert('Gagal mengupdate: ' + error.message); return }
    } else {
      const { error } = await supabase.from('jadwal_praktik').insert([form])
      if (error) { alert('Gagal menyimpan: ' + error.message); return }
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    fetchData()
  }

  const handleEdit = (j: Jadwal) => {
    setForm({ nama_pasien: j.nama_pasien, tanggal: j.tanggal, waktu: j.waktu, layanan: j.layanan, catatan: j.catatan })
    setEditId(j.id)
    setShowForm(true)
  }

  const handleHapus = async (id: string) => {
    if (!confirm('Yakin hapus jadwal ini?')) return
    await supabase.from('jadwal_praktik').delete().eq('id', id)
    fetchData()
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const today = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`
  const jadwalHariIni = list.filter(j => j.tanggal === today)

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay()

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)

  const bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
  const hariNama = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

  const tanggalAdaJadwal = new Set(list.map(j => j.tanggal))

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Jadwal Praktik</h1>
          <p className="text-gray-500 text-sm">Kelola jadwal kunjungan pasien</p>
        </div>
        <div className="flex gap-2">
  <label className="bg-white border border-primary/90 text-primary/90 px-4 py-2 rounded-full cursor-pointer text-sm font-medium hover:bg-green-50">
    📥 Import Excel
    <input
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const XLSX = await import('xlsx')
        const reader = new FileReader()
        reader.onload = async (evt) => {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows: any[] = XLSX.utils.sheet_to_json(sheet)

          const excelDateToString = (val: any) => {
            if (!val) return ''
            if (typeof val === 'number') {
              const date = new Date((val - 25569) * 86400 * 1000)
              return date.toISOString().split('T')[0]
            }
            return String(val)
          }

          const jadwalData = rows.map(row => ({
            nama_pasien: row['nama_pasien'] || row['Nama'] || row['NAMA'] || '',
            tanggal: excelDateToString(row['tanggal'] || row['Tanggal'] || ''),
            waktu: row['waktu'] || row['Waktu'] || '',
            layanan: row['layanan'] || row['Layanan'] || '',
            catatan: row['catatan'] || row['Catatan'] || '',
          })).filter(r => r.nama_pasien)

          const { error } = await supabase.from('jadwal_praktik').insert(jadwalData)
          if (error) alert('Gagal import: ' + error.message)
          else { alert(`Berhasil import ${jadwalData.length} jadwal!`); fetchData() }
        }
        reader.readAsArrayBuffer(file)
        e.target.value = ''
      }}
    />
  </label>
  <button
    onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm) }}
    className="bg-primary/90 text-white px-4 py-2 rounded-full"
  >
    + Buat Jadwal
  </button>
</div>
      </div>

      {showForm && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <h2 className="font-semibold">{editId ? 'Edit Jadwal' : 'Form Buat Jadwal'}</h2>
          <div className="relative">
  <input
    placeholder="Nama Pasien"
    className="w-full border rounded p-2"
    value={form.nama_pasien}
    onChange={async (e) => {
      setForm({ ...form, nama_pasien: e.target.value })
      if (e.target.value.length > 1) {
        const { data } = await supabase
          .from('pasien')
          .select('nama')
          .ilike('nama', `%${e.target.value}%`)
          .limit(5)
        setSuggestions(data?.map(p => p.nama) || [])
      } else {
        setSuggestions([])
      }
    }}
  />
  {suggestions.length > 0 && (
    <div className="absolute z-10 w-full bg-white border rounded shadow-md mt-1">
      {suggestions.map((s) => (
        <div
          key={s}
          className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm"
          onClick={() => {
            setForm({ ...form, nama_pasien: s })
            setSuggestions([])
          }}
        >
          {s}
        </div>
      ))}
    </div>
  )}
</div>
          <input type="date" className="w-full border rounded p-2"
            value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <input type="time" className="w-full border rounded p-2"
            value={form.waktu} onChange={(e) => setForm({ ...form, waktu: e.target.value })} />
          <select className="w-full border rounded p-2"
            value={form.layanan} onChange={(e) => setForm({ ...form, layanan: e.target.value })}>
            <option value="">Pilih Layanan</option>
            {layananOptions.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <textarea placeholder="Catatan" className="w-full border rounded p-2" rows={2}
            value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSimpan} className="bg-green-600 text-white px-4 py-2 rounded">
              {editId ? 'Update' : 'Simpan'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="bg-gray-400 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kalender */}
        <div className="md:col-span-2 border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{bulanNama[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={() => setSelectedDate(new Date(year, month - 1, 1))} className="px-2 py-1 border rounded">‹</button>
              <button onClick={() => setSelectedDate(new Date(year, month + 1, 1))} className="px-2 py-1 border rounded">›</button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-sm mb-2">
            {hariNama.map(h => <div key={h} className="text-gray-500 font-medium">{h}</div>)}
          </div>
          <div className="grid grid-cols-7 text-center text-sm gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === new Date().toISOString().split('T')[0]
              const isSelected = dateStr === today
              const hasJadwal = tanggalAdaJadwal.has(dateStr)
              return (
                <div key={day}
                  onClick={() => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    setSelectedDate(new Date(dateStr + 'T12:00:00'))
                  }}
                  className={`p-2 rounded-lg cursor-pointer relative ${isSelected ? 'bg-primary/90 text-white' : isToday ? 'border border-green-600' : 'hover:bg-gray-100'}`}>
                  {day}
                  {hasJadwal && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Jam Praktik */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Jam Praktik</h2>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Senin - Jumat</span><span>08:00 - 16:00</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Sabtu</span><span>08:00 - 12:00</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Minggu</span><span className="text-red-500">Tutup</span></div>
        </div>
      </div>

      {/* Jadwal hari yang dipilih */}
      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">
          Jadwal {today === new Date().toISOString().split('T')[0] ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        {loading ? <p>Memuat...</p> : jadwalHariIni.length === 0 ? (
          <p className="text-gray-500 text-sm">Tidak ada jadwal untuk tanggal ini.</p>
        ) : (
          jadwalHariIni.map(j => (
            <div key={j.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-4">
                <span className="text-primary/90 font-semibold">{j.waktu?.slice(0, 5)}</span>
                <div>
                  <p className="font-medium">{j.nama_pasien}</p>
                  <p className="text-sm text-gray-500">{j.layanan}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(j)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                <button onClick={() => handleHapus(j.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}