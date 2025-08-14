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
    <div className="bg-white rounded-[1.5rem] border border-[#eee] overflow-hidden shadow-[0_4px_10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-white cursor-pointer" onClick={onViewDetails}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain bg-white"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white" />
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 flex flex-col flex-1">
        <h3 className="card-title text-[1.1rem] font-semibold text-[#111] line-clamp-2 cursor-pointer" onClick={onViewDetails}>
          {product.name}
        </h3>
        
        {product.description && (
          <p className="card-desc text-sm text-[#666] mt-2 line-clamp-2">{product.description}</p>
        )}

        {product.sku && (
          <div className="text-xs text-gray-400 mt-1">АРТ: {product.sku}</div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="price font-semibold text-[1rem] text-[#111]">
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