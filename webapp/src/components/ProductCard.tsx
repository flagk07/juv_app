'use client'

import { Product } from '@/lib/supabase'
import { Eye, Plus } from 'lucide-react'
import Image from 'next/image'

interface ProductCardProps {
  product: Product
  onViewDetails: () => void
  onAddToCart: (quantity: number) => void
}

export default function ProductCard({ product, onViewDetails, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="card group hover:shadow-luxury transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-xl bg-cream-100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-200">
            <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">J</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="font-serif font-semibold text-lg text-primary-800 line-clamp-2">
          {product.title}
        </h3>
        
        {product.description && (
          <p className="text-primary-600 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-800">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-primary-500">
            В наличии: {product.quantity_available}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onViewDetails}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <Eye size={16} />
            <span>Подробнее</span>
          </button>
          
          <button
            onClick={() => onAddToCart(1)}
            disabled={product.quantity_available === 0}
            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            <span>В корзину</span>
          </button>
        </div>
      </div>
    </div>
  )
} 