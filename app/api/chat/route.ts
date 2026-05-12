import { convertToModelMessages, streamText, UIMessage } from 'ai'

export const maxDuration = 30

// Fallback responses untuk berbagai topik
const fallbackResponses: Record<string, string> = {
  pasien: `Untuk menambah pasien baru, ikuti langkah berikut:

1. Buka menu **Data Pasien** di sidebar
2. Klik tombol **+ Tambah Pasien** di pojok kanan atas
3. Isi formulir dengan data pasien (nama, tanggal lahir, alamat, dll)
4. Klik **Simpan** untuk menyimpan data pasien baru

Anda juga bisa mencari pasien yang sudah terdaftar menggunakan kolom pencarian.`,
  
  jadwal: `Untuk mengelola jadwal praktik:

1. Buka menu **Jadwal Praktik** di sidebar
2. Anda bisa melihat jadwal dalam tampilan kalender
3. Klik pada tanggal untuk menambah jadwal baru
4. Pilih pasien dan jenis layanan
5. Tentukan waktu kunjungan

Jadwal yang sudah dibuat akan muncul di kalender dan dashboard utama.`,

  keuangan: `Untuk melihat ringkasan keuangan:

1. Buka menu **Keuangan** di sidebar
2. Anda akan melihat ringkasan pendapatan, pengeluaran, dan saldo
3. Tab **Transaksi** menampilkan riwayat semua transaksi
4. Tab **Harga Layanan** untuk mengatur tarif layanan

Laporan keuangan bulanan bisa dilihat di menu **Laporan**.`,

  kehamilan: `Tips pemeriksaan kehamilan rutin:

**Trimester 1 (0-12 minggu):** Periksa minimal 1x untuk konfirmasi kehamilan dan USG awal

**Trimester 2 (13-27 minggu):** Periksa minimal 1x untuk USG anatomi dan skrining

**Trimester 3 (28-40 minggu):** Periksa 2x atau lebih, lebih sering menjelang persalinan

Pemeriksaan meliputi: tekanan darah, berat badan, tinggi fundus, detak jantung janin, dan posisi bayi.`,

  rekam: `Untuk mengelola rekam medis:

1. Buka menu **Rekam Medis** di sidebar
2. Cari pasien menggunakan kolom pencarian
3. Klik pada kartu pasien untuk melihat detail rekam medis
4. Anda bisa menambah catatan baru dengan klik **+ Tambah Rekam Medis**

Rekam medis mencakup riwayat pemeriksaan, diagnosis, dan tindakan yang dilakukan.`,

  laporan: `Untuk melihat laporan:

1. Buka menu **Laporan** di sidebar
2. Pilih periode laporan (harian, mingguan, bulanan)
3. Anda bisa melihat statistik kunjungan, pendapatan, dan layanan populer
4. Klik **Unduh** untuk mengekspor laporan ke PDF atau Excel

Laporan membantu Anda memantau performa klinik secara keseluruhan.`,

  default: `Halo! Saya adalah Asisten KlinikSehat yang siap membantu Anda.

Saya bisa membantu dengan:
• **Data Pasien** - Cara menambah, mencari, dan mengelola data pasien
• **Jadwal Praktik** - Mengatur jadwal kunjungan dan pengingat
• **Rekam Medis** - Mengelola catatan kesehatan pasien
• **Keuangan** - Melihat laporan dan mengelola transaksi
• **Tips Kesehatan** - Informasi seputar kesehatan ibu dan anak

Silakan tanyakan apa yang Anda butuhkan!`
}

function getFallbackResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes("pasien") || lowerMessage.includes("tambah") || lowerMessage.includes("daftar")) {
    return fallbackResponses.pasien
  }
  if (lowerMessage.includes("jadwal") || lowerMessage.includes("praktik") || lowerMessage.includes("kunjungan")) {
    return fallbackResponses.jadwal
  }
  if (lowerMessage.includes("keuangan") || lowerMessage.includes("uang") || lowerMessage.includes("transaksi") || lowerMessage.includes("pendapatan")) {
    return fallbackResponses.keuangan
  }
  if (lowerMessage.includes("hamil") || lowerMessage.includes("kehamilan") || lowerMessage.includes("ibu") || lowerMessage.includes("bayi") || lowerMessage.includes("kandungan")) {
    return fallbackResponses.kehamilan
  }
  if (lowerMessage.includes("rekam") || lowerMessage.includes("medis") || lowerMessage.includes("riwayat")) {
    return fallbackResponses.rekam
  }
  if (lowerMessage.includes("laporan") || lowerMessage.includes("statistik") || lowerMessage.includes("report")) {
    return fallbackResponses.laporan
  }
  
  return fallbackResponses.default
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()
  
  // Get the last user message text
  const lastUserMessage = messages
    .filter(m => m.role === 'user')
    .pop()
  
  const userText = lastUserMessage?.parts
    ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map(p => p.text)
    .join('') || ''

  try {
    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: `Kamu adalah asisten AI untuk KlinikSehat, sebuah sistem manajemen klinik bidan.
Kamu membantu bidan dan staf klinik dengan:
- Informasi tentang pasien dan rekam medis
- Penjadwalan kunjungan dan praktik
- Laporan keuangan dan transaksi
- Tips kesehatan ibu dan anak
- Prosedur administrasi klinik

Jawab dengan bahasa Indonesia yang ramah dan profesional. Berikan jawaban yang singkat, jelas, dan bermanfaat.
Jika ditanya tentang data spesifik pasien, ingatkan bahwa kamu tidak memiliki akses ke data riil dan sarankan untuk melihat menu terkait di dashboard.`,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch {
    // Fallback response jika AI Gateway error
    const fallbackText = getFallbackResponse(userText)
    
    // Create a proper SSE stream response compatible with useChat
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Format: data chunks that useChat can parse
        const messageId = `msg-${Date.now()}`
        
        // Send start event
        controller.enqueue(encoder.encode(`data: {"type":"message-start","id":"${messageId}"}\n\n`))
        
        // Send text delta
        controller.enqueue(encoder.encode(`data: {"type":"text-delta","delta":"${fallbackText.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"}\n\n`))
        
        // Send finish event
        controller.enqueue(encoder.encode(`data: {"type":"message-end"}\n\n`))
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        
        controller.close()
      }
    })
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  }
}
