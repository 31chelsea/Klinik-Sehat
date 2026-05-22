'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Transaksi = {
  id: string
  keterangan: string
  tanggal: string
  jumlah: number
  tipe: string
}

type HargaLayanan = {
  id: string
  nama_layanan: string
  harga: number
}

const emptyForm = { keterangan: '', tanggal: '', jumlah: '', tipe: 'masuk' }

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

export default function KeuanganPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([])
  const [hargaLayanan, setHargaLayanan] = useState<HargaLayanan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showHargaForm, setShowHargaForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [hargaForm, setHargaForm] = useState({ nama_layanan: '', harga: '' })
  const [filter, setFilter] = useState('semua')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    const { data: t } = await supabase.from('transaksi').select('*').order('tanggal', { ascending: false })
    const { data: h } = await supabase.from('harga_layanan').select('*')
    if (t) setTransaksi(t)
    if (h) setHargaLayanan(h)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSimpanTransaksi = async () => {
    const { error } = await supabase.from('transaksi').insert([{ ...form, jumlah: parseInt(form.jumlah) }])
    if (error) { alert('Gagal: ' + error.message); return }
    setForm(emptyForm)
    setShowForm(false)
    fetchData()
  }

  const handleHapusTransaksi = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return
    await supabase.from('transaksi').delete().eq('id', id)
    fetchData()
  }

  const handleSimpanHarga = async () => {
    const { error } = await supabase.from('harga_layanan').insert([{ ...hargaForm, harga: parseInt(hargaForm.harga) }])
    if (error) { alert('Gagal: ' + error.message); return }
    setHargaForm({ nama_layanan: '', harga: '' })
    setShowHargaForm(false)
    fetchData()
  }

  const handleHapusHarga = async (id: string) => {
    if (!confirm('Hapus layanan ini?')) return
    await supabase.from('harga_layanan').delete().eq('id', id)
    fetchData()
  }

  const totalMasuk = transaksi.filter(t => t.tipe === 'masuk').reduce((a, t) => a + t.jumlah, 0)
  const totalKeluar = transaksi.filter(t => t.tipe === 'keluar').reduce((a, t) => a + t.jumlah, 0)
  const saldo = totalMasuk - totalKeluar

  const filtered = transaksi.filter(t => {
    const matchFilter = filter === 'semua' || t.tipe === filter
    const matchSearch = t.keterangan.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Keuangan</h1>
          <p className="text-gray-500 text-sm">Kelola pendapatan dan pengeluaran klinik</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary/90 text-white px-4 py-2 rounded-full"
        >
          + Transaksi Baru
        </button>
      </div>

      {/* Form Transaksi */}
      {showForm && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <h2 className="font-semibold">Form Transaksi Baru</h2>
          <input placeholder="Keterangan" className="w-full border rounded p-2"
            value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
          <input type="date" className="w-full border rounded p-2"
            value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
          <input type="number" placeholder="Jumlah (Rp)" className="w-full border rounded p-2"
            value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} />
          <select className="w-full border rounded p-2"
            value={form.tipe} onChange={(e) => setForm({ ...form, tipe: e.target.value })}>
            <option value="masuk">Pemasukan</option>
            <option value="keluar">Pengeluaran</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleSimpanTransaksi} className="bg-primary/90 text-white px-4 py-2 rounded">Simpan</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </div>
      )}

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <span className="bg-green-100 text-green-600 p-2 rounded-lg">↗</span>
          </div>
          <p className="text-2xl font-bold">{formatRp(totalMasuk)}</p>
        </div>
        <div className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Total Pengeluaran</p>
            <span className="bg-red-100 text-red-500 p-2 rounded-lg">↘</span>
          </div>
          <p className="text-2xl font-bold">{formatRp(totalKeluar)}</p>
        </div>
        <div className="border rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">Saldo Bersih</p>
            <span className="bg-blue-100 text-blue-500 p-2 rounded-lg">💰</span>
          </div>
          <p className="text-2xl font-bold">{formatRp(saldo)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Daftar Transaksi */}
        <div className="md:col-span-2 border rounded-xl p-4 space-y-3">
          <div className="flex gap-2 items-center">
            <input placeholder="Cari transaksi..." className="flex-1 border rounded-lg px-3 py-2 text-sm"
              value={search} onChange={(e) => setSearch(e.target.value)} />
            {['semua', 'masuk', 'keluar'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-sm capitalize ${filter === f ? 'bg-primary/90 text-white' : 'border'}`}>
                {f === 'semua' ? 'Semua' : f === 'masuk' ? 'Masuk' : 'Keluar'}
              </button>
            ))}
          </div>

          {loading ? <p>Memuat...</p> : filtered.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada transaksi.</p>
          ) : (
            filtered.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className={`p-2 rounded-lg text-lg ${t.tipe === 'masuk' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {t.tipe === 'masuk' ? '↙' : '↗'}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{t.keterangan}</p>
                    <p className="text-xs text-gray-500">{t.tanggal} • TRX{String(i + 1).padStart(3, '0')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-semibold ${t.tipe === 'masuk' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.tipe === 'masuk' ? '+' : '-'}{formatRp(t.jumlah)}
                  </p>
                  <button onClick={() => handleHapusTransaksi(t.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Daftar Harga Layanan */}
        <div className="border rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Daftar Harga Layanan</h2>
            <button onClick={() => setShowHargaForm(!showHargaForm)} className="text-primary/90 text-xl font-bold">+</button>
          </div>

          {showHargaForm && (
            <div className="space-y-2">
              <input placeholder="Nama Layanan" className="w-full border rounded p-2 text-sm"
                value={hargaForm.nama_layanan} onChange={(e) => setHargaForm({ ...hargaForm, nama_layanan: e.target.value })} />
              <input type="number" placeholder="Harga (Rp)" className="w-full border rounded p-2 text-sm"
                value={hargaForm.harga} onChange={(e) => setHargaForm({ ...hargaForm, harga: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={handleSimpanHarga} className="bg-primary/90 text-white px-3 py-1 rounded text-sm">Simpan</button>
                <button onClick={() => setShowHargaForm(false)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Batal</button>
              </div>
            </div>
          )}

          {hargaLayanan.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada layanan.</p>
          ) : (
            hargaLayanan.map(h => (
              <div key={h.id} className="flex justify-between items-center text-sm border-b pb-2">
                <span>{h.nama_layanan}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatRp(h.harga)}</span>
                  <button onClick={() => handleHapusHarga(h.id)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}