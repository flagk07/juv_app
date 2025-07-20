'use client'

import { useEffect, useState } from 'react'
import { TelegramWebApp } from '@/lib/telegram'
import { supabase, logUserAction, Product } from '@/lib/supabase'
import ProductGrid from '@/components/ProductGrid'
import Header from '@/components/Header'
import Cart from '@/components/Cart'
import { ShoppingCart } from 'lucide-react'

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [telegramApp, setTelegramApp] = useState<TelegramWebApp | null>(null)

  useEffect(() => {
    // Initialize Telegram WebApp
    const tgApp = TelegramWebApp.getInstance()
    setTelegramApp(tgApp)

    // Log webapp open action
    const user = tgApp.getUser()
    if (user) {
      logUserAction(user.id, user.username, 'open_webapp')
    }

    // Load products and cart
    loadProducts()
    loadCart()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCart = async () => {
    if (!telegramApp) return

    const userId = telegramApp.getUserId()
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('telegram_id', userId)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error('Error loading cart:', error)
    }
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!telegramApp) return

    const user = telegramApp.getUser()
    if (!user) return

    try {
      // Check if item already in cart
      const existingItem = cartItems.find(item => item.product_id === product.id)
      
      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            telegram_id: user.id,
            product_id: product.id,
            quantity
          })

        if (error) throw error
      }

      // Log action
      logUserAction(user.id, user.username, 'add_to_cart', { product_id: product.id, quantity })

      // Haptic feedback
      telegramApp.hapticFeedback('success')

      // Reload cart
      loadCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      telegramApp?.hapticFeedback('error')
    }
  }

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream-200">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-primary-800">
            Коллекция JUV
          </h1>
          
          {cartItemsCount > 0 && (
            <button
              onClick={() => setShowCart(true)}
              className="relative btn-primary flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              <span>Корзина</span>
              <span className="absolute -top-2 -right-2 bg-accent-gold text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                {cartItemsCount}
              </span>
            </button>
          )}
        </div>

        <ProductGrid products={products} onAddToCart={addToCart} />
      </main>

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateCart={loadCart}
          telegramApp={telegramApp}
        />
      )}
    </div>
  )
} 