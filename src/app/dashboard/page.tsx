'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Package, Search, Trash2, Box, TrendingUp, Printer, Pencil, Wrench, Filter, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

type Item = {
  id: string
  item_name: string
  category: string
  quantity: number
  price: number
  condition: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [maintenanceCount, setMaintenanceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // State untuk Pencarian, Filter, dan Sorting
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('Semua')
  const [sortBy, setSortBy] = useState('Terbaru')

  const fetchItemsAndMaintenance = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setItems(data)

    const { count } = await supabase
      .from('maintenance_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'Dalam Perbaikan')

    setMaintenanceCount(count || 0)
    setLoading(false)
  }

  useEffect(() => {
    fetchItemsAndMaintenance()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus barang ini?')) return
    await supabase.from('inventory').delete().eq('id', id)
    fetchItemsAndMaintenance()
  }

  // --- LOGIKA FILTER, PENCARIAN, DAN SORTING ---
  let processedItems = items.filter(item => {
    const matchSearch = item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = filterCategory === 'Semua' || item.category === filterCategory
    return matchSearch && matchCategory
  })

  // Logika Sorting
  if (sortBy === 'Harga Termahal') {
    processedItems.sort((a, b) => b.price - a.price)
  } else if (sortBy === 'Harga Termurah') {
    processedItems.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'Nama A-Z') {
    processedItems.sort((a, b) => a.item_name.localeCompare(b.item_name))
  }

  const totalAset = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-gradient-to-r from-teal-700 to-teal-900 text-white shadow-lg sticky top-0 z-20 print:hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white text-teal-800 w-9 h-9 rounded-xl font-bold flex items-center justify-center shadow-md">HS</div>
            <span className="font-bold text-xl tracking-wide">HarisInventory</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-all backdrop-blur-sm">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8">
        
        <div className="mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Ringkasan Inventaris</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau seluruh aset dan barang berhargamu di sini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group print:border-gray-300 print:shadow-none">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl flex items-center justify-center shadow-lg print:hidden"><Box size={28} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Barang</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{items.length} <span className="text-sm font-medium text-gray-400">Item</span></h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group print:border-gray-300 print:shadow-none">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl flex items-center justify-center shadow-lg print:hidden"><TrendingUp size={28} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Nilai Aset</p>
              <h3 className="text-3xl font-extrabold text-gray-800">Rp {totalAset.toLocaleString('id-ID')}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 relative overflow-hidden group print:border-gray-300 print:shadow-none">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg print:hidden"><Wrench size={28} /></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Barang Diservis</p>
              <h3 className="text-3xl font-extrabold text-gray-800">{maintenanceCount} <span className="text-sm font-medium text-gray-400">Item</span></h3>
            </div>
          </div>
        </div>

        {/* Bar Pencarian & Tombol Aksi */}
        <div className="flex flex-col md:flex-row gap-4 mb-4 print:hidden">
          <div className="flex-1 bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Search size={20} className="text-gray-400 ml-2" />
            <input type="text" placeholder="Cari nama barang atau kategori..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm text-gray-700 py-2" />
          </div>
          
          <div className="flex gap-2">
            <Link href="/maintenance" className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
              <Wrench size={20} /> Perbaikan
            </Link>
            <button onClick={() => window.print()} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
              <Printer size={20} /> Cetak
            </button>
            <Link href="/dashboard/add" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/30">
              <Plus size={20} /> Tambah
            </Link>
          </div>
        </div>

        {/* BARU: Bar Filter & Sorting */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Filter:</span>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-teal-700 cursor-pointer">
              <option value="Semua">Semua Kategori</option>
              <option value="Elektronik">Elektronik</option>
              <option value="Pakaian">Pakaian</option>
              <option value="Perabot">Perabot</option>
              <option value="Kendaraan">Kendaraan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <ArrowUpDown size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Urutkan:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold text-teal-700 cursor-pointer">
              <option value="Terbaru">Terbaru</option>
              <option value="Nama A-Z">Nama (A-Z)</option>
              <option value="Harga Termahal">Harga (Termahal)</option>
              <option value="Harga Termurah">Harga (Termurah)</option>
            </select>
          </div>
        </div>

        {/* Tabel Daftar Barang */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:shadow-none print:border-gray-300">
          {loading ? (
            <div className="p-12 text-center text-teal-600 font-medium animate-pulse">Memuat data...</div>
          ) : processedItems.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4 print:hidden"><Package size={48} className="text-gray-300" /></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak ada barang ditemukan</h3>
              <p className="text-gray-500 text-sm">Coba ubah kata kunci atau filter kategori.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200 print:bg-gray-100 print:text-black">
                    <th className="px-6 py-5 font-bold">Nama Barang</th>
                    <th className="px-6 py-5 font-bold">Kategori</th>
                    <th className="px-6 py-5 font-bold text-center">Jumlah</th>
                    <th className="px-6 py-5 font-bold text-right">Harga Satuan</th>
                    <th className="px-6 py-5 font-bold text-center">Kondisi</th>
                    <th className="px-6 py-5 font-bold text-center print:hidden">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedItems.map(item => (
                    <tr key={item.id} className="hover:bg-teal-50/30 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-800 text-sm print:text-black">{item.item_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-medium print:bg-transparent print:p-0">{item.category}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-bold text-gray-700 print:text-black">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right text-gray-600 font-medium print:text-black">Rp {item.price.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${item.condition === 'Baik' ? 'bg-green-100 text-green-700' : item.condition === 'Rusak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.condition}</span>
                      </td>
                      <td className="px-6 py-4 text-center print:hidden">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/dashboard/edit/${item.id}`} className="text-gray-400 hover:text-teal-600 transition-colors p-2 bg-white hover:bg-teal-50 rounded-lg shadow-sm border border-gray-100" title="Edit">
                            <Pencil size={16} />
                          </Link>
                          <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 bg-white hover:bg-red-50 rounded-lg shadow-sm border border-gray-100" title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}