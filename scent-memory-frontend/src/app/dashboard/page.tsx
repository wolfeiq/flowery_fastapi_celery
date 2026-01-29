'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useMe, useLogout } from '@/hooks/useAuth'; 
import { useWebSocket } from "@/hooks/websockets";
import { useMemories } from '@/hooks/useMemories';
import { useProfile } from '@/hooks/useProfile';
import { useHumaneFont } from '@/hooks/humaneFonts';
import ShaderGradientBackground from '@/components/ShaderGradientBackground';
import MemoriesList from '@/components/MemoriesList';
import MemoryVisualization from '@/components/MemoryVisualization';
import ScentProfile from '@/components/ScentProfile'; 
import ActionCardsSection from '@/components/ActionCardsSection';
import Footer from '@/components/Footer';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const { data: user, isLoading: loadingAuth, error: authError } = useMe();
  const logout = useLogout();
  const { data: memories = [], isLoading: loadingMemories, refetch: refetchMemories } = useMemories();
  const { data: scentProfile, isLoading: loadingProfile } = useProfile();

  useWebSocket(user?.id, token);
  useHumaneFont();
  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);
  

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    }
  }, [user, loadingAuth, router]);


  if (!mounted || loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1818]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c98e8f]" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen relative bg-[#1a1818]">
      <ShaderGradientBackground cameraZoom={1.95} />
      <div className="relative z-10">

        <nav className="sticky top-0 z-50 bg-transparent">
          <div className="max-w-7xl mx-auto px-8 lg:px-16">
            <div className="flex justify-between h-20 items-center">
              <h1 className="text-sm font-light tracking-wider text-white/90">SCENT MEMORY</h1>
              <div className="flex items-center gap-8">
                <span className="text-sm font-light text-white/80">
                  Welcome, {user.full_name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm font-light text-white/80 hover:text-white transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <ActionCardsSection />
        <div className="backdrop-blur-3xl bg-black/30">
          <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
            <section className="border-t border-white/10 pt-16">
              <h2 className="text-9xl font-light mb-8 text-white/90" style={{ fontFamily: "'HUMANE', sans-serif" }}>
                Your Memories
              </h2>
              
              <div className="mb-16">
                <MemoryVisualization memories={memories} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-12 lg:gap-0">
                <div className="lg:pr-12">
                  <h3 className="text-9xl font-light mb-8 text-white/90" style={{ fontFamily: "'HUMANE', sans-serif" }}>
                    Memory Archive
                  </h3>
                  <MemoriesList 
                    memories={memories} 
                    loading={loadingMemories} 
                    onRefresh={refetchMemories} 
                  />
                </div>

                <div className="hidden lg:block bg-white/10 h-full" aria-hidden="true" />
                <div className="lg:pl-12">
                  <h3 className="text-9xl font-light mb-8 text-white/90" style={{ fontFamily: "'HUMANE', sans-serif" }}>
                    Your Fragrance Pyramid
                  </h3>
                  {loadingProfile ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-pulse text-white/70 font-light">Loading profile...</div>
                    </div>
                  ) : (
                    <ScentProfile profile={scentProfile || null} />
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}