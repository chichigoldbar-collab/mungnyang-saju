import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_STORAGE_KEY = "mungnyang-premium-unlocked";

const listeners = new Set<(value: boolean) => void>();

export async function getIsPremium() {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_STORAGE_KEY);
    return raw === "true";
  } catch (error) {
    console.error("프리미엄 상태 불러오기 실패", error);
    return false;
  }
}

export async function setPremiumStatus(value: boolean) {
  try {
    await AsyncStorage.setItem(PREMIUM_STORAGE_KEY, value ? "true" : "false");
    listeners.forEach((listener) => listener(value));
  } catch (error) {
    console.error("프리미엄 상태 저장 실패", error);
  }
}

export function subscribePremiumStatus(listener: (value: boolean) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}