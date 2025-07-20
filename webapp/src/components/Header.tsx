'use client'

import { useState, useEffect } from 'react'
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
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              J
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-serif font-bold text-primary-800">JUV</h1>
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