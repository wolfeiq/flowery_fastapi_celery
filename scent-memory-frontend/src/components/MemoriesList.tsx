import { useState, useMemo } from 'react';
import { Memory } from '@/lib/api';

interface MemoriesListProps {
  memories?: Memory[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function MemoriesList({ memories = [], loading = false, onRefresh }: MemoriesListProps) {
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set());

  const toggleMemory = (memoryId: string) => {
    setExpandedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(memoryId)) {
        newSet.delete(memoryId);
      } else {
        newSet.add(memoryId);
      }
      return newSet;
    });
  };

  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [memories]);

  if (loading) {
    return (
      <div className="h-[800px] flex items-center justify-center">
        <p className="text-sm font-light text-[#c98e8f]">Loading memories...</p>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="h-[800px] flex items-center justify-center">
        <p className="text-[#c98e8f] font-light px-8 text-center">
          No memories yet. Upload your first one to begin your journey.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-[800px] overflow-y-auto pr-2 hide-scrollbar relative mask-fade-bottom">
        <div className="space-y-3 pb-32">
          {sortedMemories.map((memory) => {
            const primaryScent = memory.extracted_scents?.[0];
            const scentColor = primaryScent?.color || '#c98e8f';
            const scentEmotion = primaryScent?.emotion;
            const memoryEmotion = memory.emotion;
            const isExpanded = expandedMemories.has(memory.id);
            
            return (
              <div key={memory.id} className="group relative">
                {/* Bullet point with color blur */}
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full" 
                  style={{ 
                    backgroundColor: scentColor,
                    boxShadow: `0 0 20px 4px ${scentColor}, 0 0 35px 8px ${scentColor}80, 0 0 50px 12px ${scentColor}40`
                  }}
                  aria-hidden="true"
                />

                <div className="pl-8 py-3 border-l-2 border-white/10 hover:border-[#c98e8f]/50 hover:bg-white/5 transition">
                  <div 
                    onClick={() => memory.content && toggleMemory(memory.id)}
                    className={memory.content ? "cursor-pointer" : ""}
                    role={memory.content ? "button" : undefined}
                    tabIndex={memory.content ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (memory.content && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleMemory(memory.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-light mb-1 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
                        {memory.title}
                      </h3>
                      {memory.content && (
                        <button 
                          className="text-[#c98e8f]/60 hover:text-[#e89a9c] transition flex-shrink-0 mt-0.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMemory(memory.id);
                          }}
                          aria-label={isExpanded ? "Collapse memory" : "Expand memory"}
                          aria-expanded={isExpanded}
                        >
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {memory.content && (
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] mb-2' : 'max-h-0'}`}>
                        <p className="text-xs text-[#c98e8f]/70 font-light pt-2 leading-relaxed whitespace-pre-wrap">
                          {memory.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {primaryScent && (
                    <div className="mb-2 space-y-1">
                      {primaryScent.scent_name && (
                        <p className="text-xs text-[#e89a9c]/80 font-light">
                          <span className="opacity-60">Scent:</span> {primaryScent.scent_name}
                          {primaryScent.brand && <span className="opacity-60"> by {primaryScent.brand}</span>}
                        </p>
                      )}
                      
                      {primaryScent.scent_family && (
                        <p className="text-xs text-[#e89a9c]/70 font-light">
                          <span className="opacity-60">Family:</span> {primaryScent.scent_family}
                        </p>
                      )}
                      
                      {(primaryScent.top_notes || primaryScent.heart_notes || primaryScent.base_notes) && (
                        <div className="text-xs text-[#c98e8f]/60 font-light space-y-0.5">
                          {primaryScent.top_notes && primaryScent.top_notes.length > 0 && (
                            <p><span className="opacity-60">Top:</span> {primaryScent.top_notes.join(', ')}</p>
                          )}
                          {primaryScent.heart_notes && primaryScent.heart_notes.length > 0 && (
                            <p><span className="opacity-60">Heart:</span> {primaryScent.heart_notes.join(', ')}</p>
                          )}
                          {primaryScent.base_notes && primaryScent.base_notes.length > 0 && (
                            <p><span className="opacity-60">Base:</span> {primaryScent.base_notes.join(', ')}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

  
                  {(scentEmotion || memoryEmotion) && (
                    <p className="text-xs text-[#e89a9c]/70 mb-2 font-light italic">
                      <span className="opacity-60">Emotion:</span> {scentEmotion || memoryEmotion}
                    </p>
                  )}

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
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .mask-fade-bottom {
          -webkit-mask-image: linear-gradient(to bottom, black calc(100% - 120px), transparent 100%);
          mask-image: linear-gradient(to bottom, black calc(100% - 120px), transparent 100%);
        }
      `}</style>
    </>
  );
}