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

    // Hide menu main button in shop WebApp
    if (tgApp.isSupported()) {
      try { tgApp.hideMainButton() } catch {}
    }

    // Load products and cart
    loadProducts()
    loadCart()

    return () => {
      if (tgApp.isSupported()) try { tgApp.hideMainButton() } catch {}
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

  useEffect(() => {
    // Realtime sync: subscribe to cart changes for current Telegram user
    const tg = TelegramWebApp.getInstance()
    const user = tg.getUser()
    if (!user) return

    const channel = supabase
      .channel(`cart_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `telegram_id=eq.${user.id}`,
        },
        () => {
          // Reload cart on any insert/update/delete affecting this user
          loadCart()
        }
      )
      .subscribe()

    return () => {
      try { supabase.removeChannel(channel) } catch {}
    }
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
      // Try to load from server cart if Telegram user exists, else fallback to local
      const tg = TelegramWebApp.getInstance()
      const user = tg.getUser()
      if (user) {
        const { data: rows, error } = await supabase
          .from('cart_items')
          .select('product_id, quantity')
          .eq('telegram_id', user.id)
        if (!error && rows && rows.length > 0) {
          const productIds = rows.map(r => r.product_id)
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds)
          const productById = new Map((products || []).map(p => [p.id, p]))
          const serverCart = rows.map(r => ({
            id: r.product_id, // stable id per product for UI actions
            product_id: r.product_id,
            quantity: r.quantity,
            product: productById.get(r.product_id),
          }))
          localStorage.setItem('juv_cart', JSON.stringify(serverCart))
          setCartItems(serverCart)
          return
        } else if (!error && rows && rows.length === 0) {
          // Server is empty: push local cart up
          const raw = localStorage.getItem('juv_cart')
          const local: any[] = raw ? JSON.parse(raw) : []
          if (local.length > 0) {
            const upserts = local.map((i) => ({ telegram_id: user.id, product_id: i.product_id, quantity: i.quantity }))
            try {
              await supabase.from('cart_items').upsert(upserts, { onConflict: 'telegram_id,product_id' })
            } catch {}
          }
        }
      }
      // Fallback to local
      const raw = localStorage.getItem('juv_cart')
      const data = raw ? JSON.parse(raw) : []
      setCartItems(data)
    } catch {}
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    try {
      const existingItem = cartItems.find((i) => i.product_id === product.id)
      let next
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity
      if (existingItem) {
        next = cartItems.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      } else {
        next = [
          ...cartItems,
          { id: product.id, product_id: product.id, quantity, product }
        ]
      }
      // Persist to server if Telegram user is available
      try {
        const user = telegramApp?.getUser()
        if (user) {
          // check existing row
          const { data: row } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('telegram_id', user.id)
            .eq('product_id', product.id)
            .maybeSingle()
          if (row) {
            await supabase
              .from('cart_items')
              .update({ quantity: newQuantity })
              .eq('id', row.id)
          } else {
            await supabase
              .from('cart_items')
              .insert({ telegram_id: user.id, product_id: product.id, quantity: newQuantity })
          }
        }
      } catch {}
      localStorage.setItem('juv_cart', JSON.stringify(next))
      setCartItems(next)

      // Log add to cart action
      try {
        const user = telegramApp?.getUser()
        if (user) {
          await logUserAction(user.id, user.username, 'add_to_cart', {
            product_id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            added_quantity: quantity,
            cart_quantity: newQuantity,
          })
        }
      } catch {}

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
    // server sync
    try {
      const user = telegramApp?.getUser()
      if (user) {
        const item = next.find(i => i.id === itemId)
        if (item) {
          supabase
            .from('cart_items')
            .update({ quantity: item.quantity })
            .eq('telegram_id', user.id)
            .eq('product_id', item.product_id)
            .then(() => {})
        }
      }
    } catch {}
  }

  const removeItem = (itemId: string) => {
    const next = cartItems.filter((i) => i.id !== itemId)
    localStorage.setItem('juv_cart', JSON.stringify(next))
    setCartItems(next)
    // server sync
    try {
      const user = telegramApp?.getUser()
      if (user) {
        const removed = cartItems.find(i => i.id === itemId)
        if (removed) {
          supabase
            .from('cart_items')
            .delete()
            .eq('telegram_id', user.id)
            .eq('product_id', removed.product_id)
            .then(() => {})
        }
      }
    } catch {}
  }

  const clearCart = () => {
    localStorage.removeItem('juv_cart')
    setCartItems([])
    // server sync
    try {
      const user = telegramApp?.getUser()
      if (user) {
        supabase
          .from('cart_items')
          .delete()
          .eq('telegram_id', user.id)
          .then(() => {})
      }
    } catch {}
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