'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart } from 'lucide-react'
import { TelegramWebApp } from '@/lib/telegram'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [cartCount, setCartCount] = useState<number>(0)

  useEffect(() => {
    const tgApp = TelegramWebApp.getInstance()
    setUser(tgApp.getUser())

    // Подписка на событие обновления корзины
    const handler = (e: any) => setCartCount(e.detail?.count ?? 0)
    window.addEventListener('cart:count', handler)
    return () => window.removeEventListener('cart:count', handler)
  }, [])

  return (
    <header className="bg-white shadow-elegant border-b border-cream-300">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="relative w-12 h-12">
              <Image
                src="/juv-logo.png"
                alt="JUV"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <div className="ml-3">
              <h1 className="text-2xl font-serif font-bold text-primary-700 tracking-wide">JUV</h1>
              <p className="text-sm text-primary-600">Ювелирные изделия</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:block text-sm text-primary-700">Привет, {user.first_name}!</div>
            )}
            <button
              aria-label="Открыть корзину"
              onClick={() => window.dispatchEvent(new CustomEvent('cart:open'))}
              className="relative p-2 rounded-lg hover:bg-cream-50"
            >
              <ShoppingCart className="text-primary-700" size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-gold text-white text-[10px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 