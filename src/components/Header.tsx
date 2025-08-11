'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { TelegramWebApp } from '@/lib/telegram'

export default function Header() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const tgApp = TelegramWebApp.getInstance()
    setUser(tgApp.getUser())
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

          {/* User info */}
          {user && (
            <div className="flex items-center text-sm text-primary-700">
              <span>Привет, {user.first_name}!</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 