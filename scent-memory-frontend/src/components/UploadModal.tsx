'use client';

import { useState } from 'react';
import { useUploadMemory } from '@/hooks/useMemories';

interface UploadFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function UploadForm({ onSuccess, onClose }: UploadFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [occasion, setOccasion] = useState('');
  const [emotion, setEmotion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const uploadMemory = useUploadMemory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (occasion) formData.append('occasion', occasion);
    if (emotion) formData.append('emotion', emotion);
    if (file) formData.append('file', file);

    uploadMemory.mutate(formData, {
      onSuccess: () => {
        onSuccess();
        onClose();
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setOccasion('');
    setEmotion('');
    setFile(null);
  };

  return (
    <div className="animate-fadeIn">
      <div className="border-b border-white/20 p-4 flex justify-between items-center">
        <h2 className="text-2xl font-light text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
          Upload Memory
        </h2>
        <button 
          onClick={onClose} 
          className="text-[#b8999a] hover:text-[#e89a9c] transition text-2xl font-light"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-xs font-light text-[#c98e8f] mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="A meaningful title for this memory"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition-colors text-sm"
            required
            disabled={uploadMemory.isPending}
          />
        </div>

        <div>
          <label className="block text-xs font-light text-[#c98e8f] mb-1">
            Description *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe this memory in detail..."
            className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition-colors resize-none text-sm"
            rows={4}
            required
            disabled={uploadMemory.isPending}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-light text-[#c98e8f] mb-1">
              Occasion
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g., Wedding, Date"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition-colors text-sm"
              disabled={uploadMemory.isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-light text-[#c98e8f] mb-1">
              Emotion
            </label>
            <input
              type="text"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="e.g., Romantic, Joyful"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 text-[#e89a9c] placeholder-[#b8999a]/50 focus:outline-none focus:border-white/20 transition-colors text-sm"
              disabled={uploadMemory.isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-light text-[#c98e8f] mb-1">
            Photo or PDF
          </label>
          <div className="border-2 border-dashed border-white/10 hover:border-white/20 transition p-4 text-center">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,application/pdf"
              className="hidden"
              id="file-upload"
              disabled={uploadMemory.isPending}
            />
            <label htmlFor="file-upload" className={uploadMemory.isPending ? 'cursor-not-allowed' : 'cursor-pointer'}>
              <svg className="w-8 h-8 text-[#b8999a] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-xs font-light text-[#c98e8f]">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs font-light text-[#b8999a] mt-0.5">
                PNG, JPG or PDF up to 10MB
              </p>
            </label>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={uploadMemory.isPending}
            className="flex-1 px-4 py-2 border border-white/10 hover:border-white/20 text-[#c98e8f] transition text-xs font-light tracking-wide disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadMemory.isPending}
            className="relative flex-1 px-4 py-2 border border-white/10 hover:border-white/20 text-white hover:opacity-90 transition disabled:opacity-50 text-xs font-light tracking-wide overflow-hidden"
          >
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: 'url(/pomme.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'bottom',
                opacity: 0.2
              }}
            />
            <span className="relative z-10">
              {uploadMemory.isPending ? 'Uploading...' : 'Upload Memory'}
            </span>
          </button>
        </div>
      </form>

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