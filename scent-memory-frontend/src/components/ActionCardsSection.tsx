import React, { useState } from 'react';
import UploadForm from '@/components/UploadModal';
import SearchForm from '@/components/SearchForm';
import { useMe, useLogout } from '@/hooks/useAuth';
import CurvedText from '@/components/Curve';
import { useQueryClient } from '@tanstack/react-query';
import { memoryKeys } from '@/hooks/useMemories';

interface ActionCardsProps {
}

export default function ActionCards() {
  const [showUpload, setShowUpload] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: user, isLoading } = useMe();
  const logout = useLogout();
  const queryClient = useQueryClient();


  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: memoryKeys.lists() });
    
  };

  if (!user) return null;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <CurvedText/>
          
          <div className="space-y-4">

            <div className="relative overflow-hidden backdrop-blur-sm border border-white/10 p-5 hover:border-white/20 transition">
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-light mb-1 text-[#d4a5a7]" style={{ fontFamily: 'serif' }}>
                    Upload Memory
                  </h3>
                  <p className="text-xs font-light text-[#b8999a]">
                    Add a new scent memory to your collection
                  </p>
                </div>
                <button 
                  onClick={() => setShowUpload(true)}  
                  className="px-6 py-2 bg-[#c69193] hover:bg-[#d4a5a7] text-white text-sm font-light tracking-wide transition"
                >
                  Upload
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden backdrop-blur-sm border border-white/10 p-5 hover:border-white/20 transition">
              <div className="relative z-10 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-white/5 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-light mb-1 text-[#d4a5a7]" style={{ fontFamily: 'serif' }}>
                    Recommendations
                  </h3>
                  <p className="text-xs font-light text-[#b8999a]">
                    Get personalized fragrance suggestions
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowSearch(true);
                    setShowUpload(false);
                  }}
                  className="px-6 py-2 bg-[#c69193] hover:bg-[#d4a5a7] text-white text-sm font-light tracking-wide transition"
                >
                  Explore
                </button>
              </div>
            </div>

            {showUpload && (
              <UploadForm
                onSuccess={handleSuccess}
                onClose={() => setShowUpload(false)}
              />
            )}

            {showSearch && (
              <SearchForm
                onClose={() => setShowSearch(false)}
              />
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}