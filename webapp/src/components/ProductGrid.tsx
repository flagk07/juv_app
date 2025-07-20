'use client'

import { useState } from 'react'
import { Product } from '@/lib/supabase'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product, quantity: number) => void
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-primary-600 text-lg">Товары временно недоступны</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={() => setSelectedProduct(product)}
            onAddToCart={(quantity) => onAddToCart(product, quantity)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(quantity) => {
            onAddToCart(selectedProduct, quantity)
            setSelectedProduct(null)
          }}
        />
      )}
    </>
  )
} 