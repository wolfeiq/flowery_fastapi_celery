'use client';

import { useState } from 'react';
import { musicApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface MusicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryId: string;
  memoryTitle: string;
}

export default function MusicLinkModal({ isOpen, onClose, memoryId, memoryTitle }: MusicLinkModalProps) {
  const [artist, setArtist] = useState('');
  const [track, setTrack] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await musicApi.link({
        memory_id: memoryId,
        artist_name: artist,
        track_name: track,
        spotify_url: spotifyUrl || undefined
      });
      toast.success('Song analysis started! This may take 10-20 seconds.');
      onClose();
      setArtist('');
      setTrack('');
      setSpotifyUrl('');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to link song');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="border-b border-neutral-200 p-8 flex justify-between items-center">
          <h2 className="text-3xl font-light text-neutral-800" style={{ fontFamily: 'serif' }}>
            Add Song
          </h2>
          <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-neutral-900 transition text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Memory title */}
        <div className="px-8 pt-6 pb-2">
          <p className="text-sm font-light text-neutral-600">
            Link a song to: <span className="text-neutral-800">{memoryTitle}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Artist Name *
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g., Taylor Swift"
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Song Title *
            </label>
            <input
              type="text"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder="e.g., Lover"
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Spotify URL (optional)
            </label>
            <input
              type="url"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/..."
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
            />
            <p className="text-xs font-light text-neutral-500 mt-2">
              Optional: Share link from Spotify app
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-neutral-300 hover:border-neutral-400 transition text-sm font-light tracking-wide"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-900 transition disabled:opacity-50 text-sm font-light tracking-wide"
            >
              {loading ? 'Analyzing...' : 'Link Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}