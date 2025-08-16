'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Product, logUserAction } from '@/lib/supabase'
import { TelegramWebApp } from '@/lib/telegram'
import { X, Minus, Plus } from 'lucide-react'

interface ProductModalProps {
  product: Product
  onClose: () => void
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

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const images = useMemo(() => parseImages(product.image_url), [product.image_url])
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(price)

  const handleAddToCart = () => {
    onAddToCart(quantity)
    const tgApp = TelegramWebApp.getInstance()
    const user = tgApp.getUser()
    if (user) logUserAction(user.id, user.username, 'view_product', { product_id: product.id })
  }

  const onScroll = () => {
    const el = containerRef.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cream-200">
          <h2 className="text-xl font-serif font-bold text-primary-800">Детали товара</h2>
          <button onClick={onClose} className="p-2 hover:bg-cream-100 rounded-lg transition-colors">
            <X size={24} className="text-primary-600" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Product Image(s) */}
          <div className="relative aspect-square overflow-hidden">
            <div ref={containerRef} onScroll={onScroll} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'none' }}>
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
          <div className="space-y-3 pb-20">
            <h3 className="text-2xl font-serif font-bold text-primary-800">{product.name}</h3>
            {product.description && (<p className="text-primary-600 leading-relaxed text-sm">{product.description}</p>)}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary-800">{formatPrice(product.price)}</span>
              <span className="text-primary-500">{product.in_stock ? 'В наличии' : 'Нет в наличии'}</span>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-primary-700">Количество:</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors">
                  <Minus size={16} className="text-primary-600" />
                </button>
                <span className="w-12 text-center font-medium text-primary-800">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg border border-primary-300 flex items-center justify-center hover:bg-primary-50 transition-colors">
                  <Plus size={16} className="text-primary-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Add to Cart */}
        <div className="p-4 border-t border-cream-200 bg-white">
          <button onClick={handleAddToCart} disabled={!product.in_stock} className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {product.in_stock ? 'Добавить в корзину' : 'Нет в наличии'}
          </button>
        </div>
      </div>
    </div>
  )
} 