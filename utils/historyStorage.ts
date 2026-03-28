import AsyncStorage from "@react-native-async-storage/async-storage";

export const HISTORY_STORAGE_KEY = "mungnyang-analysis-history";

export type AnalysisType = "fortune" | "personality" | "naming";

export type HistoryItem = {
  id: string;
  petId: string;
  petName: string;
  createdAt: string;
  analysisType: AnalysisType;
  title: string;
  summary: string;
  payload: Record<string, any>;
};

export async function getHistoryItems() {
  const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  const parsed = raw ? JSON.parse(raw) : [];
  return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
}

export async function saveHistoryItem(item: HistoryItem) {
  const current = await getHistoryItems();

  const alreadyExists = current.some(
    (historyItem) =>
      historyItem.analysisType === item.analysisType &&
      historyItem.petId === item.petId &&
      historyItem.summary === item.summary
  );

  if (alreadyExists) {
    return;
  }

  const next = [item, ...current];
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next));
}