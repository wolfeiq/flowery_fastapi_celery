import React, { useMemo } from 'react';
import { Profile, NoteCount } from '@/lib/api';
import { NOTE_ICONS } from '@/components/FakeData';


interface ScentProfileProps {
  profile: Profile | null;
}

const getTopNotes = (notes?: NoteCount[], limit = 5): string[] => {
  if (!notes || notes.length === 0) return [];
  
  return [...notes]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(n => n.note);
};

const getIcon = (note: string): string => {
  const lowerNote = note.toLowerCase();
  
  if (NOTE_ICONS[lowerNote]) {
    return NOTE_ICONS[lowerNote];
  }


  if (lowerNote.includes('wood') || lowerNote.includes('cedar')) return '🪵';
  if (lowerNote.includes('flower') || lowerNote.includes('floral')) return '🌸';
  if (lowerNote.includes('citrus') || lowerNote.includes('fruit')) return '🍊';
  if (lowerNote.includes('spice')) return '🌶️';
  if (lowerNote.includes('sweet') || lowerNote.includes('sugar')) return '🍯';
  
  return '🌿';
};

const NoteSection = ({ 
  title, 
  description, 
  notes 
}: { 
  title: string; 
  description: string; 
  notes: string[] 
}) => (
  <div className="text-center px-4 py-6">
    <div className="mb-3">
      <span className="text-xs uppercase tracking-wider text-[#e89a9c] font-light">{title}</span>
      <p className="text-xs text-[#c98e8f]/70 mt-1">{description}</p>
    </div>
    <div className="flex flex-wrap justify-center gap-2">
      {notes.length > 0 ? (
        notes.map((note, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 bg-white/10 px-2 py-1 text-xs"
          >
            <span role="img" aria-label={note}>{getIcon(note)}</span>
            <span className="text-[#c98e8f]">{note}</span>
          </div>
        ))
      ) : (
        <p className="text-xs text-[#c98e8f]/50">No preferences yet</p>
      )}
    </div>
  </div>
);

const DislikedNote = ({ note }: { note: string }) => (
  <div className="flex items-center gap-2 bg-red-900/10 px-3 py-2">
    <span role="img" aria-label={note} className="text-xl">{getIcon(note)}</span>
    <span className="text-sm font-light text-red-300">{note}</span>
  </div>
);

const ScentProfile: React.FC<ScentProfileProps> = ({ profile }) => {
  const topNotes = useMemo(() => getTopNotes(profile?.top_notes), [profile?.top_notes]);
  const heartNotes = useMemo(() => getTopNotes(profile?.heart_notes), [profile?.heart_notes]);
  const baseNotes = useMemo(() => getTopNotes(profile?.base_notes), [profile?.base_notes]);

  return (
    <div className="space-y-8">
      <section aria-labelledby="fragrance-pyramid-title">
        <h3 id="fragrance-pyramid-title" className="sr-only">Fragrance Pyramid</h3>
        <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
          <svg 
            viewBox="0 0 400 450" 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
            aria-hidden="true"
          >
            <path
              d="M 200 20 L 380 430 L 20 430 Z"
              fill="none"
              stroke="#e89a9c"
              strokeWidth="2"
              opacity="0.6"
            />
            <line x1="110" y1="170" x2="290" y2="170" stroke="#c98e8f" strokeWidth="1" opacity="0.4" />
            <line x1="65" y1="300" x2="335" y2="300" stroke="#c98e8f" strokeWidth="1" opacity="0.4" />
          </svg>

          <div className="relative" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            <NoteSection 
              title="Top Notes" 
              description="First impression • 15-30 min"
              notes={topNotes}
            />
            <NoteSection 
              title="Heart Notes" 
              description="Core character • 2-4 hours"
              notes={heartNotes}
            />
            <NoteSection 
              title="Base Notes" 
              description="Lasting foundation • 4+ hours"
              notes={baseNotes}
            />
          </div>
        </div>
      </section>

      {profile?.disliked_notes && profile.disliked_notes.length > 0 && (
        <section className="border-t border-white/10 pt-6" aria-labelledby="disliked-notes-title">
          <h4 id="disliked-notes-title" className="text-lg font-light mb-4 text-red-300" style={{ fontFamily: 'serif' }}>
            Notes to Avoid
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.disliked_notes.map((note, i) => (
              <DislikedNote key={i} note={note} />
            ))}
          </div>
        </section>
      )}

      {profile?.preferred_families && profile.preferred_families.length > 0 && (
        <section className="border-t border-white/10 pt-6" aria-labelledby="preferred-families-title">
          <h4 id="preferred-families-title" className="text-lg font-light mb-4 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
            Preferred Fragrance Families
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.preferred_families.map((family, i) => (
              <span key={i} className="bg-[#c98e8f]/20 text-[#e89a9c] px-4 py-2 text-sm font-light">
                {family}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/10 pt-6">
        {profile?.intensity_preference && (
          <div>
            <h5 className="text-sm uppercase tracking-wider text-[#e89a9c] mb-2 font-light">Intensity</h5>
            <p className="text-[#c98e8f] font-light">{profile.intensity_preference}</p>
          </div>
        )}
        {profile?.budget_range && (
          <div>
            <h5 className="text-sm uppercase tracking-wider text-[#e89a9c] mb-2 font-light">Budget</h5>
            <p className="text-[#c98e8f] font-light">{profile.budget_range}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScentProfile;