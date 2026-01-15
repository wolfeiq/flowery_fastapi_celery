'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { queryApi, searchApi } from '@/lib/api'; // Adjust the import path to match your project

interface SearchFormProps {
  onClose: () => void;
}

export default function SearchForm({ onClose }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [queryId, setQueryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [dislikedNotes, setDislikedNotes] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setShowResponse(false);
    setRating(0);
    setFeedbackText('');
    setDislikedNotes('');
    setFeedbackSubmitted(false);

    try {
      const { data } = await queryApi.search(query);
      setResponse(data.response);
      setQueryId(data.query_id);
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
    setQueryId('');
    setShowResponse(false);
    setRating(0);
    setFeedbackText('');
    setDislikedNotes('');
    setFeedbackSubmitted(false);
  };

  const handleRatingClick = (star: number) => {
    setRating(star);
    setFeedbackSubmitted(false);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast.error('Please select a rating first');
      return;
    }

    try {
      const payload: {
        rating: number;
        feedback_text?: string;
        disliked_notes?: string[];
      } = {
        rating
      };

      if (feedbackText.trim()) {
        payload.feedback_text = feedbackText.trim();
      }

      if (rating <= 2 && dislikedNotes.trim()) {
        payload.disliked_notes = dislikedNotes
          .split(',')
          .map(note => note.trim().toLowerCase())
          .filter(note => note.length > 0);
      }

      await queryApi.feedback(queryId, payload);
      
      setFeedbackSubmitted(true);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error('Failed to submit feedback');
      console.error(error);
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

            {!feedbackSubmitted ? (
              <>
                {/* Rating */}
                <div>
                  <h4 className="text-sm font-light text-[#c98e8f] mb-3">Rate this recommendation:</h4>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                        type="button"
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

                {/* Disliked Notes - Only show if rating is 2 or below */}
                {rating > 0 && rating <= 2 && (
                  <div>
                    <label className="block text-sm font-light text-[#c98e8f] mb-2">
                      Which notes didn't you like? (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={dislikedNotes}
                      onChange={(e) => setDislikedNotes(e.target.value)}
                      placeholder="e.g., oud, patchouli, musk"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition"
                    />
                    <p className="mt-1 text-xs text-[#b8999a]/70">
                      We'll avoid recommending fragrances with these notes in the future
                    </p>
                  </div>
                )}

                {/* Additional Feedback - Only show if rating is selected */}
                {rating > 0 && (
                  <div>
                    <label className="block text-sm font-light text-[#c98e8f] mb-2">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us more about your experience..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition resize-none"
                      rows={3}
                    />
                  </div>
                )}

                {/* Submit Feedback Button */}
                {rating > 0 && (
                  <button
                    onClick={handleSubmitFeedback}
                    className="w-full px-6 py-3 bg-[#c69193] hover:bg-[#d4a5a7] text-white transition text-sm font-light tracking-wide"
                  >
                    Submit Feedback
                  </button>
                )}
              </>
            ) : (
              <div className="p-4 bg-[#c69193]/20 border border-[#c69193]/30 text-center">
                <p className="text-sm font-light text-[#e89a9c]">
                  ✓ Thank you for your feedback!
                </p>
              </div>
            )}

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