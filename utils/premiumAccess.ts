import AsyncStorage from "@react-native-async-storage/async-storage";

export const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

type PremiumAccessState = {
  allAccess: boolean;
  unlockedAt: string;
  productId: string;
};

const listeners = new Set<(isPremium: boolean) => void>();

export async function getPremiumAccessState() {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_ACCESS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PremiumAccessState>;
    if (parsed?.allAccess !== true) return null;

    return {
      allAccess: true,
      unlockedAt: String(parsed.unlockedAt ?? ""),
      productId: String(parsed.productId ?? ""),
    } satisfies PremiumAccessState;
  } catch (error) {
    console.error("프리미엄 상태 불러오기 실패", error);
    return null;
  }
}

export async function isPremiumUser() {
  const state = await getPremiumAccessState();
  return state?.allAccess === true;
}

export async function setPremiumAccess() {
  await AsyncStorage.setItem(
    PREMIUM_ACCESS_KEY,
    JSON.stringify({
      allAccess: true,
      unlockedAt: new Date().toISOString(),
      productId: "all-access-990",
    })
  );

  listeners.forEach((listener) => listener(true));
}

export async function resetPremiumAccess() {
  await AsyncStorage.removeItem(PREMIUM_ACCESS_KEY);
  listeners.forEach((listener) => listener(false));
}

export function subscribePremiumAccess(
  listener: (isPremium: boolean) => void
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}