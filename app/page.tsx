import Link from "next/link"
import { Heart, Users, Calendar, FileText, Shield, Clock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 grid place-items-center shadow-lg shadow-primary/30">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground leading-none">KlinikSehat</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Manajemen Klinik Bidan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Masuk
            </Link>
            <Link 
              href="/register"
              className="text-sm font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-medium mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Sistem Manajemen Klinik Modern
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
              Kelola Klinik Bidan dengan{" "}
              <span className="text-primary">Lebih Mudah</span>
            </h1>
            <p className="text-lg text-muted-foreground mt-6 leading-relaxed">
              Solusi digital lengkap untuk manajemen pasien, rekam medis, jadwal praktik, 
              dan laporan keuangan klinik bidan Anda.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <Link 
                href="/register"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
              >
                Mulai Sekarang
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17 17 7M7 7h10v10"/>
                </svg>
              </Link>
              <Link 
                href="/login"
                className="inline-flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
              Fitur Lengkap untuk Klinik Anda
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola klinik bidan secara efisien
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Manajemen Pasien",
                description: "Kelola data pasien dengan mudah, termasuk riwayat kunjungan dan informasi kontak"
              },
              {
                icon: FileText,
                title: "Rekam Medis Digital",
                description: "Catat dan akses rekam medis pasien kapan saja dengan aman dan terorganisir"
              },
              {
                icon: Calendar,
                title: "Jadwal Praktik",
                description: "Atur jadwal praktik dan kelola antrean pasien dengan sistem yang efisien"
              },
              {
                icon: Shield,
                title: "Keamanan Data",
                description: "Data pasien tersimpan aman dengan enkripsi dan backup otomatis"
              },
              {
                icon: Clock,
                title: "Antrean Real-time",
                description: "Pantau antrean pasien secara real-time untuk pelayanan yang lebih baik"
              },
              {
                icon: Heart,
                title: "Laporan Lengkap",
                description: "Dapatkan laporan kunjungan dan keuangan untuk analisis bisnis"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-background border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all"
              >
                <div className="h-12 w-12 rounded-xl bg-accent text-primary grid place-items-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
                Siap Meningkatkan Efisiensi Klinik Anda?
              </h2>
              <p className="text-primary-foreground/85 mb-8 max-w-xl mx-auto">
                Bergabung dengan ratusan klinik bidan yang sudah menggunakan KlinikSehat untuk mengelola operasional mereka.
              </p>
              <Link 
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors shadow-lg"
              >
                Daftar Gratis Sekarang
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17 17 7M7 7h10v10"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 grid place-items-center">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-foreground">KlinikSehat</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 KlinikSehat. Hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}