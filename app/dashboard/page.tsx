'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const formatRp = (n: number) => {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function DashboardPage() {
  const [totalPasien, setTotalPasien] = useState(0)
  const [jadwalHariIni, setJadwalHariIni] = useState<any[]>([])
  const [totalRekamMedis, setTotalRekamMedis] = useState(0)
  const [pendapatanHariIni, setPendapatanHariIni] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchData = async () => {
    const { count: cp } = await supabase.from('pasien').select('*', { count: 'exact', head: true })
    const { data: jadwal } = await supabase.from('jadwal_praktik').select('*').eq('tanggal', today).order('waktu')
    const { count: cr } = await supabase.from('rekam_medis').select('*', { count: 'exact', head: true })
    const { data: transaksi } = await supabase.from('transaksi').select('*').eq('tipe', 'masuk').eq('tanggal', today)

    setTotalPasien(cp || 0)
    setJadwalHariIni(jadwal || [])
    setTotalRekamMedis(cr || 0)
    setPendapatanHariIni(transaksi?.reduce((a, t) => a + t.jumlah, 0) || 0)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div className="space-y-6 p-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-primary/90 p-6 text-white">
        <div>
          <p className="text-green-100 text-sm">Selamat Datang Kembali</p>
          <h1 className="text-3xl font-bold mt-1">Dashboard Klinik</h1>
          <p className="text-green-100 mt-2">
            Hari ini ada <span className="font-bold text-white">{jadwalHariIni.length} pasien</span> dijadwalkan.
          </p>
        </div>
        <Link href="/dashboard/pasien">
          <button className="mt-4 bg-white text-primary/90 font-semibold px-4 py-2 rounded-xl text-sm">
            + Daftarkan Pasien
          </button>
        </Link>
      </div>

      {/* Kartu Statistik */}
      {loading ? <p>Memuat data...</p> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Pasien', value: totalPasien, icon: '👥', href: '/dashboard/pasien' },
            { label: 'Jadwal Hari Ini', value: jadwalHariIni.length, icon: '📅', href: '/dashboard/jadwal' },
            { label: 'Rekam Medis', value: totalRekamMedis, icon: '📋', href: '/dashboard/rekam-medis' },
            { label: 'Pendapatan Hari Ini', value: formatRp(pendapatanHariIni), icon: '💰', href: '/dashboard/keuangan' },
          ].map(k => (
            <Link key={k.label} href={k.href}>
              <div className="border rounded-xl p-4 space-y-2 hover:shadow-md transition cursor-pointer">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">{k.label}</p>
                  <span className="text-xl">{k.icon}</span>
                </div>
                <p className="text-2xl font-bold">{k.value}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Jadwal Hari Ini */}
      <div className="border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold">Jadwal Hari Ini</h2>
            <p className="text-gray-500 text-sm">Daftar pasien berdasarkan waktu kunjungan</p>
          </div>
          <Link href="/dashboard/jadwal" className="text-green-600 text-sm font-medium">Lihat Semua →</Link>
        </div>

        {loading ? <p>Memuat...</p> : jadwalHariIni.length === 0 ? (
          <p className="text-gray-400 text-sm">Tidak ada jadwal hari ini.</p>
        ) : (
          jadwalHariIni.map((j, i) => (
            <div key={j.id} className="flex items-center justify-between border rounded-lg p-3">
              <div className="flex items-center gap-3">
                <span className="bg-primary/90 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
                  A-{String(i + 1).padStart(3, '0')}
                </span>
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold text-green-700">
                  {j.nama_pasien?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{j.nama_pasien}</p>
                  <p className="text-xs text-gray-500">{j.layanan}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>🕐</span>
                <span>{j.waktu?.slice(0, 5)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}