type FortuneHistoryItem = {
  petId: string;
  dateKey: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

const historyMap = new Map<string, FortuneHistoryItem[]>();

export function getRecentFortuneHistory(petId: string, limit = 7) {
  const items = historyMap.get(petId) ?? [];
  return items.slice(-limit);
}

export function addFortuneHistory(item: FortuneHistoryItem) {
  const prev = historyMap.get(item.petId) ?? [];
  const next = [...prev, item].slice(-30);
  historyMap.set(item.petId, next);
}
