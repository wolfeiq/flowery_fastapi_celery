'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UploadModal from '@/components/UploadModal';
import { useWebSocket } from "@/hooks/websockets";
import MemoriesList from '@/components/MemoriesList';
import MemoryVisualization from '@/components/MemoryVisualization';
import { memoriesApi, profileApi } from '@/lib/api';
import ScentProfile from '@/components/ScentProfile'; 
import ActionCardsSection from '@/components/ActionCardsSection';
import Pomegranate3D from '@/components/Pomegranate3d';

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [scentProfile, setScentProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useWebSocket(user?.id);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMemories();
      fetchProfile();
    }
  }, [user]);

  const fetchMemories = async () => {
    setLoadingMemories(true);
    try {
      const response = await memoriesApi.list();
      setMemories(response.data);
    } catch (error) {
      console.error('Failed to load memories');
    } finally {
      setLoadingMemories(false);
    }
  };

  const fetchProfile = async () => {
  try {
    setLoadingProfile(true);
    const response = await profileApi.get();
    setScentProfile(response.data);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
  } finally {
    setLoadingProfile(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#c98e8f]"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
<nav className="sticky top-0 z-50 bg-white/1 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-between h-20 items-center">
            <h1 className="text-sm font-light tracking-wider text-[#e89a9c]">SCENT MEMORY</h1>
            <div className="flex items-center gap-8">
              <span className="text-sm font-light text-[#c98e8f]">Welcome, {user.full_name}</span>
              <button
                onClick={logout}
                className="text-sm font-light text-[#c98e8f] hover:text-[#e89a9c] transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
<div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
<ActionCardsSection onSuccess={fetchMemories} />
</div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">

        {/* Memories Section */}
        <div className="border-t border-white/10 pt-16">
          {/* 3D Visualization */}
          {memories.length > 0 && (
            <div className="mb-16">
              <MemoryVisualization memories={memories} />
            </div>
          )}

        {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-12 lg:gap-0">
            {/* Left Column - Memories List */}
            <div className="lg:pr-12">
              <h2 className="text-3xl font-light mb-8 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
                Your Memories
              </h2>
              <MemoriesList memories={memories} loading={loadingMemories} onRefresh={fetchMemories} />
            </div>

            {/* Divider */}
            <div className="hidden lg:block bg-white/10 h-full"></div>

            {/* Right Column - Add your content here */}
            <div className="lg:pl-12">
              <h2 className="text-3xl font-light mb-8 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
                Another Section
              </h2>
              <div className="lg:pl-12">
  {loadingProfile ? (
    <p className="text-[#c98e8f] font-light">Loading profile...</p>
  ) : (
    <ScentProfile profile={scentProfile} />
  )}
</div>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}