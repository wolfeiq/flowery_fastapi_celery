'use client';

import { useState, FormEvent } from 'react';
import { useSearchMemories, useQueryFeedback } from '@/hooks/useSearchQuery';

interface SearchFormProps {
  onClose: () => void;
}

export default function SearchForm({ onClose }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [queryId, setQueryId] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [dislikedNotes, setDislikedNotes] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const searchMemories = useSearchMemories();
  const submitFeedback = useQueryFeedback();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setShowResponse(false);
    setRating(0);
    setFeedbackText('');
    setDislikedNotes('');
    setFeedbackSubmitted(false);

    searchMemories.mutate(query, {
      onSuccess: (data) => {
        setResponse(data.response);
        setQueryId(data.query_id);
        setShowResponse(true);
      },
    });
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
    if (rating === 0) return;

    const dislikedNotesArray = rating <= 2 && dislikedNotes.trim()
      ? dislikedNotes.split(',').map(note => note.trim().toLowerCase()).filter(Boolean)
      : undefined;

    submitFeedback.mutate(
      { 
        queryId, 
        feedback: {
          rating,
          feedback_text: feedbackText.trim() || undefined,
          disliked_notes: dislikedNotesArray,
        }
      },
      {
        onSuccess: () => {
          setFeedbackSubmitted(true);
        },
      }
    );
  };

  return (
    <div className="animate-fadeIn">
      <header className="border-b border-white/20 p-4 flex justify-between items-center">
        <h3 className="text-xl font-light text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
          Perfume Recommendations
        </h3>
        <button 
          type="button"
          onClick={onClose}
          className="text-[#b8999a] hover:text-[#d4a5a7] text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="p-4 space-y-4">
        {!showResponse && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="query-input" className="block text-xs font-light text-[#c98e8f] mb-1">
                What kind of perfume are you looking for?
              </label>
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I want a romantic floral scent for evening wear..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition resize-none text-sm"
                rows={3}
                disabled={searchMemories.isPending}
              />
            </div>

            <button
              type="submit"
              disabled={searchMemories.isPending || !query.trim()}
              className="w-full px-4 py-2 bg-[#c69193] hover:bg-[#d4a5a7] text-white transition disabled:opacity-50 text-xs font-light tracking-wide"
            >
              {searchMemories.isPending ? 'Getting Recommendations...' : 'Get Recommendations'}
            </button>
          </form>
        )}

        {searchMemories.isPending && (
          <div className="flex items-center justify-center py-6" role="status" aria-live="polite">
            <span className="sr-only">Loading recommendations...</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#c69193] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {showResponse && !searchMemories.isPending && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-light text-[#c98e8f] mb-1">Your Query:</h4>
              <div className="p-3 bg-[#c69193]/20 border border-[#c69193]/30">
                <p className="text-xs font-light text-[#e89a9c]">{query}</p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-light text-[#c98e8f] mb-1">Recommendations:</h4>
              <div className="p-4 bg-white/5 border border-white/10 max-h-64 overflow-y-auto">
                <p className="text-xs font-light text-[#e89a9c] whitespace-pre-wrap leading-relaxed">
                  {response}
                </p>
              </div>
            </div>

            {!feedbackSubmitted ? (
              <>
                <div>
                  <h4 className="text-xs font-light text-[#c98e8f] mb-2">Rate this recommendation:</h4>
                  <div className="flex items-center gap-2" role="group" aria-label="Rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-transform hover:scale-110"
                        type="button"
                        disabled={submitFeedback.isPending}
                        aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        aria-pressed={rating === star}
                      >
                        <svg
                          className="w-6 h-6"
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
                      <span className="ml-2 text-xs font-light text-[#c98e8f]">
                        {rating} out of 5
                      </span>
                    )}
                  </div>
                </div>

                {rating > 0 && rating <= 2 && (
                  <div>
                    <label htmlFor="disliked-notes" className="block text-xs font-light text-[#c98e8f] mb-1">
                      Which notes didn't you like? (comma-separated)
                    </label>
                    <input
                      id="disliked-notes"
                      type="text"
                      value={dislikedNotes}
                      onChange={(e) => setDislikedNotes(e.target.value)}
                      placeholder="e.g., oud, patchouli, musk"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition text-sm"
                      disabled={submitFeedback.isPending}
                    />
                    <p className="mt-1 text-xs text-[#b8999a]/70">
                      We'll avoid recommending fragrances with these notes in the future
                    </p>
                  </div>
                )}

                {rating > 0 && (
                  <div>
                    <label htmlFor="feedback-text" className="block text-xs font-light text-[#c98e8f] mb-1">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      id="feedback-text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Tell us more about your experience..."
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition resize-none text-sm"
                      rows={2}
                      disabled={submitFeedback.isPending}
                    />
                  </div>
                )}

                {rating > 0 && (
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submitFeedback.isPending}
                    className="w-full px-4 py-2 bg-[#c69193] hover:bg-[#d4a5a7] text-white transition text-xs font-light tracking-wide disabled:opacity-50"
                  >
                    {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                )}
              </>
            ) : (
              <div className="p-3 bg-[#c69193]/20 border border-[#c69193]/30 text-center" role="status">
                <p className="text-xs font-light text-[#e89a9c]">
                  ✓ Thank you for your feedback!
                </p>
              </div>
            )}
            <button
              onClick={handleNewQuery}
              className="w-full px-4 py-2 border border-white/10 hover:border-white/20 text-[#c98e8f] transition text-xs font-light tracking-wide"
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