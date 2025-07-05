import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'worklog',
  description: 'a minimal no-bs work hours tracker'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
