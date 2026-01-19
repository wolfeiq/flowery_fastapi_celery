'use client';

import Link from 'next/link';
import { useHumaneFont } from '@/hooks/humaneFonts';
import ShaderGradientBackground from '@/components/ShaderGradientBackground';
import CurvedTextLanding from '@/components/curve_landing';
import MemoryVisualization from '@/components/MemoryVisualization';
import ScentProfile from '@/components/ScentProfile';
import { FAKE_MEMORIES, FAKE_SCENT_PROFILE } from '@/components/FakeData';
import Footer from '@/components/Footer';

export default function LandingPageClient() {
  useHumaneFont();

  return (
    <div className="min-h-screen relative bg-[#1a1818]">
      <ShaderGradientBackground cameraZoom={5} />

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="flex justify-between items-center h-20">
              <h1 className="text-sm font-light tracking-wider text-white/90">SCENT MEMORY</h1>
              <div className="flex items-center gap-6">
                <Link 
                  href="/login"
                  className="text-sm font-light text-white/80 hover:text-white transition"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="px-6 py-2 bg-[#c69193] hover:bg-[#d4a5a7] text-white text-sm font-light tracking-wide transition rounded"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="min-h-screen flex items-center justify-center px-8">
          <div className="max-w-6xl mx-auto text-center">
            <CurvedTextLanding />

            <p className="text-md md:text-xl font-light text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
              Add memories (photos, pdfs, texts) and dissect each for fragrance notes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/login"
                className="px-8 py-4 backdrop-blur-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white font-light tracking-wide transition rounded-lg text-lg min-w-[200px]"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-20 animate-bounce">
              <svg 
                className="w-6 h-6 mx-auto text-white/40" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M19 9l-7 7-7-7" 
                />
              </svg>
            </div>
          </div>
        </section>
        <section className="backdrop-blur-3xl bg-black/30">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-12 lg:gap-0">
              <div className="lg:pr-12">
                <h2 className="text-9xl font-light mb-8 text-white/90" style={{ fontFamily: "'HUMANE', sans-serif" }}>
                  Memory Archive
                </h2>
                <MemoryVisualization memories={FAKE_MEMORIES} />
              </div>
              <div className="hidden lg:block bg-white/10 h-full" />
              <div className="lg:pl-12">
                <h2 className="text-9xl font-light mb-8 text-white/90" style={{ fontFamily: "'HUMANE', sans-serif" }}>
                  Your Fragrance Pyramid
                </h2>
                <ScentProfile profile={FAKE_SCENT_PROFILE} />
              </div>
            </div>
          </div>
        </section>
        <section className="backdrop-blur-3xl bg-black/40 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-8 py-24 text-center">
            <h2 
              className="text-7xl md:text-9xl font-light mb-8 text-white/90"
              style={{ fontFamily: "'HUMANE', sans-serif" }}
            >
              Begin Your Journey
            </h2>
            <p className="text-xl text-white/70 font-light mb-12 leading-relaxed">
              Start building your personal fragrance archive. 
              Every scent tells a story.
            </p>
            <Link 
              href="/register"
              className="inline-block px-12 py-5 bg-[#c69193] hover:bg-[#d4a5a7] text-white font-light tracking-wide transition rounded-lg text-lg"
            >
              Create Account for Free
            </Link>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}