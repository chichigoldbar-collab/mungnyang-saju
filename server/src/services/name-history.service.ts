const nameHistoryMap = new Map<string, string[]>();

export async function getRecentNames(queryKey: string, limit = 30) {
  const items = nameHistoryMap.get(queryKey) ?? [];
  return items.slice(-limit);
}

export async function saveRecentNames(queryKey: string, names: string[]) {
  const prev = nameHistoryMap.get(queryKey) ?? [];
  const next = [...prev, ...names].slice(-50);
  nameHistoryMap.set(queryKey, next);
}