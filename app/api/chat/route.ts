import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const pertanyaan = messages[messages.length - 1].content.toLowerCase()

  const [{ data: pasien }, { data: rekam_medis }, { data: transaksi }, { data: jadwal }] =
    await Promise.all([
      supabase.from('pasien').select('*'),
      supabase.from('rekam_medis').select('*'),
      supabase.from('transaksi').select('*'),
      supabase.from('jadwal_praktik').select('*'),
    ])

  const today = new Date()

  // Hitung umur
  const pasienUmur = pasien?.map(p => ({
    ...p,
    umur: Math.floor((today.getTime() - new Date(p.tanggal_lahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  })) ?? []

  // Frekuensi kunjungan per pasien
  const kunjunganMap: Record<string, number> = {}
  rekam_medis?.forEach(r => {
    kunjunganMap[r.nama_pasien] = (kunjunganMap[r.nama_pasien] ?? 0) + 1
  })
  const topKunjungan = Object.entries(kunjunganMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Keuangan
  const masuk  = transaksi?.filter(t => t.tipe === 'masuk') ?? []
  const keluar = transaksi?.filter(t => t.tipe === 'keluar') ?? []
  const totalMasuk  = masuk.reduce((s, t) => s + (t.jumlah ?? 0), 0)
  const totalKeluar = keluar.reduce((s, t) => s + (t.jumlah ?? 0), 0)

  // Jadwal mendatang
  const jadwalMendatang = jadwal
    ?.filter(j => new Date(j.tanggal) >= today)
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())
    ?? []

  // ── Logika jawaban berdasarkan kata kunci ────────────────────────────────
  let reply = ''

  if (pertanyaan.includes('pasien') && (pertanyaan.includes('sering') || pertanyaan.includes('banyak') || pertanyaan.includes('kunjungan'))) {
    reply = `Pasien yang paling sering datang:\n` +
      topKunjungan.map((([nama, jml], i) => `${i+1}. ${nama} — ${jml}x kunjungan`)).join('\n')

  } else if (pertanyaan.includes('pendapatan') || pertanyaan.includes('pemasukan') || pertanyaan.includes('uang masuk')) {
    reply = `Total pendapatan klinik: Rp ${totalMasuk.toLocaleString('id-ID')}\nTotal pengeluaran: Rp ${totalKeluar.toLocaleString('id-ID')}\nLaba bersih: Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}`

  } else if (pertanyaan.includes('risiko') || pertanyaan.includes('perhatian') || pertanyaan.includes('bahaya')) {
    const risiko = pasienUmur.filter(p => p.umur >= 35)
    reply = risiko.length
      ? `Pasien usia risiko (≥35 thn):\n` + risiko.map(p => `- ${p.nama} (${p.umur} thn)`).join('\n')
      : 'Tidak ada pasien dengan usia risiko saat ini.'

  } else if (pertanyaan.includes('jadwal') || pertanyaan.includes('besok') || pertanyaan.includes('minggu')) {
    reply = jadwalMendatang.length
      ? `Jadwal mendatang:\n` + jadwalMendatang.slice(0, 5)
          .map(j => `- ${j.nama_pasien} | ${j.layanan} | ${new Date(j.tanggal).toLocaleDateString('id-ID')}`)
          .join('\n')
      : 'Tidak ada jadwal mendatang.'

  } else if (pertanyaan.includes('total pasien') || pertanyaan.includes('berapa pasien') || pertanyaan.includes('jumlah pasien')) {
    reply = `Total pasien terdaftar: ${pasien?.length ?? 0} orang\n- Perempuan: ${pasienUmur.filter(p => p.jenis_kelamin === 'Perempuan').length}\n- Laki-laki: ${pasienUmur.filter(p => p.jenis_kelamin === 'Laki-laki').length}`

  } else {
    reply = `Saya bisa menjawab pertanyaan tentang:\n• Pasien yang sering berkunjung\n• Total pendapatan & keuangan\n• Pasien usia risiko\n• Jadwal mendatang\n• Jumlah pasien`
  }

  return NextResponse.json({ reply })
}