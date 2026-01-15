import React from 'react';

interface ScentProfileProps {
  profile: {
    id?: string;
    user_id?: string;
    preferred_families?: string[];
    top_notes?: string[];
    heart_notes?: string[];
    base_notes?: string[];
    disliked_notes?: string[];
    intensity_preference?: string;
    emotional_preferences?: string[];
    budget_range?: string;
    total_memories?: number;
    total_queries?: number;
    profile_data?: any;
    last_updated?: string;
  } | null;
}

const ScentProfile: React.FC<ScentProfileProps> = ({ profile }) => {

  const noteImages = {
    'bergamot': '🍊',
    'lemon': '🍋',
    'lavender': '💜',
    'mint': '🌿',
    'grapefruit': '🍊',
    'orange': '🍊',
    'neroli': '🌸',
    'basil': '🌿',
    'aldehydes': '✨',

    'rose': '🌹',
    'jasmine': '🌸',
    'ylang ylang': '🌺',
    'geranium': '🌺',
    'lily': '🌷',
    'violet': '💜',
    'orchid': '🌸',
    'tuberose': '🌸',
    'iris': '💜',

    'sandalwood': '🪵',
    'vanilla': '🍦',
    'musk': '🤍',
    'amber': '🟡',
    'patchouli': '🍂',
    'cedar': '🌲',
    'vetiver': '🌾',
    'tonka bean': '🫘',
    'oud': '🪵',
    'oakmoss': '🌿',

    'default': '🌿'
  };

const getIcon = (note: string) => {
  const lowerNote = note.toLowerCase();
 
  if (noteImages[lowerNote as keyof typeof noteImages]) {
    return noteImages[lowerNote as keyof typeof noteImages];
  }

  if (lowerNote.includes('wood') || lowerNote.includes('cedar')) return '🪵';
  if (lowerNote.includes('flower') || lowerNote.includes('floral')) return '🌸';
  if (lowerNote.includes('citrus') || lowerNote.includes('fruit')) return '🍊';
  if (lowerNote.includes('spice')) return '🌶️';
  if (lowerNote.includes('sweet') || lowerNote.includes('sugar')) return '🍯';
  
  return '🌿';
};

  const DislikedNote = ({ note }: { note: string }) => (
    <div className="flex items-center gap-2 bg-red-900/10 px-3 py-2 border border-red-400/20 hover:border-red-400/40 transition">
      <span className="text-xl">{getIcon(note)}</span>
      <span className="text-sm font-light text-red-300">{note}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Fragrance Pyramid */}
      <div className="relative">
        <h3 className="text-2xl font-light mb-8 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
          Your Fragrance Pyramid
        </h3>
        
        {/* Triangle Container with SVG Border */}
        <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
          {/* SVG Triangle Outline */}
          <svg 
            viewBox="0 0 400 450" 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 10 }}
          >
            <path
              d="M 200 20 L 380 430 L 20 430 Z"
              fill="none"
              stroke="#e89a9c"
              strokeWidth="2"
              opacity="0.6"
            />
            {/* Horizontal dividers */}
            <line x1="110" y1="170" x2="290" y2="170" stroke="#c98e8f" strokeWidth="1" opacity="0.4" />
            <line x1="65" y1="300" x2="335" y2="300" stroke="#c98e8f" strokeWidth="1" opacity="0.4" />
          </svg>

          {/* Content Sections */}
          <div className="relative" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
            {/* Top Notes */}
            <div className="text-center px-8 py-6 mb-4">
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider text-[#e89a9c] font-light">Top Notes</span>
                <p className="text-xs text-[#c98e8f]/70 mt-1">First impression • 15-30 min</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {profile?.top_notes?.length ? (
                  profile.top_notes.map((note, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/10 px-2 py-1 text-xs border border-white/20">
                      <span>{getIcon(note)}</span>
                      <span className="text-[#c98e8f]">{note}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#c98e8f]/50">No preferences yet</p>
                )}
              </div>
            </div>

            {/* Heart Notes */}
            <div className="text-center px-6 py-6 mb-4">
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider text-[#e89a9c] font-light">Heart Notes</span>
                <p className="text-xs text-[#c98e8f]/70 mt-1">Core character • 2-4 hours</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {profile?.heart_notes?.length ? (
                  profile.heart_notes.map((note, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/10 px-2 py-1 text-xs border border-white/20">
                      <span>{getIcon(note)}</span>
                      <span className="text-[#c98e8f]">{note}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#c98e8f]/50">No preferences yet</p>
                )}
              </div>
            </div>

            {/* Base Notes */}
            <div className="text-center px-4 py-6">
              <div className="mb-3">
                <span className="text-xs uppercase tracking-wider text-[#e89a9c] font-light">Base Notes</span>
                <p className="text-xs text-[#c98e8f]/70 mt-1">Lasting foundation • 4+ hours</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {profile?.base_notes?.length ? (
                  profile.base_notes.map((note, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-white/10 px-2 py-1 text-xs border border-white/20">
                      <span>{getIcon(note)}</span>
                      <span className="text-[#c98e8f]">{note}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#c98e8f]/50">No preferences yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disliked Notes */}
      {profile?.disliked_notes && profile.disliked_notes.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-light mb-4 text-red-300" style={{ fontFamily: 'serif' }}>
            Notes to Avoid
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.disliked_notes.map((note, i) => (
              <DislikedNote key={i} note={note} />
            ))}
          </div>
        </div>
      )}

      {/* Preferred Families */}
      {profile?.preferred_families && profile.preferred_families.length > 0 && (
        <div className="border-t border-white/10 pt-6">
          <h4 className="text-lg font-light mb-4 text-[#e89a9c]" style={{ fontFamily: 'serif' }}>
            Preferred Fragrance Families
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.preferred_families.map((family, i) => (
              <span key={i} className="bg-[#c98e8f]/20 text-[#e89a9c] px-4 py-2 text-sm font-light border border-[#c98e8f]/30">
                {family}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Preferences */}
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