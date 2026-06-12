// src/app/layout.tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Data Analyst Mission OS',
  description: 'Transform into a job-ready Data Analyst. Your personal mission control center for SQL, Python, Business Analytics, and career success.',
  keywords: 'data analyst, SQL, Python, Pandas, career, internship, learning',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0A0F1E] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
