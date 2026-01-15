'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

interface SearchFormProps {
  onClose: () => void;
}

export default function SearchForm({ onClose }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowResponse(false);
    setRating(0);

    try {
      // Replace with your actual API endpoint
      const res = await fetch('/api/perfume-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      setResponse(data.response);
      setShowResponse(true);
    } catch (error) {
      toast.error('Failed to get recommendations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuery = () => {
    setQuery('');
    setResponse('');
    setShowResponse(false);
    setRating(0);
  };

  const handleRating = async (star: number) => {
    setRating(star);
    
    try {
      // Send rating to backend
      await fetch('/api/perfume-query/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, response, rating: star })
      });
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit rating');
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="border-b border-white/20 p-8 flex justify-between items-center">
        <h3 className="text-2xl font-light text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
          Perfume Recommendations
        </h3>
        <button 
          onClick={onClose}
          className="text-[#b8999a] hover:text-[#d4a5a7] text-2xl"
        >
          ×
        </button>
      </div>

      <div className="p-8 space-y-6">
        {/* Query Input */}
        {!showResponse && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-light text-[#c98e8f] mb-2">
                What kind of perfume are you looking for?
              </label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I want a romantic floral scent for evening wear..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition resize-none"
                rows={4}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full px-6 py-3 bg-[#c69193] hover:bg-[#d4a5a7] text-white transition disabled:opacity-50 text-sm font-light tracking-wide"
            >
              {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
            </button>
          </form>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Response Display */}
        {showResponse && !loading && (
          <div className="space-y-6">
            {/* Query */}
            <div>
              <h4 className="text-sm font-light text-[#c98e8f] mb-2">Your Query:</h4>
              <div className="p-4 bg-[#c69193]/20 border border-[#c69193]/30">
                <p className="text-sm font-light text-[#e89a9c]">{query}</p>
              </div>
            </div>

            {/* LLM Response */}
            <div>
              <h4 className="text-sm font-light text-[#c98e8f] mb-2">Recommendations:</h4>
              <div className="p-6 bg-white/5 border border-white/10">
                <p className="text-sm font-light text-[#e89a9c] whitespace-pre-wrap leading-relaxed">
                  {response}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h4 className="text-sm font-light text-[#c98e8f] mb-3">Rate this recommendation:</h4>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className="w-8 h-8"
                      fill={(hoveredRating || rating) >= star ? '#c69193' : 'none'}
                      stroke={(hoveredRating || rating) >= star ? '#c69193' : '#b8999a'}
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-light text-[#c98e8f]">
                    {rating} out of 5
                  </span>
                )}
              </div>
            </div>

            {/* New Query Button */}
            <button
              onClick={handleNewQuery}
              className="w-full px-6 py-3 border border-white/10 hover:border-white/20 text-[#c98e8f] transition text-sm font-light tracking-wide"
            >
              New Query
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}