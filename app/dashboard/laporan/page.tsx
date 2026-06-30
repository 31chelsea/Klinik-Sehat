'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { hitungFeaturesPasien, prediksiCluster, CENTROIDS, PasienFeatures } from '@/lib/clustering'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const formatRp = (n: number) => 'Rp ' + n.toLocaleString('id-ID')

const KATEGORI_COLOR: Record<string, string> = {
  'Risiko Rendah': '#A7C7E7',
  'Risiko Sedang': '#90EE90',
  'Risiko Tinggi': '#EE7272',
}

type PasienHasil = PasienFeatures & { kategori: string; umur_asli: number }

export default function LaporanPage() {
  // State lama
  const [totalPasien, setTotalPasien] = useState(0)
  const [totalTransaksi, setTotalTransaksi] = useState(0)
  const [totalRekamMedis, setTotalRekamMedis] = useState(0)
  const [totalLayanan, setTotalLayanan] = useState(0)
  const [transaksiList, setTransaksiList] = useState<any[]>([])
  const [rekamMedisList, setRekamMedisList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // State baru untuk clustering
  const [hasilCluster, setHasilCluster] = useState<PasienHasil[]>([])
  const [loadingCluster, setLoadingCluster] = useState(true)

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

  const fetchAndCluster = async () => {
    const { data: pasienList } = await supabase.from('pasien').select('nama, tanggal_lahir')
    const { data: jadwalList } = await supabase.from('jadwal_praktik').select('nama_pasien, layanan')

    if (!pasienList) { setLoadingCluster(false); return }

    const jadwalByPasien: Record<string, { layanan: string }[]> = {}
    jadwalList?.forEach(j => {
      if (!jadwalByPasien[j.nama_pasien]) jadwalByPasien[j.nama_pasien] = []
      jadwalByPasien[j.nama_pasien].push({ layanan: j.layanan })
    })

    const hasil: PasienHasil[] = pasienList.map(p => {
      const umurAsli = p.tanggal_lahir ? new Date().getFullYear() - new Date(p.tanggal_lahir).getFullYear() : 25
      const jadwalPasien = jadwalByPasien[p.nama] || []
      const features = hitungFeaturesPasien(p.nama, jadwalPasien, umurAsli)
      const kategori = prediksiCluster(features)
      return { ...features, kategori, umur_asli: umurAsli }
    })
    console.log('Sample jadwal keys:', Object.keys(jadwalByPasien).slice(0, 3))
    console.log('Sample pasien names:', pasienList.slice(0, 3).map(p => p.nama))
    setHasilCluster(hasil)
    setLoadingCluster(false)
  }

  useEffect(() => {
    fetchData()
    fetchAndCluster()
  }, [])

  const totalPendapatan = transaksiList.reduce((a, t) => a + t.jumlah, 0)

  // Distribusi layanan dari rekam medis (LAMA)
  const distribusi: Record<string, number> = {}
  rekamMedisList.forEach(r => {
    const key = r.jenis_pemeriksaan || r.diagnosis || 'Lainnya'
    distribusi[key] = (distribusi[key] || 0) + 1
  })
  const distribusiArr = Object.entries(distribusi).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const totalDist = rekamMedisList.length || 1

  // Pendapatan per bulan (LAMA)
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

  // Data untuk clustering (BARU)
  const totalPasienCluster = hasilCluster.length
  const distribusiCluster = ['Risiko Rendah', 'Risiko Sedang', 'Risiko Tinggi'].map(kategori => ({
    kategori,
    jumlah: hasilCluster.filter(h => h.kategori === kategori).length,
  }))

  const pasienRisikoTinggi = hasilCluster
    .filter(h => h.kategori === 'Risiko Tinggi')
    .sort((a, b) => b.tingkat_keparahan - a.tingkat_keparahan)
    .slice(0, 10)

  const radarData = [
    { variabel: 'Keparahan', ...Object.fromEntries(Object.entries(CENTROIDS).map(([k, v]) => [k, v.keparahan])) },
    { variabel: 'Kunjungan', ...Object.fromEntries(Object.entries(CENTROIDS).map(([k, v]) => [k, v.kunjungan])) },
    { variabel: 'Variasi Layanan', ...Object.fromEntries(Object.entries(CENTROIDS).map(([k, v]) => [k, v.variasi])) },
    { variabel: 'Frek. USG', ...Object.fromEntries(Object.entries(CENTROIDS).map(([k, v]) => [k, v.usg])) },
    { variabel: 'Umur', ...Object.fromEntries(Object.entries(CENTROIDS).map(([k, v]) => [k, v.umur])) },
  ]

  const umurBins = [
    { label: '<25', min: 0, max: 24 },
    { label: '25-34', min: 25, max: 34 },
    { label: '35-44', min: 35, max: 44 },
    { label: '45-54', min: 45, max: 54 },
    { label: '55+', min: 55, max: 999 },
  ]
  const umurDistribusi = umurBins.map(bin => {
    const row: any = { range: bin.label }
    ;['Risiko Rendah', 'Risiko Sedang', 'Risiko Tinggi'].forEach(kategori => {
      row[kategori] = hasilCluster.filter(h => h.kategori === kategori && h.umur_asli >= bin.min && h.umur_asli <= bin.max).length
    })
    return row
  })

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
          {/* Kartu Ringkasan (LAMA - tidak diubah) */}
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
            {/* Distribusi Layanan (LAMA) */}
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

            {/* Pendapatan Bulanan (LAMA) */}
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

      {/* ===== SECTION BARU: ANALISIS CLUSTERING ===== */}
      <div className="pt-4 border-t">
        <h2 className="text-xl font-bold">Analisis Clustering Pasien</h2>
        <p className="text-gray-500 text-sm mb-4">Pengelompokan risiko berbasis K-Means (otomatis update)</p>
      </div>

      {loadingCluster ? <p>Menghitung clustering...</p> : totalPasienCluster === 0 ? (
        <p className="text-gray-400">Belum ada data pasien untuk dianalisis.</p>
      ) : (
        <>
          {/* Kartu Statistik Cluster */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-xl p-4">
              <p className="text-gray-500 text-sm">Total Pasien Dianalisis</p>
              <p className="text-2xl font-bold mt-1">{totalPasienCluster}</p>
            </div>
            <div className="border rounded-xl p-4" style={{ borderLeft: `4px solid ${KATEGORI_COLOR['Risiko Tinggi']}` }}>
              <p className="text-gray-500 text-sm">Risiko Tinggi</p>
              <p className="text-2xl font-bold mt-1" style={{ color: KATEGORI_COLOR['Risiko Tinggi'] }}>
                {distribusiCluster.find(d => d.kategori === 'Risiko Tinggi')?.jumlah || 0}
              </p>
            </div>
            <div className="border rounded-xl p-4" style={{ borderLeft: `4px solid ${KATEGORI_COLOR['Risiko Sedang']}` }}>
              <p className="text-gray-500 text-sm">Risiko Sedang</p>
              <p className="text-2xl font-bold mt-1" style={{ color: KATEGORI_COLOR['Risiko Sedang'] }}>
                {distribusiCluster.find(d => d.kategori === 'Risiko Sedang')?.jumlah || 0}
              </p>
            </div>
            <div className="border rounded-xl p-4" style={{ borderLeft: `4px solid ${KATEGORI_COLOR['Risiko Rendah']}` }}>
              <p className="text-gray-500 text-sm">Risiko Rendah</p>
              <p className="text-2xl font-bold mt-1" style={{ color: KATEGORI_COLOR['Risiko Rendah'] }}>
                {distribusiCluster.find(d => d.kategori === 'Risiko Rendah')?.jumlah || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribusi Kategori - Pie Chart */}
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Distribusi Kategori Risiko</h2>
              <p className="text-gray-500 text-xs mb-3">Proporsi {totalPasienCluster} pasien per kategori</p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={distribusiCluster} dataKey="jumlah" nameKey="kategori" cx="50%" cy="50%" outerRadius={80}
                    label={(entry) => `${entry.kategori}: ${entry.jumlah}`}>
                    {distribusiCluster.map(d => <Cell key={d.kategori} fill={KATEGORI_COLOR[d.kategori]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Pasien Perlu Perhatian */}
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Pasien Perlu Perhatian</h2>
              <p className="text-gray-500 text-xs mb-3">Kategori Risiko Tinggi, diurutkan dari paling parah</p>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {pasienRisikoTinggi.length === 0 ? (
                  <p className="text-gray-400 text-sm">Tidak ada pasien risiko tinggi.</p>
                ) : pasienRisikoTinggi.map(p => (
                  <div key={p.nama_pasien} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    <div>
                      <p className="font-medium text-sm text-red-800">{p.nama_pasien}</p>
                      <p className="text-xs text-red-500">{p.jumlah_kunjungan} kunjungan • {p.umur_asli} tahun</p>
                    </div>
                    <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded-full font-medium">
                      Keparahan {p.tingkat_keparahan}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Profil Karakteristik per Kategori</h2>
              <p className="text-gray-500 text-xs mb-3">Perbandingan 5 variabel (skor rata-rata)</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="variabel" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                  <Radar name="Risiko Rendah" dataKey="Risiko Rendah" stroke={KATEGORI_COLOR['Risiko Rendah']} fill={KATEGORI_COLOR['Risiko Rendah']} fillOpacity={0.15} />
                  <Radar name="Risiko Sedang" dataKey="Risiko Sedang" stroke={KATEGORI_COLOR['Risiko Sedang']} fill={KATEGORI_COLOR['Risiko Sedang']} fillOpacity={0.15} />
                  <Radar name="Risiko Tinggi" dataKey="Risiko Tinggi" stroke={KATEGORI_COLOR['Risiko Tinggi']} fill={KATEGORI_COLOR['Risiko Tinggi']} fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Scatter Plot */}
            <div className="border rounded-xl p-4">
              <h2 className="font-semibold mb-1">Sebaran Pasien: Keparahan vs Kunjungan</h2>
              <p className="text-gray-500 text-xs mb-3">Visualisasi hasil clustering</p>
              <ResponsiveContainer width="100%" height={260}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tingkat_keparahan" name="Keparahan" type="number" domain={[0.5, 3.5]} tick={{ fontSize: 11 }} label={{ value: 'Tingkat Keparahan', position: 'insideBottom', offset: -5, fontSize: 11 }} />
                  <YAxis dataKey="jumlah_kunjungan" name="Kunjungan" type="number" domain={[0.5, 3.5]} tick={{ fontSize: 11 }} label={{ value: 'Jumlah Kunjungan (skor)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                  {['Risiko Rendah', 'Risiko Sedang', 'Risiko Tinggi'].map(kategori => (
                    <Scatter key={kategori} name={kategori}
                      data={hasilCluster.filter(h => h.kategori === kategori)}
                      fill={KATEGORI_COLOR[kategori]} opacity={0.8} />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribusi Umur */}
          <div className="border rounded-xl p-4">
            <h2 className="font-semibold mb-1">Distribusi Umur per Kategori Risiko</h2>
            <p className="text-gray-500 text-xs mb-3">Sebaran kelompok umur pasien</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={umurDistribusi}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Risiko Rendah" fill={KATEGORI_COLOR['Risiko Rendah']} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Risiko Sedang" fill={KATEGORI_COLOR['Risiko Sedang']} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Risiko Tinggi" fill={KATEGORI_COLOR['Risiko Tinggi']} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}