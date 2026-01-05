'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import UploadModal from '@/components/UploadModal';
import { useWebSocket } from "@/hooks/websockets";

export default function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();


  useWebSocket(user?.id);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-600"></div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-purple-900">Scent Memory</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user.full_name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upload Memory Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Upload Memory</h2>
            <p className="text-gray-600 mb-4">Add a scent memory</p>
            <button
              onClick={() => setShowUpload(true)}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Upload
            </button>
          </div>

          {/* Music/Spotify/Genius API */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Fragrance based on Spotify</h2>
            <p className="text-gray-600 mb-4">Add a song link & get a matching perfume</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              Upload
            </button>
          </div>

          {/* Query Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Get Recommendations</h2>
            <p className="text-gray-600 mb-4">Ask for perfume suggestions</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              Query
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            <p className="text-gray-600 mb-4">View learned preferences</p>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              View Profile
            </button>
          </div>
        </div>
      </div>
      
      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={() => {/* refresh memories list */}}
      />
    </div>
  );
}