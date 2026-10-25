'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Wrench, CheckCircle, Clock, Trash2 } from 'lucide-react'
import Link from 'next/link'

type Maintenance = {
  id: string
  item_id: string
  issue_description: string
  service_date: string
  cost: number
  status: string
  inventory: { item_name: string } // Relasi ke tabel inventory
}

export default function MaintenancePage() {
  const router = useRouter()
  const [logs, setLogs] = useState<Maintenance[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State Form
  const [itemId, setItemId] = useState('')
  const [issue, setIssue] = useState('')
  const [date, setDate] = useState('')
  const [cost, setCost] = useState('')
  const [status, setStatus] = useState('Dalam Perbaikan')

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    // Ambil data inventory untuk pilihan dropdown
    const { data: invData } = await supabase.from('inventory').select('id, item_name').eq('user_id', user.id)
    if (invData) setItems(invData)

    // Ambil data maintenance dengan relasi ke inventory
    const { data: logsData } = await supabase
      .from('maintenance_logs')
      .select('*, inventory(item_name)')
      .eq('user_id', user.id)
      .order('service_date', { ascending: false })

    if (logsData) setLogs(logsData)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const numericCost = parseFloat(cost.replace(/\./g, '')) || 0

    const { error } = await supabase.from('maintenance_logs').insert({
      user_id: user.id,
      item_id: itemId,
      issue_description: issue,
      service_date: date,
      cost: numericCost,
      status
    })

    if (!error) {
      setIsFormOpen(false)
      setItemId(''); setIssue(''); setDate(''); setCost('')
      fetchData()
    } else {
      alert('Gagal menyimpan: ' + error.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus riwayat ini?')) return
    await supabase.from('maintenance_logs').delete().eq('id', id)
    fetchData()
  }

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val) val = parseInt(val).toLocaleString('id-ID')
    setCost(val)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50">
              <ArrowLeft size={20} className="text-teal-700" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Riwayat Perbaikan</h1>
              <p className="text-sm text-gray-500">Catat servis dan perbaikan aset Anda.</p>
            </div>
          </div>
          <button onClick={() => setIsFormOpen(!isFormOpen)} className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus size={16} /> Catat Perbaikan
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-in fade-in">
            <h2 className="font-bold text-gray-800 mb-4">Catat Perbaikan Baru</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Barang *</label>
                <select required value={itemId} onChange={e => setItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800">
                  <option value="">Pilih Barang</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.item_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Servis *</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Keluhan / Kerusakan *</label>
                <input type="text" required value={issue} onChange={e => setIssue(e.target.value)} placeholder="Misal: Layar rusak, ganti oli, dll" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Biaya (Rp)</label>
                <input type="text" value={cost} onChange={handleCostChange} placeholder="150.000" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-gray-800">
                  <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Wrench size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada riwayat perbaikan</h3>
            <p className="text-gray-500 text-sm">Klik "Catat Perbaikan" untuk memulai.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold">Tanggal</th>
                  <th className="px-6 py-4 font-semibold">Barang</th>
                  <th className="px-6 py-4 font-semibold">Keluhan</th>
                  <th className="px-6 py-4 font-semibold text-right">Biaya</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(log.service_date).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-800">{log.inventory?.item_name || 'Barang Dihapus'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{log.issue_description}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-600">Rp {log.cost.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${log.status === 'Selesai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => handleDelete(log.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}