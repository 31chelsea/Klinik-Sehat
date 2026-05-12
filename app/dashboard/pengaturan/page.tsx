"use client"

import { useState, useEffect, useCallback } from "react"
import { useTheme } from "next-themes"
import { User, Building2, Bell, Shield, Palette, Save, Camera, Sun, Moon, Check } from "lucide-react"

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "clinic", label: "Klinik", icon: Building2 },
  { id: "notifications", label: "Notifikasi", icon: Bell },
  { id: "security", label: "Keamanan", icon: Shield },
  { id: "appearance", label: "Tampilan", icon: Palette },
]

const colorThemes = [
  { id: "teal", name: "Teal", color: "bg-teal-500", primary: "oklch(0.696 0.17 162.48)" },
  { id: "emerald", name: "Emerald", color: "bg-emerald-500", primary: "oklch(0.696 0.17 155)" },
  { id: "blue", name: "Blue", color: "bg-blue-500", primary: "oklch(0.623 0.214 259)" },
  { id: "rose", name: "Rose", color: "bg-rose-500", primary: "oklch(0.645 0.246 16)" },
  { id: "amber", name: "Amber", color: "bg-amber-500", primary: "oklch(0.769 0.188 70)" },
]

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const [selectedColor, setSelectedColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("color-theme") || "teal"
    }
    return "teal"
  })
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    schedule: true,
    daily: false,
    payment: true,
  })

  const applyColorTheme = useCallback((colorId: string) => {
    const colorTheme = colorThemes.find(c => c.id === colorId)
    if (colorTheme) {
      document.documentElement.style.setProperty("--primary", colorTheme.primary)
      document.documentElement.style.setProperty("--ring", colorTheme.primary)
      localStorage.setItem("color-theme", colorId)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    // Apply saved color theme on mount
    const savedColor = localStorage.getItem("color-theme") || "teal"
    setSelectedColor(savedColor)
    applyColorTheme(savedColor)
  }, [applyColorTheme])

  const handleColorChange = (colorId: string) => {
    setSelectedColor(colorId)
    applyColorTheme(colorId)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted-foreground mt-1">Kelola pengaturan akun dan klinik</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="bg-card rounded-2xl border border-border p-3 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Profil Pengguna</h2>
                <p className="text-sm text-muted-foreground">Informasi pribadi dan akun Anda</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary grid place-items-center text-primary-foreground text-2xl font-bold">
                    BS
                  </div>
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-card border border-border grid place-items-center hover:bg-muted transition">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Bidan Sari Wijayanti</p>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nama Lengkap</label>
                  <input 
                    defaultValue="Bidan Sari Wijayanti"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input 
                    defaultValue="sari@kliniksehat.com"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">No. Telepon</label>
                  <input 
                    defaultValue="081234567890"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">No. STR</label>
                  <input 
                    defaultValue="STR-BD-123456789"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "clinic" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Informasi Klinik</h2>
                <p className="text-sm text-muted-foreground">Detail dan informasi klinik Anda</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Nama Klinik</label>
                  <input 
                    defaultValue="KlinikSehat"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Alamat</label>
                  <textarea 
                    defaultValue="Jl. Kesehatan No. 123, Kelurahan Sehat, Kecamatan Bahagia"
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none bg-background text-foreground"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">No. Telepon Klinik</label>
                    <input 
                      defaultValue="021-12345678"
                      className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">No. Izin Praktik</label>
                    <input 
                      defaultValue="SIP-123/2026"
                      className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Pengaturan Notifikasi</h2>
                <p className="text-sm text-muted-foreground">Kelola notifikasi yang Anda terima</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: "email", label: "Notifikasi Email", desc: "Terima pemberitahuan via email" },
                  { key: "sms", label: "Notifikasi SMS", desc: "Terima pemberitahuan via SMS" },
                  { key: "schedule", label: "Pengingat Jadwal", desc: "Ingatkan saya sebelum jadwal pasien" },
                  { key: "daily", label: "Laporan Harian", desc: "Kirim ringkasan aktivitas harian" },
                  { key: "payment", label: "Notifikasi Pembayaran", desc: "Pemberitahuan transaksi keuangan" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <button 
                      onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        notifications[item.key as keyof typeof notifications] ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span 
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          notifications[item.key as keyof typeof notifications] ? "right-0.5" : "left-0.5"
                        }`} 
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Keamanan Akun</h2>
                <p className="text-sm text-muted-foreground">Kelola password dan keamanan akun</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password Saat Ini</label>
                  <input 
                    type="password"
                    placeholder="Masukkan password saat ini"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password Baru</label>
                  <input 
                    type="password"
                    placeholder="Masukkan password baru"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Konfirmasi Password Baru</label>
                  <input 
                    type="password"
                    placeholder="Konfirmasi password baru"
                    className="w-full border border-border rounded-xl px-4 h-11 text-sm outline-none focus:ring-2 focus:ring-primary/30 bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-foreground mb-3">Autentikasi Dua Faktor</h3>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">2FA via SMS</p>
                    <p className="text-sm text-muted-foreground">Amankan akun dengan verifikasi SMS</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
                    Aktifkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Tampilan</h2>
                <p className="text-sm text-muted-foreground">Sesuaikan tampilan aplikasi</p>
              </div>

              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Mode Tampilan</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTheme("light")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        theme === "light" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme === "light" && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary grid place-items-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="h-20 w-full bg-white rounded-lg border border-gray-200 mb-3 flex items-center justify-center">
                        <Sun className="h-8 w-8 text-amber-500" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Light Mode</span>
                      <p className="text-xs text-muted-foreground mt-1">Tampilan terang untuk siang hari</p>
                    </button>
                    <button 
                      onClick={() => setTheme("dark")}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        theme === "dark" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {theme === "dark" && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary grid place-items-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="h-20 w-full bg-gray-900 rounded-lg border border-gray-700 mb-3 flex items-center justify-center">
                        <Moon className="h-8 w-8 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Dark Mode</span>
                      <p className="text-xs text-muted-foreground mt-1">Tampilan gelap untuk malam hari</p>
                    </button>
                  </div>
                </div>

                {/* Color Theme */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Tema Warna</label>
                  <div className="flex flex-wrap gap-3">
                    {colorThemes.map((colorTheme) => (
                      <button 
                        key={colorTheme.id}
                        onClick={() => handleColorChange(colorTheme.id)}
                        className={`relative h-12 w-12 rounded-xl transition-all ${colorTheme.color} ${
                          selectedColor === colorTheme.id 
                            ? "ring-2 ring-offset-2 ring-offset-card ring-foreground scale-110" 
                            : "hover:scale-105"
                        }`}
                        title={colorTheme.name}
                      >
                        {selectedColor === colorTheme.id && (
                          <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Warna tema saat ini: <span className="font-medium capitalize">{selectedColor}</span>
                  </p>
                </div>

                {/* System Preference */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Ikuti Sistem</p>
                      <p className="text-sm text-muted-foreground">Otomatis menyesuaikan dengan pengaturan perangkat</p>
                    </div>
                    <button 
                      onClick={() => setTheme("system")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        theme === "system"
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      {theme === "system" ? "Aktif" : "Aktifkan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
            {saved && (
              <span className="text-sm text-emerald-600 font-medium">Perubahan tersimpan!</span>
            )}
            <button 
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
