// Skor layanan untuk tingkat keparahan
const SKOR_LAYANAN: Record<string, number> = {
  'Konsultasi KB': 1,
  'Kontrol Nifas': 1,
  'Imunisasi Bayi': 2,
  'Pemeriksaan Kehamilan': 2,
  'USG': 3,
}

const skorKunjungan = (n: number) => n <= 2 ? 1 : n <= 4 ? 2 : 3
const skorVariasi = (n: number) => n === 1 ? 1 : n <= 3 ? 2 : 3
const skorUsg = (n: number) => n === 0 ? 1 : n === 1 ? 2 : 3
const skorUmur = (n: number) => n < 20 ? 1 : n <= 35 ? 2 : 3

// Centroid hasil training K-Means (dari Colab, jangan diubah kecuali retraining)
const CENTROIDS = {
  'Risiko Rendah':  { keparahan: 2.08, kunjungan: 2.29, variasi: 1.73, usg: 0.61, umur: 26.45 },
  'Risiko Sedang':  { keparahan: 2.56, kunjungan: 2.54, variasi: 2.15, usg: 0.99, umur: 43.98 },
  'Risiko Tinggi':  { keparahan: 2.97, kunjungan: 3.88, variasi: 2.99, usg: 1.72, umur: 34.68 },
}

// Min-max range dari data training (untuk normalisasi yang konsisten)
const RANGE = {
  keparahan: { min: 1, max: 3 },
  kunjungan: { min: 1, max: 3 },
  variasi: { min: 1, max: 3 },
  usg: { min: 1, max: 3 },
  umur: { min: 1, max: 3 },
}

export type PasienFeatures = {
  nama_pasien: string
  tingkat_keparahan: number
  jumlah_kunjungan: number
  variasi_layanan: number
  frekuensi_usg: number
  umur: number
}

export function hitungFeaturesPasien(
  namaPasien: string,
  jadwalPasien: { layanan: string }[],
  umurAsli: number
): PasienFeatures {
  if (jadwalPasien.length === 0) {
    return {
      nama_pasien: namaPasien,
      tingkat_keparahan: 1,
      jumlah_kunjungan: 1,
      variasi_layanan: 1,
      frekuensi_usg: 1,
      umur: skorUmur(umurAsli),
    }
  }

  // Tingkat keparahan = skor maksimum dari semua layanan yang diambil
  const skorList = jadwalPasien.map(j => SKOR_LAYANAN[j.layanan?.trim()] ?? 1)
  const tingkat_keparahan = Math.max(...skorList)

  // Jumlah kunjungan
  const jumlah_kunjungan = skorKunjungan(jadwalPasien.length)

  // Variasi layanan (jumlah jenis unik)
  const jenisUnik = new Set(jadwalPasien.map(j => j.layanan)).size
  const variasi_layanan = skorVariasi(jenisUnik)

  // Frekuensi USG
  const jumlahUsg = jadwalPasien.filter(j => j.layanan?.trim().toUpperCase() === 'USG').length
  const frekuensi_usg = skorUsg(jumlahUsg)

  return {
    nama_pasien: namaPasien,
    tingkat_keparahan,
    jumlah_kunjungan,
    variasi_layanan,
    frekuensi_usg,
    umur: skorUmur(umurAsli),
  }
}

function normalisasi(value: number, key: keyof typeof RANGE): number {
  const { min, max } = RANGE[key]
  return (value - min) / (max - min)
}

function jarakEuclidean(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0))
}

export function prediksiCluster(features: PasienFeatures): string {
  const pointScaled = [
    normalisasi(features.tingkat_keparahan, 'keparahan'),
    normalisasi(features.jumlah_kunjungan, 'kunjungan'),
    normalisasi(features.variasi_layanan, 'variasi'),
    normalisasi(features.frekuensi_usg, 'usg'),
    normalisasi(features.umur, 'umur'),
  ]

  let closestCluster = 'Risiko Rendah'
  let minDist = Infinity

  for (const [kategori, centroid] of Object.entries(CENTROIDS)) {
    const centroidScaled = [
      normalisasi(centroid.keparahan, 'keparahan'),
      normalisasi(centroid.kunjungan, 'kunjungan'),
      normalisasi(centroid.variasi, 'variasi'),
      normalisasi(centroid.usg, 'usg'),
      normalisasi(centroid.umur, 'umur'),
    ]
    const dist = jarakEuclidean(pointScaled, centroidScaled)
    if (dist < minDist) {
      minDist = dist
      closestCluster = kategori
    }
  }

  return closestCluster
}

export { CENTROIDS }