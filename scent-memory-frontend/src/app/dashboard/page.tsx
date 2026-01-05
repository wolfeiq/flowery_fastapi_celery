'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UploadModal from '@/components/UploadModal';
import { useWebSocket } from "@/hooks/websockets";
import MemoriesList from '@/components/MemoriesList';
import MemoryVisualization from '@/components/MemoryVisualization';
import { memoriesApi } from '@/lib/api';

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useWebSocket(user?.id);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMemories();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-neutral-800"></div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex justify-between h-20 items-center">
            <h1 className="text-sm font-light tracking-wider text-neutral-800">SCENT MEMORY</h1>
            <div className="flex items-center gap-8">
              <span className="text-sm font-light text-neutral-600">Welcome, {user.full_name}</span>
              <button
                onClick={logout}
                className="text-sm font-light text-neutral-700 hover:text-neutral-900 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
          <h2 className="text-5xl font-light mb-4 text-neutral-800" style={{ fontFamily: 'serif' }}>
            Your Fragrance Journey
          </h2>
          <p className="text-neutral-600 font-light max-w-2xl">
            Capture and explore your scent memories. Discover fragrances that resonate 
            with your emotions, moments, and memories.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Upload Memory Card */}
          <div className="bg-white p-8 border border-neutral-200 hover:border-neutral-400 transition group">
            <div className="h-32 mb-6 bg-neutral-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 group-hover:text-neutral-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-neutral-800" style={{ fontFamily: 'serif' }}>Upload Memory</h3>
            <p className="text-sm font-light text-neutral-600 mb-6">Add a new scent memory to your collection</p>
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-neutral-800 text-white py-2.5 text-sm font-light tracking-wide hover:bg-neutral-900 transition"
            >
              Upload
            </button>
          </div>

          {/* Spotify Card */}
          <div className="bg-white p-8 border border-neutral-200 hover:border-neutral-400 transition group">
            <div className="h-32 mb-6 bg-neutral-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 group-hover:text-neutral-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-neutral-800" style={{ fontFamily: 'serif' }}>Music to Fragrance</h3>
            <p className="text-sm font-light text-neutral-600 mb-6">Discover scents inspired by your music</p>
            <button className="w-full bg-neutral-800 text-white py-2.5 text-sm font-light tracking-wide hover:bg-neutral-900 transition">
              Connect
            </button>
          </div>

          {/* Query Card */}
          <div className="bg-white p-8 border border-neutral-200 hover:border-neutral-400 transition group">
            <div className="h-32 mb-6 bg-neutral-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 group-hover:text-neutral-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-neutral-800" style={{ fontFamily: 'serif' }}>Recommendations</h3>
            <p className="text-sm font-light text-neutral-600 mb-6">Get personalized fragrance suggestions</p>
            <button className="w-full bg-neutral-800 text-white py-2.5 text-sm font-light tracking-wide hover:bg-neutral-900 transition">
              Explore
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white p-8 border border-neutral-200 hover:border-neutral-400 transition group">
            <div className="h-32 mb-6 bg-neutral-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400 group-hover:text-neutral-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-light mb-2 text-neutral-800" style={{ fontFamily: 'serif' }}>Your Profile</h3>
            <p className="text-sm font-light text-neutral-600 mb-6">View your preferences and insights</p>
            <button className="w-full bg-neutral-800 text-white py-2.5 text-sm font-light tracking-wide hover:bg-neutral-900 transition">
              View
            </button>
          </div>
        </div>

        {/* Memories Section */}
        <div className="border-t border-neutral-200 pt-16">
          {/* 3D Visualization */}
          {memories.length > 0 && (
            <div className="mb-16">
              <MemoryVisualization memories={memories} />
            </div>
          )}

          {/* Memories Grid */}
          <h2 className="text-3xl font-light mb-8 text-neutral-800" style={{ fontFamily: 'serif' }}>
            Your Memories
          </h2>
          <MemoriesList memories={memories} loading={loadingMemories} onRefresh={fetchMemories} />
        </div>
      </div>
      
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={fetchMemories}
      />
    </div>
  );
}