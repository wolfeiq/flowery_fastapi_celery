'use client';

import { useState, useEffect } from 'react';
import { memoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import MusicLinkModal from './MusicLinkModal';

interface Memory {
  id: string;
  title: string;
  occasion: string;
  memory_type: string;
  processed: boolean;
  created_at: string;
}

interface MemoriesListProps {
  memories?: Memory[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function MemoriesList({ memories = [], loading = false, onRefresh }: MemoriesListProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-light text-neutral-600">Loading memories...</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-16 text-center">
        <p className="text-neutral-600 font-light">No memories yet. Upload your first one to begin your journey.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="bg-white border border-neutral-200 hover:border-neutral-400 transition group"
          >
            {/* Image placeholder */}
            <div className="h-64 bg-neutral-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-16 h-16 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-light mb-3 text-neutral-800" style={{ fontFamily: 'serif' }}>
                {memory.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {memory.occasion && (
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-light tracking-wide">
                    {memory.occasion.toUpperCase()}
                  </span>
                )}
                <span className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-light tracking-wide">
                  {memory.memory_type.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {memory.processed ? (
                  <span className="text-xs font-light text-neutral-500">
                    ✓ Processed
                  </span>
                ) : (
                  <span className="text-xs font-light text-neutral-500">
                    Processing...
                  </span>
                )}
                
                {memory.processed && (
                  <button
                    onClick={() => setSelectedMemory(memory)}
                    className="text-xs font-light text-neutral-700 hover:text-neutral-900 transition tracking-wide"
                  >
                    ADD SONG →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMemory && (
        <MusicLinkModal
          isOpen={true}
          onClose={() => setSelectedMemory(null)}
          memoryId={selectedMemory.id}
          memoryTitle={selectedMemory.title}
        />
      )}
    </>
  );
}