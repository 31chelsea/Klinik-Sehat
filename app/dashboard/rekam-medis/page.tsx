'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type RekamMedis = {
  id: string
  nama_pasien: string
  tanggal_pemeriksaan: string
  diagnosis: string
  catatan: string
}

export default function RekamMedisPage() {
  const [list, setList] = useState<RekamMedis[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selected, setSelected] = useState<RekamMedis | null>(null)
  const [form, setForm] = useState({
    nama_pasien: '',
    tanggal_pemeriksaan: '',
    diagnosis: '',
    catatan: '',
  })

  const fetchData = async () => {
    const { data } = await supabase.from('rekam_medis').select('*').order('tanggal_pemeriksaan', { ascending: false })
    if (data) setList(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSimpan = async () => {
    const { error } = await supabase.from('rekam_medis').insert([form])
    if (!error) {
      setForm({ nama_pasien: '', tanggal_pemeriksaan: '', diagnosis: '', catatan: '' })
      setShowForm(false)
      fetchData()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rekam Medis</h1>
          <p className="text-gray-500 text-sm">Riwayat pemeriksaan dan tindakan medis</p>
        </div>
        <div className="flex gap-2">
  <label className="bg-white border border-green-600 text-green-600 px-4 py-2 rounded-full cursor-pointer text-sm font-medium hover:bg-green-50">
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

          const rekamData = rows.map(row => ({
            nama_pasien: row['nama_pasien'] || row['Nama'] || row['NAMA'] || '',
            tanggal_pemeriksaan: excelDateToString(row['tanggal_pemeriksaan'] || row['Tanggal Pemeriksaan'] || row['TANGGAL PEMERIKSAAN'] || ''),
            diagnosis: row['diagnosis'] || row['Diagnosa'] || row['DIAGNOSA'] || '',
            catatan: row['catatan'] || row['Catatan'] || row['CATATAN'] || '',
          })).filter(r => r.nama_pasien)

          const { error } = await supabase.from('rekam_medis').insert(rekamData)
          if (error) alert('Gagal import: ' + error.message)
          else { alert(`Berhasil import ${rekamData.length} rekam medis!`); fetchData() }
        }
        reader.readAsArrayBuffer(file)
        e.target.value = ''
      }}
    />
  </label>
  <button
    onClick={() => setShowForm(!showForm)}
    className="bg-green-600 text-white px-4 py-2 rounded-full"
  >
    + Tambah Rekam Medis
  </button>
</div>
      </div>

      {showForm && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <h2 className="font-semibold">Form Tambah Rekam Medis</h2>
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
            value={form.tanggal_pemeriksaan} onChange={(e) => setForm({ ...form, tanggal_pemeriksaan: e.target.value })} />
          <input placeholder="Diagnosis" className="w-full border rounded p-2"
            value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
          <textarea placeholder="Catatan" className="w-full border rounded p-2" rows={3}
            value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSimpan} className="bg-primary/90 text-white px-4 py-2 rounded">Simpan</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4">
            <h2 className="text-xl font-bold">{selected.diagnosis}</h2>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-gray-500 text-sm">Pasien</p>
                <p className="font-semibold">{selected.nama_pasien}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">tanggal_pemeriksaan</p>
                <p className="font-semibold">{selected.tanggal_pemeriksaan}</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">Catatan</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{selected.catatan}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(null)} className="flex-1 border rounded py-2">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p>Memuat data...</p>
      ) : list.length === 0 ? (
        <p className="text-gray-500">Belum ada rekam medis.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {list.map((item, i) => (
            <div
              key={item.id}
              onClick={() => setSelected(item)}
              className="border rounded-lg p-4 space-y-2 cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  RM{String(i + 1).padStart(3, '0')}
                </span>
              </div>
              <p className="font-semibold">{item.diagnosis}</p>
              <p className="text-sm text-gray-500">{item.nama_pasien}</p>
              <p className="text-sm text-gray-500">{item.tanggal_pemeriksaan}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{item.catatan}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}