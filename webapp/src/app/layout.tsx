import './globals.css'
import React from 'react'

export const metadata = {
  title: 'JUV - Ювелирные изделия',
  description: 'Изысканные ювелирные украшения от бренда JUV',
  viewport: 'width=device-width, initial-scale=1, user-scalable=no',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      </head>
      <body className="telegram-viewport font-sans">
        <div className="min-h-screen bg-cream-200">
          {children}
        </div>
      </body>
    </html>
  )
} 