'use client';

import { useState } from 'react';
import { memoriesApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [occasion, setOccasion] = useState('');
  const [emotion, setEmotion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (occasion) formData.append('occasion', occasion);
    if (emotion) formData.append('emotion', emotion);
    if (file) formData.append('file', file);

    try {
      await memoriesApi.upload(formData);
      toast.success('Memory uploaded! Processing...');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setOccasion('');
    setEmotion('');
    setFile(null);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="border-b border-neutral-200 p-8 flex justify-between items-center">
          <h2 className="text-3xl font-light text-neutral-800" style={{ fontFamily: 'serif' }}>
            Upload Memory
          </h2>
          <button 
            onClick={onClose} 
            className="text-neutral-500 hover:text-neutral-900 transition text-2xl font-light"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A meaningful title for this memory"
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Description *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe this memory in detail..."
              className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors resize-none"
              rows={6}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Occasion
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g., Wedding, Date"
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-neutral-700 mb-2">
                Emotion
              </label>
              <input
                type="text"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                placeholder="e.g., Romantic, Joyful"
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-light text-neutral-700 mb-2">
              Photo or PDF
            </label>
            <div className="border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition p-8 text-center">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept="image/*,application/pdf"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-light text-neutral-600">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs font-light text-neutral-500 mt-1">
                  PNG, JPG or PDF up to 10MB
                </p>
              </label>
            </div>
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
              {loading ? 'Uploading...' : 'Upload Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}