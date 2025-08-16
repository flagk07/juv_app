'use client'

import { useMemo, useRef, useState } from 'react'
import { Product } from '@/lib/supabase'

interface ProductCardProps {
  product: Product
  onViewDetails: () => void
  onAddToCart: (quantity: number) => void
}

function parseImages(image_url?: string): string[] {
  if (!image_url) return []
  try {
    const arr = JSON.parse(image_url)
    if (Array.isArray(arr)) return arr.filter(Boolean)
  } catch {}
  return [image_url]
}

export default function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const images = useMemo(() => parseImages(product.image_url), [product.image_url])
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }

  return (
    <div className="bg-transparent rounded-none border-0 overflow-visible shadow-none transition-none flex flex-col">
      {/* Product Image(s) */}
      <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={onViewDetails}>
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {(images.length ? images : [undefined]).map((src, i) => (
            <div key={i} className="w-full h-full flex-shrink-0 snap-center">
              {src ? (
                <img src={src} alt={product.name} className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
              ) : (
                <div className="w-full h-full flex items-center justify-center" />
              )}
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-cream-400' : 'bg-cream-300'}`}></span>
            ))}
          </div>
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
          <span className="font-semibold text-[1rem] text-[#111]">{formatPrice(product.price)}</span>
          <span className="text-sm text-primary-500">{product.in_stock ? 'В наличии' : 'Нет в наличии'}</span>
        </div>
      </div>
    </div>
  )
} 