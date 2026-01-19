import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/providers/QueryClientProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1818' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  
  title: {
    default: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
    template: '%s | Scent Memory',
  },
  
  description: 'Upload memories as photos, PDFs, or texts and discover fragrance notes that match your emotional journey. Build your personal scent profile with AI-powered recommendations.',
  
  keywords: [
    'scent memory',
    'personalized fragrance',
    'perfume recommendations',
    'fragrance notes',
    'AI perfume',
    'scent profile',
    'fragrance pyramid',
  ],
  
  authors: [{ name: 'Flowery Fragrances' }],
  creator: 'Flowery Fragrances',
  publisher: 'Flowery Fragrances',
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Scent Memory',
    title: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
    description: 'Upload memories and discover fragrance notes that match your emotional journey.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Scent Memory Platform',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
    description: 'Upload memories and discover fragrance notes that match your emotional journey.',
    images: ['/twitter-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Scent Memory" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Scent Memory" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1818',
                color: '#e89a9c',
                border: '1px solid rgba(200, 142, 143, 0.3)',
              },
              success: {
                iconTheme: {
                  primary: '#c98e8f',
                  secondary: '#1a1818',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#1a1818',
                },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}