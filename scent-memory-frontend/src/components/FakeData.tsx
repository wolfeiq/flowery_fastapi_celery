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