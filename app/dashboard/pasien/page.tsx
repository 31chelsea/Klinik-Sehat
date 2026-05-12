'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Pasien = {
  id: string
  nama: string
  tanggal_lahir: string
  jenis_kelamin: string
  alamat: string
  nomor_telepon: string
}

const emptyForm = { nama: '', tanggal_lahir: '', jenis_kelamin: '', alamat: '', nomor_telepon: '' }

export default function PasienPage() {
  const [pasienList, setPasienList] = useState<Pasien[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)

  const fetchPasien = async () => {
    const { data } = await supabase.from('pasien').select('*')
    if (data) setPasienList(data)
    setLoading(false)
  }

  useEffect(() => { fetchPasien() }, [])

  const handleSimpan = async () => {
    if (editId) {
      const { error } = await supabase.from('pasien').update(form).eq('id', editId)
      if (error) { alert('Gagal mengupdate: ' + error.message); return }
    } else {
      const { error } = await supabase.from('pasien').insert([form])
      if (error) { alert('Gagal menyimpan: ' + error.message); return }
    }
    setForm(emptyForm)
    setEditId(null)
    setShowForm(false)
    fetchPasien()
  }

  const handleEdit = (p: Pasien) => {
    setForm({ nama: p.nama, tanggal_lahir: p.tanggal_lahir, jenis_kelamin: p.jenis_kelamin, alamat: p.alamat, nomor_telepon: p.nomor_telepon })
    setEditId(p.id)
    setShowForm(true)
  }

  const handleHapus = async (id: string) => {
    if (!confirm('Yakin hapus data pasien ini?')) return
    const { error } = await supabase.from('pasien').delete().eq('id', id)
    if (error) { alert('Gagal menghapus: ' + error.message); return }
    fetchPasien()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Pasien</h1>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(!showForm) }}
          className="bg-primary/90 text-white px-4 py-2 rounded-full"
        >
          + Tambah Pasien
        </button>
      </div>

      {showForm && (
        <div className="border rounded p-4 space-y-3 bg-gray-50">
          <h2 className="font-semibold">{editId ? 'Edit Pasien' : 'Form Tambah Pasien'}</h2>
          <input placeholder="Nama" className="w-full border rounded p-2"
            value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          <input type="date" className="w-full border rounded p-2"
            value={form.tanggal_lahir} onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })} />
          <select className="w-full border rounded p-2"
            value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}>
            <option value="">Pilih Jenis Kelamin</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          <input placeholder="Alamat" className="w-full border rounded p-2"
            value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          <input placeholder="Nomor Telepon" className="w-full border rounded p-2"
            value={form.nomor_telepon} onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })} />
          <div className="flex gap-2">
            <button onClick={handleSimpan} className="bg-primary/90 text-white px-4 py-2 rounded">
              {editId ? 'Update' : 'Simpan'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="bg-gray-400 text-white px-4 py-2 rounded">Batal</button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Memuat data...</p>
      ) : pasienList.length === 0 ? (
        <p className="text-gray-500">Belum ada data pasien.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2 text-left">Nama</th>
              <th className="border p-2 text-left">Tgl Lahir</th>
              <th className="border p-2 text-left">Jenis Kelamin</th>
              <th className="border p-2 text-left">Alamat</th>
              <th className="border p-2 text-left">No. Telepon</th>
              <th className="border p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasienList.map((p) => (
              <tr key={p.id}>
                <td className="border p-2">{p.nama}</td>
                <td className="border p-2">{p.tanggal_lahir}</td>
                <td className="border p-2">{p.jenis_kelamin}</td>
                <td className="border p-2">{p.alamat}</td>
                <td className="border p-2">{p.nomor_telepon}</td>
                <td className="border p-2">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">Edit</button>
                    <button onClick={() => handleHapus(p.id)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}