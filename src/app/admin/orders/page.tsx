"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'processing' | 'completed'>('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true)
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setOrders(data || [])
    } catch (e) {
      console.error('Failed to load orders', e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error
      loadOrders()
    } catch (e) {
      console.error('Failed to update order', e)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Заказы</h1>
        <p className="text-gray-600">Управление заказами клиентов</p>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {(['all','new','processing','completed'] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${filter === k ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {k === 'all' ? 'Все' : k === 'new' ? 'Новые' : k === 'processing' ? 'В обработке' : 'Завершенные'}
            </button>
          ))}
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Список заказов</h2>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
              <p className="text-gray-600">Когда появятся заказы, они будут отображаться здесь</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="border border-cream-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">№ {o.id.slice(-8)} · {new Date(o.created_at).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Телеграм ID: {o.telegram_id}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{Number(o.total).toLocaleString()} ₽</div>
                      <div className="text-sm text-gray-600">Статус: {o.status}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700 space-y-2">
                    {Array.isArray(o.items) && o.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {it.image_url && (
                            <img src={it.image_url} alt={it.title} className="w-10 h-10 rounded object-cover border" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate">{it.title} × {it.quantity}</div>
                            {it.sku && <div className="text-xs text-gray-400">АРТ: {it.sku}</div>}
                          </div>
                        </div>
                        <span className="whitespace-nowrap">{Number(it.total).toLocaleString()} ₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => updateOrderStatus(o.id, 'processing')} className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 rounded">В обработку</button>
                    <button onClick={() => updateOrderStatus(o.id, 'completed')} className="px-3 py-1 text-sm bg-green-50 hover:bg-green-100 rounded">Завершить</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 