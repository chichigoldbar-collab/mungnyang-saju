import AsyncStorage from "@react-native-async-storage/async-storage";

export const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

type PremiumListener = (isPremium: boolean) => void;

const listeners = new Set<PremiumListener>();

export async function isPremiumUser() {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_ACCESS_KEY);
    if (!raw) return false;

    const parsed = JSON.parse(raw);
    return parsed?.allAccess === true;
  } catch (error) {
    console.error("프리미엄 상태 확인 실패", error);
    return false;
  }
}

export async function enablePremiumAccess() {
  try {
    await AsyncStorage.setItem(
      PREMIUM_ACCESS_KEY,
      JSON.stringify({
        allAccess: true,
        unlockedAt: new Date().toISOString(),
        productId: "all-access-990",
      })
    );

    emitPremiumChanged(true);
  } catch (error) {
    console.error("프리미엄 상태 저장 실패", error);
    throw error;
  }
}

export async function disablePremiumAccessForTest() {
  try {
    await AsyncStorage.removeItem(PREMIUM_ACCESS_KEY);
    emitPremiumChanged(false);
  } catch (error) {
    console.error("프리미엄 상태 삭제 실패", error);
    throw error;
  }
}

export function subscribePremiumChange(listener: PremiumListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function emitPremiumChanged(isPremium: boolean) {
  listeners.forEach((listener) => {
    try {
      listener(isPremium);
    } catch (error) {
      console.error("프리미엄 변경 리스너 오류", error);
    }
  });
}