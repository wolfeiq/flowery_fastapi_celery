export const FAKE_SCENT_PROFILE = {
  preferred_families: ['Floral', 'Citrus', 'Woody', 'Oriental'],
  top_notes: [
    { note: 'Bergamot', count: 12 },
    { note: 'Lemon', count: 8 },
    { note: 'Lavender', count: 6 },
    { note: 'Jasmine', count: 5 },
    { note: 'Mint', count: 4 },
  ],
  heart_notes: [
    { note: 'Rose', count: 10 },
    { note: 'Lily', count: 7 },
    { note: 'Peony', count: 5 },
    { note: 'Violet', count: 4 },
    { note: 'Geranium', count: 3 },
  ],
  base_notes: [
    { note: 'Sandalwood', count: 11 },
    { note: 'Vanilla', count: 9 },
    { note: 'Cedar', count: 6 },
    { note: 'Amber', count: 5 },
    { note: 'Musk', count: 4 },
  ],
  disliked_notes: ['Patchouli', 'Tonka Bean'],
  emotional_preferences: ['Romantic', 'Tranquil'],
  total_memories: 42,
  total_queries: 18,
  last_updated: '2026-01-18',
};

export const FAKE_MEMORIES = [
  {
    title: 'Summer Beach',
    processed: true,
    emotion: 'Joyful',
    extracted_scents: [
      {
        scent_name: 'Citrus Breeze',
        scent_family: 'citrus',
        top_notes: ['lemon', 'bergamot'],
        heart_notes: ['jasmine', 'rose'],
        base_notes: ['cedar', 'musk'],
        color: '#FFE066'
      }
    ]
  },
  {
    title: 'Evening Walk',
    processed: true,
    emotion: 'Calm',
    extracted_scents: [
      {
        scent_name: 'Woody Forest',
        scent_family: 'woody',
        top_notes: ['pine', 'bamboo'],
        heart_notes: ['cedar', 'sandalwood'],
        base_notes: ['amber', 'vanilla'],
        color: '#8B6F47'
      }
    ]
  },
  {
    title: 'Coffee Morning',
    processed: true,
    emotion: 'Relaxed',
    extracted_scents: [
      {
        scent_name: 'Warm Espresso',
        scent_family: 'oriental',
        top_notes: ['cinnamon', 'coffee'],
        heart_notes: ['vanilla', 'tonka'],
        base_notes: ['amber', 'musk'],
        color: '#B8860B'
      }
    ]
  },
  {
    title: 'Garden Picnic',
    processed: true,
    emotion: 'Happy',
    extracted_scents: [
      {
        scent_name: 'Floral Garden',
        scent_family: 'floral',
        top_notes: ['rose', 'lily'],
        heart_notes: ['peony', 'jasmine'],
        base_notes: ['cedar', 'sandalwood'],
        color: '#FFB5D8'
      }
    ]
  },

  {
    title: 'Rainy Window',
    processed: true,
    emotion: 'Reflective',
    extracted_scents: [
      {
        scent_name: 'Soft Rain',
        scent_family: 'fresh',
        top_notes: ['rain accord', 'aldehydes'],
        heart_notes: ['violet', 'iris'],
        base_notes: ['musk', 'ambergris'],
        color: '#AFCBFF'
      }
    ]
  },
  {
    title: 'Late Night Library',
    processed: true,
    emotion: 'Focused',
    extracted_scents: [
      {
        scent_name: 'Old Pages',
        scent_family: 'woody',
        top_notes: ['paper', 'dust'],
        heart_notes: ['cedarwood', 'vetiver'],
        base_notes: ['leather', 'amber'],
        color: '#6B5E62'
      }
    ]
  },
  {
    title: 'Winter Scarf',
    processed: true,
    emotion: 'Comforted',
    extracted_scents: [
      {
        scent_name: 'Cashmere Warmth',
        scent_family: 'soft oriental',
        top_notes: ['pink pepper', 'cardamom'],
        heart_notes: ['cashmere wood', 'orris'],
        base_notes: ['vanilla', 'white musk'],
        color: '#E6D9C8'
      }
    ]
  },
  {
    title: 'Midnight Drive',
    processed: true,
    emotion: 'Free',
    extracted_scents: [
      {
        scent_name: 'Night Asphalt',
        scent_family: 'aromatic',
        top_notes: ['ozonic air', 'eucalyptus'],
        heart_notes: ['lavender', 'sage'],
        base_notes: ['patchouli', 'tonka'],
        color: '#2F3E46'
      }
    ]
  },
  {
    title: 'Old Love Letter',
    processed: true,
    emotion: 'Nostalgic',
    extracted_scents: [
      {
        scent_name: 'Faded Ink',
        scent_family: 'powdery',
        top_notes: ['heliotrope', 'almond'],
        heart_notes: ['rose absolute', 'violet'],
        base_notes: ['vanilla', 'soft woods'],
        color: '#D8BFD8'
      }
    ]
  },
  {
    title: 'Fresh Sheets',
    processed: true,
    emotion: 'Peaceful',
    extracted_scents: [
      {
        scent_name: 'Clean Linen',
        scent_family: 'clean',
        top_notes: ['aldehydes', 'lemon zest'],
        heart_notes: ['cotton flower', 'lavender'],
        base_notes: ['white musk', 'sandalwood'],
        color: '#F5F9FF'
      }
    ]
  },
  {
    title: 'Sunset Train Ride',
    processed: true,
    emotion: 'Dreamy',
    extracted_scents: [
      {
        scent_name: 'Golden Hour',
        scent_family: 'amber',
        top_notes: ['mandarin', 'saffron'],
        heart_notes: ['orange blossom', 'jasmine'],
        base_notes: ['amber', 'benzoin'],
        color: '#FF9F1C'
      }
    ]
  }
];


export const NOTE_ICONS: Record<string, string> = {
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
};