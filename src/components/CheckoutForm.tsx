'use client'

import { useState } from 'react'
import { CartItem, supabase, logUserAction } from '@/lib/supabase'
import { TelegramWebApp } from '@/lib/telegram'
import { X, User, Mail, Phone } from 'lucide-react'

interface CheckoutFormProps {
  items: CartItem[]
  totalAmount: number
  onClose: () => void
  onSuccess: () => void
  telegramApp: TelegramWebApp | null
}

export default function CheckoutForm({
  items,
  totalAmount,
  onClose,
  onSuccess,
  telegramApp
}: CheckoutFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Номер телефона обязателен'
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат номера телефона'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      telegramApp?.hapticFeedback('error')
      return
    }

    setLoading(true)

    try {
      const user = telegramApp?.getUser()
      if (!user) {
        throw new Error('Telegram user not found')
      }

      // Prepare order items
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        title: item.product?.title,
        price: item.product?.price,
        quantity: item.quantity,
        total: (item.product?.price || 0) * item.quantity,
      }))

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          telegram_id: user.id,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          items: orderItems,
          total_amount: totalAmount,
          status: 'new',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Clear cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('telegram_id', user.id)

      if (clearCartError) throw clearCartError

      // Log order confirmation
      logUserAction(user.id, user.username, 'confirm_order', {
        order_id: order.id,
        total_amount: totalAmount,
        items_count: items.length,
      })

      // Show success message
      telegramApp?.showAlert(
        `Заказ №${order.id.slice(-8)} успешно оформлен!\n\nМы свяжемся с вами в ближайшее время для подтверждения.`,
        () => {
          onSuccess()
        }
      )

      telegramApp?.hapticFeedback('success')

    } catch (error) {
      console.error('Error creating order:', error)
      telegramApp?.showAlert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.')
      telegramApp?.hapticFeedback('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h2 className="text-xl font-serif font-bold text-primary-800">
            Оформление заказа
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} className="text-primary-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-primary-800 flex items-center gap-2">
                <User size={20} />
                Контактная информация
              </h3>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`input-field pl-11 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Номер телефона *
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`input-field pl-11 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+7 (999) 123-45-67"
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-cream-100 rounded-xl p-4 space-y-3">
              <h3 className="font-medium text-primary-800">Ваш заказ</h3>
              
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-primary-700">
                    {item.product?.title} × {item.quantity}
                  </span>
                  <span className="text-primary-800 font-medium">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="border-t border-cream-300 pt-3 flex justify-between font-medium">
                <span className="text-primary-800">Итого:</span>
                <span className="text-primary-800 text-lg font-bold">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Оформляем заказ...' : 'Подтвердить заказ'}
            </button>

            <p className="text-xs text-primary-500 text-center">
              Нажимая "Подтвердить заказ", вы соглашаетесь с условиями обработки персональных данных
            </p>
          </form>
        </div>
      </div>
    </div>
  )
} 