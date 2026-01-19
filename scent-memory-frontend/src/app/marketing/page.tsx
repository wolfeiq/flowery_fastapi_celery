import { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
  description: 'Upload memories as photos, PDFs, or texts and discover fragrance notes that match your emotional journey. Build your personal scent profile with AI-powered recommendations.',
  
  keywords: [
    'scent memory',
    'personalized fragrance',
    'perfume recommendations',
    'fragrance notes',
    'AI perfume',
    'scent profile',
    'fragrance pyramid',
    'memory fragrance',
  ],
  
  authors: [{ name: 'Flowery Fragrances' }],
  
  creator: 'Flowery Fragrances',
  publisher: 'Flowery Fragrances',
  

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://thescentmemory.com',
    siteName: 'Scent Memory',
    title: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
    description: 'Upload memories and discover fragrance notes that match your emotional journey. Build your personal scent profile with AI-powered recommendations.',
    images: [
      {
        url: 'https://thescentmemory.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Scent Memory - Fragrance Profile Platform',
      },
    ],
  },
 
  twitter: {
    card: 'summary_large_image',
    site: '@portable_writer',
    creator: '@portable_writer',
    title: 'Scent Memory - Turn Your Memories Into Personalized Fragrances',
    description: 'Upload memories and discover fragrance notes that match your emotional journey.',
    images: ['https://thescentmemory.com/twitter-image.jpg'], // Replace with your actual Twitter image
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
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/site.webmanifest',

  other: {
    'application-name': 'Scent Memory',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no',
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}