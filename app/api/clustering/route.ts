import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Skor keparahan berdasarkan layanan
function skorLayanan(layanan: string): number {
  const l = layanan.toLowerCase()
  if (l.includes('usg'))                                          return 3
  if (l.includes('kehamilan') || l.includes('nifas'))            return 2
  if (l.includes('imunisasi') || l.includes('kb'))               return 1
  return 1 // default ringan
}

// K-Means sederhana
function kMeans(data: number[][], k: number, iter = 100) {
  // Inisialisasi centroid dari data pertama
  let centroids = [data[0], data[Math.floor(data.length / 3)], data[Math.floor(data.length * 2 / 3)]]

  let labels: number[] = []

  for (let i = 0; i < iter; i++) {
    // Assign tiap pasien ke centroid terdekat
    labels = data.map(point => {
      const dists = centroids.map(c =>
        Math.sqrt(c.reduce((s, v, j) => s + Math.pow(v - point[j], 2), 0))
      )
      return dists.indexOf(Math.min(...dists))
    })

    // Update centroid
    centroids = centroids.map((_, ci) => {
      const members = data.filter((_, i) => labels[i] === ci)
      if (members.length === 0) return centroids[ci]
      return data[0].map((_, j) => members.reduce((s, m) => s + m[j], 0) / members.length)
    })
  }

  return labels
}

export async function GET() {
  // Fetch semua data yang dibutuhkan
  const [{ data: pasien }, { data: rekam_medis }] = await Promise.all([
    supabase.from('pasien').select('*'),
    supabase.from('rekam_medis').select('*'),
  ])

  if (!pasien || !rekam_medis) {
    return NextResponse.json({ error: 'Gagal fetch data' }, { status: 500 })
  }

  const today = new Date()

  // Hitung fitur tiap pasien
  const fiturPasien = pasien.map(p => {
    const rekamPasien = rekam_medis.filter(r => r.nama_pasien === p.nama)

    // Umur
    const umur = Math.floor(
      (today.getTime() - new Date(p.tanggal_lahir).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    )

    // Jumlah kunjungan
    const jmlKunjungan = rekamPasien.length

    // Variasi layanan (berapa jenis layanan berbeda)
    const layananSet = new Set(rekamPasien.map(r => {
      const cat = r.catatan ?? r.diagnosis ?? ''
      const match = cat.match(/Layanan: (.+)\./)
      return match ? match[1] : 'Lainnya'
    }))
    const variasiLayanan = layananSet.size

    // Skor keparahan (ambil skor tertinggi dari semua layanan pasien)
    const skorKeparahan = rekamPasien.length > 0
      ? Math.max(...rekamPasien.map(r => {
          const layanan = r.catatan ?? r.diagnosis ?? ''
          return skorLayanan(layanan)
        }))
      : 1

    // Frekuensi layanan berat (USG / periksa kehamilan)
    const layananBerat = rekamPasien.filter(r =>
      skorLayanan(r.catatan ?? r.diagnosis ?? '') >= 2
    ).length

    return {
      nama: p.nama,
      umur,
      jmlKunjungan,
      variasiLayanan,
      skorKeparahan,
      layananBerat,
      fitur: [skorKeparahan, jmlKunjungan, variasiLayanan, layananBerat, umur / 10],
    }
  })

  // Jalankan K-Means (k=3)
  const fiturMatrix = fiturPasien.map(p => p.fitur)
  const labels = kMeans(fiturMatrix, 3)

  // Map label ke nama cluster berdasarkan rata-rata skor keparahan
  const clusterSkor = [0, 1, 2].map(ci => {
    const members = fiturPasien.filter((_, i) => labels[i] === ci)
    return members.length > 0
      ? members.reduce((s, m) => s + m.skorKeparahan, 0) / members.length
      : 0
  })

  // Sort: cluster dengan skor terendah = Risiko Rendah, dst
  const sorted = [...clusterSkor.entries()].sort((a, b) => a[1] - b[1])
  const clusterNama: Record<number, string> = {
    [sorted[0][0]]: 'Risiko Rendah',
    [sorted[1][0]]: 'Risiko Sedang',
    [sorted[2][0]]: 'Risiko Tinggi',
  }
  const clusterWarna: Record<string, string> = {
    'Risiko Rendah': '#22c55e',
    'Risiko Sedang': '#f59e0b',
    'Risiko Tinggi': '#ef4444',
  }

  // Susun hasil per pasien
  const hasil = fiturPasien.map((p, i) => ({
    nama: p.nama,
    umur: p.umur,
    jmlKunjungan: p.jmlKunjungan,
    skorKeparahan: p.skorKeparahan,
    cluster: clusterNama[labels[i]],
  }))

  // Statistik per cluster
  const clusterStats = ['Risiko Rendah', 'Risiko Sedang', 'Risiko Tinggi'].map(nama => {
    const members = hasil.filter(p => p.cluster === nama)
    return {
      nama,
      warna: clusterWarna[nama],
      jumlah: members.length,
      pasien: members.map(m => m.nama),
      rataUmur: members.length ? +(members.reduce((s, m) => s + m.umur, 0) / members.length).toFixed(1) : 0,
      rataKunjungan: members.length ? +(members.reduce((s, m) => s + m.jmlKunjungan, 0) / members.length).toFixed(1) : 0,
      rataSkor: members.length ? +(members.reduce((s, m) => s + m.skorKeparahan, 0) / members.length).toFixed(2) : 0,
    }
  })

  return NextResponse.json({ hasil, clusterStats })
}