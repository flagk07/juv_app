'use client'

import { Product } from '@/lib/supabase'
import { Eye, Plus } from 'lucide-react'

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
    <div className="bg-transparent rounded-none border-0 overflow-visible shadow-none transition-none flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={onViewDetails}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" />
        )}
      </div>

      {/* Product Info */}
      <div className="px-0 pt-3 flex flex-col flex-1">
        <h3 className="text-[1.1rem] font-medium text-[#111] line-clamp-2 cursor-pointer" onClick={onViewDetails}>
          {product.name}
        </h3>
        {product.description && (
          <p className="text-sm text-[#666] mt-1 line-clamp-2">{product.description}</p>
        )}
        {product.sku && (
          <div className="text-xs text-gray-400 mt-1">АРТ: {product.sku}</div>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-[1rem] text-[#111]">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-primary-500">
            {product.in_stock ? 'В наличии' : 'Нет в наличии'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 mt-auto">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-[#111] text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 hover:bg-[#333]"
          >
            <Eye size={16} />
            <span>Подробнее</span>
          </button>
          <button
            onClick={() => onAddToCart(1)}
            disabled={!product.in_stock}
            className="flex-1 bg-[#111] text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#333]"
          >
            <Plus size={16} />
            <span>В корзину</span>
          </button>
        </div>
      </div>
    </div>
  )
} 