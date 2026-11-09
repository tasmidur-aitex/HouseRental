// Small inline SVG icons (no icon library needed).
const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const Icon = {
  Bed: (p) => (<svg {...base} {...p}><path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M3 14h18M7 9V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2" /></svg>),
  Bath: (p) => (<svg {...base} {...p}><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" /></svg>),
  Area: (p) => (<svg {...base} {...p}><path d="M4 4h16v16H4zM4 9h5M15 4v5" /></svg>),
  Pin: (p) => (<svg {...base} {...p}><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>),
  Heart: ({ filled, ...p }) => (<svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></svg>),
  Search: (p) => (<svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>),
  Home: (p) => (<svg {...base} {...p}><path d="m3 11 9-8 9 8M5 10v10h14V10" /></svg>),
  Menu: (p) => (<svg {...base} {...p}><path d="M4 6h16M4 12h16M4 18h16" /></svg>),
  Close: (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>),
  Check: (p) => (<svg {...base} {...p}><path d="m5 12 5 5 9-10" /></svg>),
  Phone: (p) => (<svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>),
  Mail: (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>),
};
