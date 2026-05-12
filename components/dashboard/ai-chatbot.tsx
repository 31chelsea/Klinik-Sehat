"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

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

// Simple markdown-like formatting
function formatMessage(text: string) {
  return text
    .split('\n')
    .map((line, i) => {
      // Bold text
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedLine }} />
    })
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate a small delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get fallback response (client-side, no API call needed)
    const responseText = getFallbackResponse(userMessage.content)
    
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: responseText
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 grid place-items-center hover:scale-105 transition-transform z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 grid place-items-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Asisten KlinikSehat</p>
                <p className="text-xs text-primary-foreground/80">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-white/20 grid place-items-center transition"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-white/20 grid place-items-center transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center mx-auto mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Halo! Saya Asisten KlinikSehat</h3>
                <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                  Saya siap membantu Anda dengan pertanyaan seputar manajemen klinik, jadwal, pasien, dan lainnya.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Bagaimana cara menambah pasien baru?",
                    "Tampilkan ringkasan keuangan",
                    "Tips pemeriksaan kehamilan",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-3 py-2 text-sm bg-muted/50 rounded-lg hover:bg-muted transition text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-full shrink-0 grid place-items-center ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {message.role === "user" ? (
                    <span>{message.content}</span>
                  ) : (
                    <div className="space-y-1">{formatMessage(message.content)}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full shrink-0 grid place-items-center bg-muted text-muted-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                disabled={isLoading}
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
