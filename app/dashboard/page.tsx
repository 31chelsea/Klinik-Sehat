'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, ResponsiveContainer, Cell } from 'recharts'

const formatRp = (n: number) => {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return 'Rp ' + (n / 1000).toFixed(0) + 'K'
  return 'Rp ' + n.toLocaleString('id-ID')
}

const CLUSTER_COLOR: Record<string, string> = {
  'Cluster A': '#A7C7E7',
  'Cluster B': '#90EE90',
  'Cluster C': '#EE7272',
}

export default function DashboardPage() {
  const [totalPasien, setTotalPasien] = useState(0)
  const [jadwalHariIni, setJadwalHariIni] = useState<any[]>([])
  const [totalRekamMedis, setTotalRekamMedis] = useState(0)
  const [pendapatanHariIni, setPendapatanHariIni] = useState(0)
  const [clusterData, setClusterData] = useState<{ cluster: string; count: number; avgKunjungan: number; avgPembayaran: number }[]>([])
  const [scatterData, setScatterData] = useState<{ cluster: string; data: { umur: number; pembayaran: number; nama: string }[] }[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchData = async () => {
    const { count: cp } = await supabase.from('pasien').select('*', { count: 'exact', head: true })
    const { data: jadwal } = await supabase.from('jadwal_praktik').select('*').eq('tanggal', today).order('waktu')
    const { count: cr } = await supabase.from('rekam_medis').select('*', { count: 'exact', head: true })
    const { data: transaksi } = await supabase.from('transaksi').select('*').eq('tipe', 'masuk').eq('tanggal', today)
    const { data: pasienData } = await supabase.from('pasien').select('nama, tanggal_lahir, cluster')
    const { data: jadwalData } = await supabase.from('jadwal_praktik').select('nama_pasien')
    const { data: transaksiData } = await supabase.from('transaksi').select('keterangan, jumlah').eq('tipe', 'masuk')

    setTotalPasien(cp || 0)
    setJadwalHariIni(jadwal || [])
    setTotalRekamMedis(cr || 0)
    setPendapatanHariIni(transaksi?.reduce((a, t) => a + t.jumlah, 0) || 0)

    // Hitung jumlah kunjungan per pasien
    const kunjunganMap: Record<string, number> = {}
    jadwalData?.forEach(j => {
      kunjunganMap[j.nama_pasien] = (kunjunganMap[j.nama_pasien] || 0) + 1
    })

    // Hitung total pembayaran per pasien
    const pembayaranMap: Record<string, number> = {}
    transaksiData?.forEach(t => {
      const nama = t.keterangan?.split(' - ')[1]
      if (nama) pembayaranMap[nama] = (pembayaranMap[nama] || 0) + t.jumlah
    })

    // Cluster summary
    const clusterMap: Record<string, { count: number; kunjungan: number[]; pembayaran: number[] }> = {}
    const scatterMap: Record<string, { umur: number; pembayaran: number; nama: string }[]> = {}

    pasienData?.forEach(p => {
      if (!p.cluster) return
      const tahunLahir = p.tanggal_lahir ? new Date(p.tanggal_lahir).getFullYear() : 2000
      const umur = 2026 - tahunLahir
      const kunjungan = kunjunganMap[p.nama] || 0
      const pembayaran = pembayaranMap[p.nama] || 0

      if (!clusterMap[p.cluster]) clusterMap[p.cluster] = { count: 0, kunjungan: [], pembayaran: [] }
      clusterMap[p.cluster].count++
      clusterMap[p.cluster].kunjungan.push(kunjungan)
      clusterMap[p.cluster].pembayaran.push(pembayaran)

      if (!scatterMap[p.cluster]) scatterMap[p.cluster] = []
      scatterMap[p.cluster].push({ umur, pembayaran, nama: p.nama })
    })

    const clusterArr = Object.entries(clusterMap).sort().map(([cluster, val]) => ({
      cluster,
      count: val.count,
      avgKunjungan: parseFloat((val.kunjungan.reduce((a, b) => a + b, 0) / val.kunjungan.length).toFixed(1)),
      avgPembayaran: Math.round(val.pembayaran.reduce((a, b) => a + b, 0) / val.pembayaran.length),
    }))
    setClusterData(clusterArr)

    const scatterArr = Object.entries(scatterMap).map(([cluster, data]) => ({ cluster, data }))
    setScatterData(scatterArr)

    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const totalClustered = clusterData.reduce((a, c) => a + c.count, 0)

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
          <button className="mt-4 bg-white text-primary font-semibold px-4 py-2 rounded-xl text-sm">
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

      {/* Distribusi Cluster */}
      {!loading && clusterData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clusterData.map(c => (
              <div key={c.cluster} className="border rounded-xl p-4 space-y-1"
                style={{ borderLeft: `4px solid ${CLUSTER_COLOR[c.cluster]}` }}>
                <div className="flex justify-between items-center">
                  <p className="font-semibold" style={{ color: CLUSTER_COLOR[c.cluster] }}>{c.cluster}</p>
                  <span className="text-2xl font-bold">{c.count}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {c.cluster === 'Cluster A' ? 'Pasien Reguler' : c.cluster === 'Cluster B' ? 'Pasien Aktif' : 'Pasien Prioritas'}
                </p>
                <div className="pt-1 space-y-0.5 text-xs text-gray-600">
                  <p>Rata-rata kunjungan: <strong>{c.avgKunjungan}x</strong></p>
                  <p>Rata-rata pembayaran: <strong>{formatRp(c.avgPembayaran)}</strong></p>
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Rata-rata Kunjungan per Cluster</h2>
              <p className="text-gray-500 text-xs mb-3">Berdasarkan data jadwal praktik</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={clusterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cluster" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${v}x`, 'Rata-rata Kunjungan']} />
                  <Bar dataKey="avgKunjungan" radius={[6, 6, 0, 0]}
                    label={{ position: 'top', fontSize: 11, fontWeight: 'bold' }}>
                    {clusterData.map(c => (
                      <Cell key={c.cluster} fill={CLUSTER_COLOR[c.cluster]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Rata-rata Pembayaran per Cluster</h2>
              <p className="text-gray-500 text-xs mb-3">Berdasarkan data transaksi</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={clusterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="cluster" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${v/1000}K`} />
                  <Tooltip formatter={(v: number) => [formatRp(v), 'Rata-rata Pembayaran']} />
                  <Bar dataKey="avgPembayaran" radius={[6, 6, 0, 0]}
                    label={{ position: 'top', fontSize: 10, fontWeight: 'bold', formatter: (v: number) => `${v/1000}K` }}>
                      {clusterData.map(c => (
                        <Cell key={c.cluster} fill={CLUSTER_COLOR[c.cluster]} />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scatter Chart */}
          <div className="border rounded-xl p-4">
            <h2 className="font-semibold mb-1">Sebaran Pasien: Umur vs Total Pembayaran</h2>
            <p className="text-gray-500 text-xs mb-3">Visualisasi hasil K-Means Clustering (k=3)</p>
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="umur" name="Umur" unit=" thn" type="number" domain={['auto', 'auto']} tick={{ fontSize: 11 }} label={{ value: 'Umur (tahun)', position: 'insideBottom', offset: -5, fontSize: 12 }} />
                <YAxis dataKey="pembayaran" name="Pembayaran" tickFormatter={v => `${v/1000}K`} tick={{ fontSize: 11 }} label={{ value: 'Pembayaran (Rp)', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v: number, name: string) => [name === 'pembayaran' ? formatRp(v) : `${v} tahun`, name === 'pembayaran' ? 'Pembayaran' : 'Umur']} />
                <Legend verticalAlign="top" />
                {scatterData.map(s => (
                  <Scatter key={s.cluster} name={s.cluster} data={s.data}
                    fill={CLUSTER_COLOR[s.cluster]} opacity={0.85} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </>
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
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">
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