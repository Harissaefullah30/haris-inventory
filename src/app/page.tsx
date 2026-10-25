'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogIn, ShieldCheck, Box } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(`Gagal masuk: ${error.message}`)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* KIRI: Bagian Branding (Sembunyi di HP) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Ornamen Latar */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 opacity-10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-white text-teal-800 rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto mb-8 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
            HS
          </div>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">HarisInventory</h1>
          <p className="text-teal-100 text-lg max-w-md mx-auto mb-8">
            Sistem manajemen aset pribadi yang aman, rapi, dan terintegrasi dalam ekosistem HarisHub.
          </p>
          
          <div className="flex gap-4 justify-center text-sm font-medium">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <ShieldCheck size={16} /> Keamanan Data
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
              <Box size={16} /> Manajemen Aset
            </div>
          </div>
        </div>
      </div>

      {/* KANAN: Form Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6 relative">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md relative z-10">
          
          {/* Logo Khusus HP */}
          <div className="lg:hidden flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              HS
            </div>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Selamat Datang</h2>
            <p className="text-gray-500 text-sm">Silakan masuk untuk mengelola inventaris Anda.</p>
          </div>

          {message && (
            <div className="p-3 mb-6 rounded-xl text-sm text-center bg-red-50 text-red-600 border border-red-100 font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@harishub.com"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-teal-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn size={20} /> {loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              © 2026 HarisInventory. Bagian dari Ekosistem <span className="text-teal-600 font-bold">HarisHub</span>.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}