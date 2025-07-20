'use client'

import { useState } from 'react'
import { Product, logUserAction } from '@/lib/supabase'
import { TelegramWebApp } from '@/lib/telegram'
import { X, Minus, Plus } from 'lucide-react'
import Image from 'next/image'

interface ProductModalProps {
  product: Product
  onClose: () => void
  onAddToCart: (quantity: number) => void
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    onAddToCart(quantity)
    
    // Log product view action
    const tgApp = TelegramWebApp.getInstance()
    const user = tgApp.getUser()
    if (user) {
      logUserAction(user.id, user.username, 'view_product', { product_id: product.id })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="text-xl font-serif font-bold text-primary-800">
            Детали товара
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-primary-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-cream-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-cream-200">
                <div className="w-20 h-20 bg-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-2xl">J</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold text-primary-800">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-primary-600 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-800">
                {formatPrice(product.price)}
              </span>
              <span className="text-primary-500">
                В наличии: {product.quantity_available} шт.
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary-700">
                Количество:
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors"
                >
                  <Minus size={16} className="text-primary-600" />
                </button>
                
                <span className="w-12 text-center font-medium text-primary-800">
                  {quantity}
                </span>
                
                <button
                  onClick={() => setQuantity(Math.min(product.quantity_available, quantity + 1))}
                  disabled={quantity >= product.quantity_available}
                  className="w-10 h-10 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="text-primary-600" />
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-cream-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-primary-700 font-medium">Итого:</span>
                <span className="text-xl font-bold text-primary-800">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.quantity_available === 0}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.quantity_available === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 