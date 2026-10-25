'use client'

import { useEffect, useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Package, Tag, Box, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

// 1. Komponen isi dipisahkan
function EditItemContent() {
  const router = useRouter()
  const params = useParams()
  const itemId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('Baik')

  useEffect(() => {
    const fetchItem = async () => {
      const { data } = await supabase.from('inventory').select('*').eq('id', itemId).single()
      if (data) {
        setName(data.item_name)
        setCategory(data.category)
        setQuantity(data.quantity.toString())
        setPrice(data.price.toLocaleString('id-ID'))
        setCondition(data.condition)
      }
      setLoading(false)
    }
    fetchItem()
  }, [itemId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const numericPrice = parseFloat(price.replace(/\./g, ''))

    const { error } = await supabase.from('inventory').update({
      item_name: name,
      category,
      quantity: parseInt(quantity),
      price: numericPrice,
      condition
    }).eq('id', itemId)

    if (!error) {
      router.push('/dashboard')
    } else {
      alert('Gagal update: ' + error.message)
      setSaving(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) value = parseInt(value).toLocaleString('id-ID')
    setPrice(value)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-teal-600 font-bold animate-pulse">Memuat data barang...</div>

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8 flex flex-col items-center">
      
      <div className="w-full max-w-2xl mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 md:p-8 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Package size={24} className="text-white" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Edit Barang</h1>
            <p className="text-teal-100 text-sm mt-1">Perbarui informasi barang inventaris Anda.</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Barang <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Box size={18} className="text-gray-400" /></div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag size={18} className="text-gray-400" /></div>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 bg-white">
                    <option value="Elektronik">Elektronik</option>
                    <option value="Pakaian">Pakaian</option>
                    <option value="Perabot">Perabot</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><CheckCircle2 size={18} className="text-gray-400" /></div>
                  <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800 bg-white">
                    <option value="Baik">Baik</option>
                    <option value="Rusak">Rusak</option>
                    <option value="Diservis">Sedang Diservis</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-400 font-bold">#</span></div>
                  <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Satuan (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold text-sm">Rp</span></div>
                  <input type="text" required value={price} onChange={handlePriceChange} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-gray-800" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/30 disabled:opacity-50">
                <Save size={20} /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// 2. Fungsi utama yang membungkus dengan Suspense
export default function EditItemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FA] p-8 text-center text-gray-500">Memuat form edit...</div>}>
      <EditItemContent />
    </Suspense>
  )
}