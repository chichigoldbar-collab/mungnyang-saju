const premiumHistoryMap = new Map<string, string[]>();

export function getRecentPremiumTexts(key: string, limit = 10) {
  const items = premiumHistoryMap.get(key) ?? [];
  return items.slice(-limit);
}

export function saveRecentPremiumTexts(key: string, texts: string[]) {
  const prev = premiumHistoryMap.get(key) ?? [];
  const next = [...prev, ...texts].slice(-30);
  premiumHistoryMap.set(key, next);
}