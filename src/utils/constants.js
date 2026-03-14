export const DAY_COLORS = [
  '#3b82f6', // Day 1 - Blue (primary)
  '#ef4444', // Day 2 - Red
  '#10b981', // Day 3 - Emerald
  '#f59e0b', // Day 4 - Amber
  '#8b5cf6', // Day 5 - Violet
  '#ec4899', // Day 6 - Pink
  '#06b6d4', // Day 7 - Cyan
  '#84cc16', // Day 8 - Lime
  '#f97316', // Day 9 - Orange
  '#6366f1', // Day 10 - Indigo
];

export function getDayColor(dayNumber) {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

export const MAX_DAYS = 14;
export const MAX_PINS_PER_DAY = 20;

export const PIN_CATEGORIES = [
  { value: 'restoran', label: 'Restoran', icon: 'FiCoffee' },
  { value: 'turistik', label: 'Turistik Yer', icon: 'FiCamera' },
  { value: 'otel', label: 'Otel', icon: 'FiBriefcase' },
  { value: 'ulasim', label: 'Ulasim', icon: 'FiTruck' },
  { value: 'alisveris', label: 'Alisveris', icon: 'FiShoppingBag' },
  { value: 'diger', label: 'Diger', icon: 'FiMapPin' },
];

export const CURRENCIES = [
  { value: 'TRY', label: 'TRY (₺)', symbol: '₺' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'CHF', label: 'CHF (Fr)', symbol: 'Fr' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AED', label: 'AED (د.إ)', symbol: 'د.إ' },
  { value: 'SAR', label: 'SAR (﷼)', symbol: '﷼' },
  { value: 'CNY', label: 'CNY (¥)', symbol: '¥' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
  { value: 'RUB', label: 'RUB (₽)', symbol: '₽' },
  { value: 'THB', label: 'THB (฿)', symbol: '฿' },
];

export function getCurrencySymbol(currencyCode) {
  const found = CURRENCIES.find((c) => c.value === currencyCode);
  return found ? found.symbol : currencyCode;
}

export function getCategoryLabel(categoryValue) {
  const found = PIN_CATEGORIES.find((c) => c.value === categoryValue);
  return found ? found.label : '';
}

export const MAX_PHOTOS_PER_PIN = 5;
export const MAX_PHOTO_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PROFILE_TABS = [
  { value: 'routes', label: 'Rotalarim' },
  { value: 'saved', label: 'Kaydedilenler' },
];

export const MAX_AVATAR_SIZE_MB = 2;

// ─── TRACKING ───────────────────────────────────────────
export const PROXIMITY_RADIUS_METERS = 200;

export const TRACKING_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

// ─── BADGES ─────────────────────────────────────────────
export const BADGES = [
  { id: 'first_track', label: 'Ilk Adim', description: 'Ilk rotani takip etmeye basla', icon: 'FiFlag', condition: 'trackingStarted', threshold: 1 },
  { id: 'first_complete', label: 'Kasif', description: 'Ilk rotani tamamla', icon: 'FiAward', condition: 'routesCompleted', threshold: 1 },
  { id: 'five_pins', label: 'Pin Avcisi', description: '5 pin ziyaret et', icon: 'FiMapPin', condition: 'pinsVisited', threshold: 5 },
  { id: 'twenty_pins', label: 'Gezgin', description: '20 pin ziyaret et', icon: 'FiCompass', condition: 'pinsVisited', threshold: 20 },
  { id: 'fifty_pins', label: 'Profesyonel Gezgin', description: '50 pin ziyaret et', icon: 'FiGlobe', condition: 'pinsVisited', threshold: 50 },
  { id: 'three_routes', label: 'Rota Ustasi', description: '3 rotayi tamamla', icon: 'FiTrendingUp', condition: 'routesCompleted', threshold: 3 },
  { id: 'route_creator_5', label: 'Rehber', description: '5 rota olustur', icon: 'FiEdit2', condition: 'routesCreated', threshold: 5 },
  { id: 'social_butterfly', label: 'Sosyal Kelebek', description: '10 takipci kazan', icon: 'FiUsers', condition: 'followers', threshold: 10 },
];
