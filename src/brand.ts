// Single source of truth for anything that identifies the event, shared by the
// DOM and the canvas so the exported image always matches the site.

export const EVENT = {
  name: 'HACKER HOUSE',
  /** The event is "Hacker House Goa" — use this anywhere the name stands alone. */
  fullName: 'HACKER HOUSE GOA',
  city: 'GOA',
  cityLocal: 'गोवा',
  year: '2026',
  dates: '28—31 OCT 2026',
  place: 'GOA, INDIA',
  hashtag: '#FrameInGoa',
  handle: 'HH GOA 2026',
} as const;

export type ThemeName = 'lime' | 'sunset' | 'ocean' | 'midnight';

export type Theme = {
  label: string;
  note: string;
  /** Deep base the artwork sits on. */
  ink: string;
  /** Primary highlight — borders, rules, seals. */
  gold: string;
  /** Secondary highlight — accents and the hashtag. */
  hot: string;
  /** Paper tone used for body text on the ink. */
  paper: string;
  /** Low-contrast line colour for grids and hairlines. */
  rule: string;
  /** Swatch shown in the UI picker. */
  swatch: [string, string, string];
};

export const THEMES: Record<ThemeName, Theme> = {
  lime: {
    label: 'Palm Green',
    note: 'the house default',
    ink: '#075B3A',
    gold: '#FFD400',
    hot: '#FF2D78',
    paper: '#F5EEDC',
    rule: '#1E7A54',
    swatch: ['#075B3A', '#FFD400', '#FF2D78'],
  },
  sunset: {
    label: 'Anjuna Sunset',
    note: 'golden hour',
    ink: '#7A2340',
    gold: '#FFB34D',
    hot: '#FF5C7A',
    paper: '#FFF1DC',
    rule: '#9C3C58',
    swatch: ['#7A2340', '#FFB34D', '#FF5C7A'],
  },
  ocean: {
    label: 'Arabian Sea',
    note: 'deep water',
    ink: '#063F4A',
    gold: '#6FE3D2',
    hot: '#FFD400',
    paper: '#EEF7F3',
    rule: '#12626E',
    swatch: ['#063F4A', '#6FE3D2', '#FFD400'],
  },
  midnight: {
    label: 'Night Shift',
    note: 'after 2am',
    ink: '#12102A',
    gold: '#C9F24D',
    hot: '#FF4FD8',
    paper: '#EDEBFF',
    rule: '#2C2857',
    swatch: ['#12102A', '#C9F24D', '#FF4FD8'],
  },
};

export const THEME_ORDER: ThemeName[] = ['lime', 'sunset', 'ocean', 'midnight'];
