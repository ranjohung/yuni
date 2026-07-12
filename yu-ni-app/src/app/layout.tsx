import './globals.css'
import SessionWrapper from '@/components/SessionWrapper'

export const metadata = {
  title: '与你 - AI社交模拟训练平台',
  description: '通过高拟真数字人实时互动，结合认知行为疗法、非暴力沟通等心理学框架，为你提供零压力的社交场景模拟训练与情感陪伴。',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '与你',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  )
}
