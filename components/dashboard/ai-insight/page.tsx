'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

// ── Types ────────────────────────────────────────────────────────────────────
interface ClusterStat {
  cluster: string
  label: string
  count: number
  avgUmur: number
  avgPembayaran: number
  layananDominan: string
  color: string
}

interface MonthlyData {
  bulan: string
  kunjungan: number
  pendapatan: number
}

interface AlertPasien {
  nama: string
  tag: string
  detail: string
}

// ── Data statis dari hasil PSD (bisa diganti fetch Supabase) ─────────────────
const CLUSTER_STATS: ClusterStat[] = [
  { cluster: 'A', label: 'Reguler', count: 12, avgUmur: 28.8, avgPembayaran: 308333, layananDominan: 'Imunisasi Bayi', color: '#3b82f6' },
  { cluster: 'B', label: 'Aktif',   count: 10, avgUmur: 31,   avgPembayaran: 327500, layananDominan: 'USG',            color: '#22c55e' },
  { cluster: 'C', label: 'Prioritas', count: 8, avgUmur: 33.2, avgPembayaran: 353125, layananDominan: 'Periksa Kehamilan', color: '#a855f7' },
]

const ALERT_PASIEN: AlertPasien[] = [
  { nama: 'Irma Dewi',     tag: 'Frekuensi Tinggi', detail: '3 kunjungan/bulan · USG + Imunisasi + Periksa' },
  { nama: 'Indah Wati',    tag: 'Pengeluaran Tinggi', detail: 'Total Rp 650.000 · KB + Imunisasi + USG' },
  { nama: 'Siti Putri',    tag: 'Usia Risiko', detail: 'Umur 41 thn · Cluster C · Periksa Kehamilan' },
  { nama: 'Lestari Putri', tag: 'Usia Risiko', detail: 'Umur 40 thn · KB · Kunjungan hanya 1x' },
  { nama: 'Juwita Putri',  tag: 'Butuh Follow-up', detail: 'Periksa + Nifas + follow-up terjadwal' },
]

const DATA_LAYANAN = [
  { nama: 'USG',                 sesi: 13, pendapatan: 4550000, pct: 85 },
  { nama: 'Imunisasi Bayi',      sesi: 13, pendapatan: 2600000, pct: 68 },
  { nama: 'Periksa Kehamilan',   sesi: 11, pendapatan: 1650000, pct: 55 },
  { nama: 'Konsultasi KB',       sesi: 10, pendapatan: 1000000, pct: 45 },
  { nama: 'Kontrol Nifas',       sesi: 8,  pendapatan: 1000000, pct: 35 },
]

const BAR_COLORS = ['#2d6a9f', '#16a34a', '#7c3aed', '#d97706', '#e11d48']

// ── Context ringkas untuk Claude ─────────────────────────────────────────────
const AI_CONTEXT = `
Data Klinik Bidan (K-Means, 3 Cluster):
- Cluster A (12 pasien, Reguler): umur 28.8 thn, kunjungan 2x, Rp 308.333/pasien, Imunisasi Bayi
- Cluster B (10 pasien, Aktif): umur 31 thn, kunjungan 1.6x, Rp 327.500/pasien, USG, dominan laki-laki
- Cluster C (8 pasien, Prioritas): umur 33.2 thn, kunjungan 1x, Rp 353.125/pasien, Periksa Kehamilan

Transaksi Jan–Mei 2026: Total Rp 9.775.000 dari 52 sesi.
USG=13 sesi, Imunisasi=13, Periksa=11, KB=10, Nifas=8.
Pengeluaran operasional: Rp 1.600.000.

Jadwal mendatang: 14 sisa Mei + 30 di Juni = 44 total.
Pendapatan Jan=Rp2,8jt, Feb=Rp1,4jt, Mar=Rp2,8jt, Apr=Rp1,9jt, Mei=Rp1,6jt.

Pasien perhatian: Irma Dewi (3 kunjungan/bln), Indah Wati (Rp650rb), Siti Putri (41 thn), Lestari Putri (40 thn), Juwita Putri (butuh follow-up nifas).
`

const formatRp = (n: number) => {
  if (n >= 1000000) return 'Rp ' + (n / 1000000).toFixed(1) + ' jt'
  if (n >= 1000)    return 'Rp ' + (n / 1000).toFixed(0) + ' rb'
  return 'Rp ' + n.toLocaleString('id-ID')
}

const TAG_COLOR: Record<string, string> = {
  'Frekuensi Tinggi':  'bg-orange-100 text-orange-800 border-orange-200',
  'Pengeluaran Tinggi':'bg-red-100 text-red-800 border-red-200',
  'Usia Risiko':       'bg-rose-100 text-rose-800 border-rose-200',
  'Butuh Follow-up':   'bg-amber-100 text-amber-800 border-amber-200',
}

// ── Component utama ───────────────────────────────────────────────────────────
export default function AiInsight() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [aiText, setAiText]           = useState('')
  const [aiLoading, setAiLoading]     = useState(false)
  const [totalPasien, setTotalPasien] = useState(30)
  const [totalPendapatan, setTotalPendapatan] = useState(9775000)

  // Fetch data dari Supabase (opsional — aktifkan sesuai nama tabel kamu)
  useEffect(() => {
    fetchMonthlyData()
    // fetchSupabaseStats()  // ← aktifkan kalau tabel sudah siap
  }, [])

  // Data tren bulanan — bisa diganti query Supabase
  const fetchMonthlyData = () => {
    setMonthlyData([
      { bulan: 'Jan', kunjungan: 14, pendapatan: 2800000 },
      { bulan: 'Feb', kunjungan: 7,  pendapatan: 1375000 },
      { bulan: 'Mar', kunjungan: 14, pendapatan: 2800000 },
      { bulan: 'Apr', kunjungan: 10, pendapatan: 1925000 },
      { bulan: 'Mei', kunjungan: 7,  pendapatan: 1600000 },
    ])
  }

  // Contoh fetch dari Supabase — sesuaikan nama tabel
  // const fetchSupabaseStats = async () => {
  //   const { count } = await supabase.from('pasien').select('*', { count: 'exact', head: true })
  //   if (count) setTotalPasien(count)
  //   const { data } = await supabase.from('transaksi').select('jumlah').eq('tipe', 'masuk')
  //   if (data) setTotalPendapatan(data.reduce((s, r) => s + r.jumlah, 0))
  // }

  // ── Claude API call ────────────────────────────────────────────────────────
  const generateInsight = async () => {
    setAiLoading(true)
    setAiText('')
    try {
      const res = await fetch('/api/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: AI_CONTEXT }),
      })
      const data = await res.json()
      setAiText(data.insight ?? 'Gagal mendapatkan insight.')
    } catch {
      setAiText('⚠️ Koneksi ke AI gagal. Periksa API route.')
    }
    setAiLoading(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-blue-900 to-blue-600 p-5 text-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">🏥 AI Insight Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">Analisis otomatis · Data pasien, transaksi & jadwal klinik</p>
        </div>
        <span className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs text-blue-100">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Powered by Claude AI
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Pasien',       val: `${totalPasien}`,            sub: 'Aktif dalam sistem',     border: 'border-l-blue-500' },
          { label: 'Total Pendapatan',   val: formatRp(totalPendapatan),   sub: 'Jan–Mei 2026',           border: 'border-l-green-500' },
          { label: 'Jadwal Mendatang',   val: '44',                        sub: '14 Mei + 30 Juni',       border: 'border-l-purple-500' },
          { label: 'Layanan Terpopuler', val: 'USG',                       sub: '& Imunisasi Bayi',       border: 'border-l-amber-500' },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${s.border}`}>
            <p className="text-xs text-slate-500 font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 leading-none">{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Cluster + Pasien perhatian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Cluster */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">🔵 Analisis Cluster Pasien</h2>
          <div className="space-y-3">
            {CLUSTER_STATS.map(c => (
              <div key={c.cluster} className="rounded-lg p-3 border"
                style={{ background: c.color + '12', borderColor: c.color + '40' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: c.color }}>
                      Cluster {c.cluster} — {c.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.layananDominan} · umur {c.avgUmur} thn</p>
                    <p className="text-xs text-slate-500">{formatRp(c.avgPembayaran)}/pasien</p>
                  </div>
                  <span className="text-lg font-bold text-slate-700">{c.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pasien perhatian */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">⚠️ Pasien yang Perlu Perhatian</h2>
          <div className="space-y-2">
            {ALERT_PASIEN.map(p => (
              <div key={p.nama} className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm text-orange-900">{p.nama}</p>
                  <p className="text-xs text-orange-700 mt-0.5">{p.detail}</p>
                </div>
                <span className={`text-xs border rounded-full px-2 py-0.5 font-semibold ml-2 shrink-0 ${TAG_COLOR[p.tag]}`}>
                  {p.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tren + Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tren bulanan */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">📈 Tren Kunjungan & Pendapatan</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => formatRp(v)} />
              <Tooltip formatter={(val, name) =>
                name === 'pendapatan' ? [formatRp(val as number), 'Pendapatan'] : [val, 'Kunjungan']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left"  dataKey="kunjungan"  fill="#2d6a9f" radius={[4,4,0,0]} name="Kunjungan" />
              <Bar yAxisId="right" dataKey="pendapatan" fill="#22c55e" radius={[4,4,0,0]} name="Pendapatan" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribusi layanan */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">🏥 Distribusi Layanan</h2>
          <div className="space-y-3">
            {DATA_LAYANAN.map((l, i) => (
              <div key={l.nama}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{l.nama}</span>
                  <span className="text-slate-800 font-semibold">{l.sesi} sesi · {formatRp(l.pendapatan)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${l.pct}%`, background: BAR_COLORS[i] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prediksi pendapatan */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">💰 Prediksi Pendapatan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { period: 'Sisa Mei 2026',          val: 'Rp 3.875.000', note: '↑ 14 jadwal aktif',       up: true },
            { period: 'Juni 2026 (proyeksi)',    val: 'Rp 5.250.000', note: '↑ 30 jadwal · +35%',      up: true },
            { period: 'Rata-rata/bulan',         val: 'Rp 2.443.000', note: 'Berdasarkan Jan–Mei',      up: null },
            { period: 'Pengeluaran operasional', val: 'Rp 1.600.000', note: '↓ 5 transaksi keluar',     up: false },
          ].map(p => (
            <div key={p.period} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-xs text-slate-500 font-medium">{p.period}</p>
              <p className="text-lg font-bold text-blue-800 mt-1">{p.val}</p>
              <p className={`text-xs mt-1 font-medium ${p.up === true ? 'text-green-600' : p.up === false ? 'text-red-500' : 'text-slate-400'}`}>
                {p.note}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight box */}
      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wide">🤖 AI Insight Otomatis</h2>
          <button
            onClick={generateInsight}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400
              text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            {aiLoading ? '⏳ Menganalisis...' : '✨ Generate Insight'}
          </button>
        </div>

        {aiLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            AI sedang menganalisis data klinik...
          </div>
        )}

        {!aiLoading && !aiText && (
          <p className="text-slate-400 text-sm italic">
            Klik "Generate Insight" untuk mendapatkan analisis AI dari seluruh data klinik.
          </p>
        )}

        {!aiLoading && aiText && (
          <div className="text-sm text-blue-900 leading-relaxed space-y-2">
            {aiText.split('\n').filter(Boolean).map((line, i) => (
              <p key={i} dangerouslySetInnerHTML={{
                __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Ringkasan */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">📋 Ringkasan Eksekutif</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Klinik memiliki <strong>30 pasien aktif</strong> yang terbagi dalam 3 segmen hasil K-Means clustering.
          Layanan <strong>USG dan Imunisasi Bayi</strong> mendominasi dengan 26 dari 52 sesi transaksi (50%).
          Cluster C (Prioritas) meski hanya 8 pasien, rata-rata pengeluarannya tertinggi — segmen ini perlu program retensi khusus.{' '}
          <strong>Juni 2026</strong> diprediksi menjadi bulan terbaik dengan 30 jadwal terdaftar, berpotensi melampaui Rp 5 juta.
          Terdapat <strong>5 pasien yang perlu perhatian ekstra</strong> karena frekuensi, usia risiko, atau kebutuhan follow-up.
        </p>
      </div>

    </div>
  )
}
