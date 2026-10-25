'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Tag, Box, CheckCircle2, UploadCloud, X } from 'lucide-react'
import Link from 'next/link'

export default function AddItemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Elektronik')
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('Baik')
  
  // State untuk Foto
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile)) // Membuat preview gambar
    }
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Sesi login habis, silakan login ulang.')
      router.push('/')
      return
    }

    let imageUrl = ''

    // Proses Upload Foto (Jika ada)
    if (file) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('inventory-images')
        .upload(fileName, file)

      if (uploadError) {
        alert('Gagal upload foto: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('inventory-images').getPublicUrl(fileName)
      imageUrl = publicUrl
    }

    const numericPrice = parseFloat(price.replace(/\./g, ''))

    const { error } = await supabase.from('inventory').insert({
      user_id: user.id,
      item_name: name,
      category,
      quantity: parseInt(quantity),
      price: numericPrice,
      condition,
      image_url: imageUrl // Simpan link foto ke database
    })

    if (!error) {
      router.push('/dashboard')
    } else {
      alert('Gagal menyimpan: ' + error.message)
      setLoading(false)
    }
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) value = parseInt(value).toLocaleString('id-ID')
    setPrice(value)
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] p-4 md:p-8 flex flex-col items-center">
      
      <div className="w-full max-w-2xl mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-teal-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all hover:shadow-md group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        
        <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6 md:p-8 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Tambah Barang Baru</h1>
            <p className="text-teal-100 text-sm mt-1">Catat aset baru ke dalam sistem inventaris Anda.</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Barang <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Box size={18} className="text-gray-400" /></div>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Laptop Asus ROG" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag size={18} className="text-gray-400" /></div>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 bg-white appearance-none transition-all">
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
                  <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 bg-white appearance-none transition-all">
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
                  <input type="number" required min="1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Satuan (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><span className="text-gray-500 font-bold text-sm">Rp</span></div>
                  <input type="text" required value={price} onChange={handlePriceChange} placeholder="1.500.000" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 transition-all" />
                </div>
              </div>
            </div>

            {/* FITUR UPLOAD FOTO OPSIONAL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Dokumentasi (Opsional)</label>
              
              {!preview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud size={32} className="text-teal-500 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Klik untuk memilih foto</p>
                  <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG (Maks. 2MB)</p>
                </div>
              ) : (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeFile} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-teal-600/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
                <Save size={20} /> {loading ? 'Menyimpan Data...' : 'Simpan Barang'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}