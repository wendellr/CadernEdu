import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CadernEdu — Educação digital pública para todas as crianças',
  description:
    'Trilhas de estudo, comunicação família-escola e gestão municipal em um só lugar, dentro do orçamento da prefeitura.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-fg antialiased">{children}</body>
    </html>
  )
}
