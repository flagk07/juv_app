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
  const [toast, setToast] = useState<{ visible: boolean; text: string }>({ visible: false, text: '' })

  const showToast = (text: string) => {
    setToast({ visible: true, text })
    setTimeout(() => setToast({ visible: false, text: '' }), 3000)
  }

  useEffect(() => {
    // Initialize Telegram WebApp
    const tgApp = TelegramWebApp.getInstance()
    setTelegramApp(tgApp)

    // Log webapp open action
    const user = tgApp.getUser()
    if (user) {
      logUserAction(user.id, user.username, 'open_webapp')
    }

    // Setup menu button handler
    if (tgApp.isSupported()) {
      tgApp.showMainButton('Меню', () => {
        const menuData = { action: 'show_menu', user_id: user?.id };
        tgApp.sendData(JSON.stringify(menuData));
      });
    }

    // Load products and cart
    loadProducts()
    loadCart()

    return () => {
      if (tgApp.isSupported()) tgApp.hideMainButton()
    }
  }, [])

  // Sync cart counter in header
  useEffect(() => {
    const count = cartItems.reduce((s, i) => s + i.quantity, 0)
    window.dispatchEvent(new CustomEvent('cart:count', { detail: { count } }))
  }, [cartItems])

  useEffect(() => {
    const openHandler = () => setShowCart(true)
    window.addEventListener('cart:open', openHandler)
    return () => window.removeEventListener('cart:open', openHandler)
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('in_stock', true)
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
    try {
      const raw = localStorage.getItem('juv_cart')
      const data = raw ? JSON.parse(raw) : []
      setCartItems(data)
    } catch {}
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const existingItem = cartItems.find((i) => i.product_id === product.id)
      let next
      if (existingItem) {
        next = cartItems.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      } else {
        next = [
          ...cartItems,
          { id: crypto.randomUUID(), product_id: product.id, quantity, product }
        ]
      }
      localStorage.setItem('juv_cart', JSON.stringify(next))
      setCartItems(next)

      telegramApp?.hapticFeedback('success')
      showToast('Товар добавлен в корзину')
    } catch (error) {
      console.error('Error adding to cart:', error)
      telegramApp?.hapticFeedback('error')
    }
  }

  const changeQuantity = (itemId: string, newQuantity: number) => {
    const next = cartItems.map((i) => i.id === itemId ? { ...i, quantity: newQuantity } : i)
    localStorage.setItem('juv_cart', JSON.stringify(next))
    setCartItems(next)
  }

  const removeItem = (itemId: string) => {
    const next = cartItems.filter((i) => i.id !== itemId)
    localStorage.setItem('juv_cart', JSON.stringify(next))
    setCartItems(next)
  }

  const clearCart = () => {
    localStorage.removeItem('juv_cart')
    setCartItems([])
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
    <div className="min-h-screen bg-white">
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
          onChangeQuantity={changeQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          telegramApp={telegramApp}
        />
      )}

      {toast.visible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#111] text-white px-4 py-2 rounded-full shadow-elegant text-sm">
          {toast.text}
        </div>
      )}
    </div>
  )
} 