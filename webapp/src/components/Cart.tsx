'use client'

import { useState } from 'react'
import { CartItem, supabase, logUserAction } from '@/lib/supabase'
import { TelegramWebApp } from '@/lib/telegram'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import CheckoutForm from './CheckoutForm'

interface CartProps {
  items: CartItem[]
  onClose: () => void
  onUpdateCart: () => void
  telegramApp: TelegramWebApp | null
}

export default function Cart({ items, onClose, onUpdateCart, telegramApp }: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId)

      if (error) throw error

      onUpdateCart()
      telegramApp?.hapticFeedback('light')
    } catch (error) {
      console.error('Error updating quantity:', error)
      telegramApp?.hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      onUpdateCart()
      telegramApp?.hapticFeedback('success')
    } catch (error) {
      console.error('Error removing item:', error)
      telegramApp?.hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity
  }, 0)

  if (showCheckout) {
    return (
      <CheckoutForm
        items={items}
        totalAmount={totalAmount}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          onClose()
          onUpdateCart()
        }}
        telegramApp={telegramApp}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="text-xl font-serif font-bold text-primary-800">
            Корзина ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-primary-600" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-primary-600">Корзина пуста</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="card">
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-cream-100 flex-shrink-0">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cream-200">
                        <span className="text-primary-600 font-bold">J</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary-800 truncate">
                      {item.product?.title}
                    </h3>
                    <p className="text-primary-600 text-sm">
                      {formatPrice(item.product?.price || 0)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50"
                      >
                        <Minus size={14} className="text-primary-600" />
                      </button>

                      <span className="w-8 text-center text-sm font-medium text-primary-800">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} className="text-primary-600" />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={loading}
                        className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-medium text-primary-800">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-primary-700">Итого:</span>
              <span className="text-xl font-bold text-primary-800">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              Оформить заказ
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 