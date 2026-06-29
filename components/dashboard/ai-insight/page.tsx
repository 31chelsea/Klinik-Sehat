'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ClusterStat {
  nama: string
  warna: string
  jumlah: number
  pasien: string[]
  rataUmur: number
  rataKunjungan: number
  rataSkor: number
}

const REKOMENDASI: Record<string, string> = {
  'Risiko Rendah': 'Jadwal kontrol rutin; tidak perlu tindakan darurat',
  'Risiko Sedang': 'Monitor berkala; pastikan jadwal ANC / nifas terpenuhi',
  'Risiko Tinggi': 'Prioritas kunjungan; koordinasi dengan dokter jika diperlukan',
}
const BG: Record<string, string>     = { 'Risiko Rendah': '#f0fdf4', 'Risiko Sedang': '#fffbeb', 'Risiko Tinggi': '#fef2f2' }
const BORDER: Record<string, string> = { 'Risiko Rendah': '#bbf7d0', 'Risiko Sedang': '#fde68a', 'Risiko Tinggi': '#fecaca' }

export default function AiInsight() {
  const [clusters, setClusters]       = useState<ClusterStat[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeCluster, setActive]    = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/clustering')
      .then(r => r.json())
      .then(d => { setClusters(d.clusterStats); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
      Menghitung clustering pasien...
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Insight Klinik</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Clustering otomatis berbasis tingkat keparahan klinis · diperbarui setiap ada pasien baru
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {clusters.map(c => (
          <div key={c.nama} className="bg-card rounded-xl p-4 shadow-sm border-l-4"
            style={{ borderLeftColor: c.warna }}>
            <p className="text-xs text-muted-foreground font-medium mb-1">{c.nama}</p>
            <p className="text-2xl font-bold text-foreground leading-none">{c.jumlah}</p>
            <p className="text-xs text-muted-foreground mt-1">pasien</p>
          </div>
        ))}
      </div>

      {/* Cluster cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusters.map(c => (
          <div key={c.nama} onClick={() => setActive(activeCluster === c.nama ? null : c.nama)}
            className="rounded-xl p-4 border cursor-pointer transition-all hover:shadow-md"
            style={{ background: BG[c.nama], borderColor: BORDER[c.nama] }}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-base" style={{ color: c.warna }}>{c.nama}</p>
                <p className="text-xs text-slate-500 mt-0.5">Rata-rata skor: {c.rataSkor}</p>
              </div>
              <span className="text-3xl font-bold text-slate-700">{c.jumlah}</span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 mt-3">
              <div className="flex justify-between">
                <span>Rata-rata kunjungan</span>
                <span className="font-semibold">{c.rataKunjungan}x</span>
              </div>
              <div className="flex justify-between">
                <span>Rata-rata umur</span>
                <span className="font-semibold">{c.rataUmur} thn</span>
              </div>
            </div>

            {activeCluster === c.nama && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: BORDER[c.nama] }}>
                <p className="text-xs font-semibold text-slate-600 mb-2">Daftar pasien:</p>
                <div className="flex flex-wrap gap-1">
                  {c.pasien.map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: c.warna + '20', color: c.warna }}>
                      {p}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 italic">💡 {REKOMENDASI[c.nama]}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl p-5 shadow-sm">
          <p className="font-bold text-sm mb-1">Rata-rata Kunjungan per Cluster</p>
          <p className="text-xs text-muted-foreground mb-4">Berdasarkan data jadwal praktik</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clusters.map(c => ({ nama: c.nama.replace('Risiko ', ''), nilai: c.rataKunjungan, color: c.warna }))} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} />
              <Tooltip formatter={val => [`${val}x`, 'Rata-rata kunjungan']} />
              <Bar dataKey="nilai" radius={[6, 6, 0, 0]}>
                {clusters.map((c, i) => <Cell key={i} fill={c.warna} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-sm">
          <p className="font-bold text-sm mb-1">Rata-rata Skor Keparahan per Cluster</p>
          <p className="text-xs text-muted-foreground mb-4">Skor 1=Ringan, 2=Sedang, 3=Berat</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={clusters.map(c => ({ nama: c.nama.replace('Risiko ', ''), nilai: c.rataSkor, color: c.warna }))} barSize={50}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} />
              <Tooltip formatter={val => [val, 'Rata-rata skor']} />
              <Bar dataKey="nilai" radius={[6, 6, 0, 0]}>
                {clusters.map((c, i) => <Cell key={i} fill={c.warna} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rekomendasi */}
      <div className="bg-card rounded-xl p-5 shadow-sm">
        <p className="font-bold text-sm mb-4">📋 Rekomendasi Tindakan per Cluster</p>
        <div className="space-y-3">
          {[...clusters].reverse().map(c => (
            <div key={c.nama} className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: BG[c.nama], border: `1px solid ${BORDER[c.nama]}` }}>
              <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: c.warna }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: c.warna }}>{c.nama}</p>
                <p className="text-xs text-slate-600 mt-0.5">{REKOMENDASI[c.nama]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}