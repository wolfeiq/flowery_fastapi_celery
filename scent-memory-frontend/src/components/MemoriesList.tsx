import { useState } from 'react';

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
  if (loading) {
    return (
      <div className="h-[600px] flex items-center justify-center">
        <p className="text-sm font-light text-[#c98e8f]">Loading memories...</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="h-[700px] flex items-center justify-center">
        <p className="text-[#c98e8f] font-light px-8 text-center">No memories yet. Upload your first one to begin your journey.</p>
      </div>
    );
  }

  return (
    <div className="h-[700px] overflow-y-auto pr-2 hide-scrollbar">

      <div className="space-y-3">
        {memories.map((memory) => (
          <div
            key={memory.id}
            className="group relative"
          >
            {/* Bullet point */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#c98e8f]"></div>
            
            {/* Content */}
            <div className="pl-6 py-3 border-l-2 border-white/10 hover:border-[#c98e8f]/50 hover:bg-white/5 transition">
              <h3 className="text-base font-light mb-1 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
                {memory.title}
              </h3>
              
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#c98e8f]/70">
                {memory.occasion && (
                  <>
                    <span className="font-light">{memory.occasion}</span>
                    <span>•</span>
                  </>
                )}
                <span className="font-light">{memory.memory_type}</span>
                <span>•</span>
                {memory.processed ? (
                  <span className="text-[#e89a9c] flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Processed
                  </span>
                ) : (
                  <span className="text-[#c98e8f]/50 animate-pulse">Processing...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
      .hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;     /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;             /* Chrome, Safari */
}

        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        .custom-scrollbar:hover {
          scrollbar-color: #c98e8f transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 0px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #c98e8f;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb:hover {
          background: #e89a9c;
        }
      `}</style>
    </div>
  );
}
