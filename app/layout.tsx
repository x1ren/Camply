import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = { title: 'Camply - International Campus Marketplace', 
  description: 'A safe, school-focused marketplace that connects students globally. Discover, buy, and sell products within your campus community while boosting student entrepreneurship.', 
  keywords: 'Camply, student marketplace, campus trading, school marketplace, buy and sell, international students, trust indicators, student entrepreneurship', 
  authors: [{ name: 'Iben Anoos' }], 
}


export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
          {children}
        
      </body>
    </html>
  )
} 