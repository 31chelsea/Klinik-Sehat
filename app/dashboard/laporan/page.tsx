'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

export default function LaporanPage() {
  const [totalPasien, setTotalPasien] = useState(0)
  const [totalTransaksi, setTotalTransaksi] = useState(0)
  const [totalRekamMedis, setTotalRekamMedis] = useState(0)
  const [totalLayanan, setTotalLayanan] = useState(0)
  const [transaksiList, setTransaksiList] = useState<any[]>([])
  const [rekamMedisList, setRekamMedisList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { count: cp } = await supabase.from('pasien').select('*', { count: 'exact', head: true })
    const { count: ct } = await supabase.from('transaksi').select('*', { count: 'exact', head: true })
    const { count: cr } = await supabase.from('rekam_medis').select('*', { count: 'exact', head: true })
    const { count: cl } = await supabase.from('harga_layanan').select('*', { count: 'exact', head: true })
    const { data: t } = await supabase.from('transaksi').select('*').eq('tipe', 'masuk').order('tanggal')
    const { data: r } = await supabase.from('rekam_medis').select('*')

    setTotalPasien(cp || 0)
    setTotalTransaksi(ct || 0)
    setTotalRekamMedis(cr || 0)
    setTotalLayanan(cl || 0)
    setTransaksiList(t || [])
    setRekamMedisList(r || [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const totalPendapatan = transaksiList.reduce((a, t) => a + t.jumlah, 0)

  // Distribusi layanan dari rekam medis
  const distribusi: Record<string, number> = {}
  rekamMedisList.forEach(r => {
    const key = r.jenis_pemeriksaan || r.diagnosis || 'Lainnya'
    distribusi[key] = (distribusi[key] || 0) + 1
  })
  const distribusiArr = Object.entries(distribusi).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalDist = rekamMedisList.length || 1

  // Pendapatan per bulan
  const perBulan: Record<string, number> = {}
  transaksiList.forEach(t => {
    const key = t.tanggal?.slice(0, 7)
    if (key) perBulan[key] = (perBulan[key] || 0) + t.jumlah
  })
  const perBulanArr = Object.entries(perBulan).sort().slice(-5)
  const maxBulan = Math.max(...perBulanArr.map(b => b[1]), 1)

  const bulanNama: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'Mei', '06': 'Jun', '07': 'Jul', '08': 'Agu',
    '09': 'Sep', '10': 'Okt', '11': 'Nov', '12': 'Des'
  }

  const formatBulan = (key: string) => {
    const [year, month] = key.split('-')
    return `${bulanNama[month]} ${year}`
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Laporan</h1>
          <p className="text-gray-500 text-sm">Analisis dan laporan klinik</p>
        </div>
      </div>

      {loading ? <p>Memuat data...</p> : (
        <>
          {/* Kartu Ringkasan */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Pasien', value: totalPasien, satuan: 'pasien', icon: '👥', color: 'bg-green-100 text-green-600' },
              { label: 'Total Transaksi', value: totalTransaksi, satuan: 'transaksi', icon: '💳', color: 'bg-blue-100 text-blue-600' },
              { label: 'Rekam Medis', value: totalRekamMedis, satuan: 'rekaman', icon: '📋', color: 'bg-purple-100 text-purple-600' },
              { label: 'Daftar Layanan', value: totalLayanan, satuan: 'layanan', icon: '🏥', color: 'bg-orange-100 text-orange-600' },
            ].map(k => (
              <div key={k.label} className="border rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-500 text-sm">{k.label}</p>
                  <span className={`p-2 rounded-lg text-lg ${k.color}`}>{k.icon}</span>
                </div>
                <p className="text-3xl font-bold">{k.value}</p>
                <p className="text-xs text-gray-400">{k.satuan} terdaftar</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribusi Layanan */}
            <div className="border rounded-xl p-4 space-y-3">
              <h2 className="font-semibold">Distribusi Layanan</h2>
              <p className="text-gray-500 text-sm">Berdasarkan rekam medis</p>
              {distribusiArr.length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada data rekam medis.</p>
              ) : distribusiArr.map(([nama, jumlah]) => (
                <div key={nama} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{nama}</span>
                    <span className="text-gray-500">{jumlah} ({Math.round(jumlah / totalDist * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary/90 h-2 rounded-full" style={{ width: `${jumlah / totalDist * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pendapatan Bulanan */}
            <div className="border rounded-xl p-4 space-y-3">
              <h2 className="font-semibold">Pendapatan Bulanan</h2>
              <p className="text-gray-500 text-sm">5 bulan terakhir</p>
              {perBulanArr.length === 0 ? (
                <p className="text-gray-400 text-sm">Belum ada data transaksi.</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 text-xs uppercase">
                        <th className="text-left py-1">Bulan</th>
                        <th className="text-left py-1">Pendapatan</th>
                        <th className="text-left py-1">Grafik</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perBulanArr.map(([key, jumlah]) => (
                        <tr key={key} className="border-t">
                          <td className="py-2">{formatBulan(key)}</td>
                          <td className="py-2">{formatRp(jumlah)}</td>
                          <td className="py-2 w-32">
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-primary/90 h-2 rounded-full" style={{ width: `${jumlah / maxBulan * 100}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <div>
                      <p className="text-gray-400">Total Pendapatan</p>
                      <p className="font-bold">{formatRp(totalPendapatan)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Rata-rata/bulan</p>
                      <p className="font-bold">{formatRp(Math.round(totalPendapatan / (perBulanArr.length || 1)))}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}