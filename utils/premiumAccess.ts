import AsyncStorage from "@react-native-async-storage/async-storage";

export const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

export type PremiumEntitlements = {
  allAccess: boolean;
  removeAds: boolean;
  premiumPersonality: boolean;
  premiumNaming: boolean;
  unlockedAt?: string;
  productId?: string;
};

type PremiumListener = (entitlements: PremiumEntitlements) => void;

const listeners = new Set<PremiumListener>();

const defaultEntitlements: PremiumEntitlements = {
  allAccess: false,
  removeAds: false,
  premiumPersonality: false,
  premiumNaming: false,
};

function normalizeEntitlements(value: any): PremiumEntitlements {
  if (!value || typeof value !== "object") {
    return defaultEntitlements;
  }

  return {
    allAccess: value.allAccess === true,
    removeAds: value.removeAds === true,
    premiumPersonality: value.premiumPersonality === true,
    premiumNaming: value.premiumNaming === true,
    unlockedAt:
      typeof value.unlockedAt === "string" ? value.unlockedAt : undefined,
    productId: typeof value.productId === "string" ? value.productId : undefined,
  };
}

async function readPremiumEntitlements(): Promise<PremiumEntitlements> {
  try {
    const raw = await AsyncStorage.getItem(PREMIUM_ACCESS_KEY);
    if (!raw) return defaultEntitlements;

    const parsed = JSON.parse(raw);
    return normalizeEntitlements(parsed);
  } catch (error) {
    console.error("프리미엄 상태 확인 실패", error);
    return defaultEntitlements;
  }
}

async function writePremiumEntitlements(value: PremiumEntitlements) {
  try {
    await AsyncStorage.setItem(PREMIUM_ACCESS_KEY, JSON.stringify(value));
    emitPremiumChanged(value);
  } catch (error) {
    console.error("프리미엄 상태 저장 실패", error);
    throw error;
  }
}

export async function getPremiumEntitlements() {
  return readPremiumEntitlements();
}

export async function isPremiumUser() {
  const entitlements = await readPremiumEntitlements();
  return entitlements.allAccess || entitlements.removeAds;
}

export async function canUsePremiumPersonality() {
  const entitlements = await readPremiumEntitlements();
  return entitlements.allAccess || entitlements.premiumPersonality;
}

export async function canUsePremiumNaming() {
  const entitlements = await readPremiumEntitlements();
  return entitlements.allAccess || entitlements.premiumNaming;
}

export async function hasAdRemoval() {
  const entitlements = await readPremiumEntitlements();
  return entitlements.allAccess || entitlements.removeAds;
}

export async function enablePremiumAccess() {
  const nextValue: PremiumEntitlements = {
    allAccess: true,
    removeAds: true,
    premiumPersonality: true,
    premiumNaming: true,
    unlockedAt: new Date().toISOString(),
    productId: "all-access-990",
  };

  await writePremiumEntitlements(nextValue);
}

export async function enablePremiumPersonalityOnly() {
  const current = await readPremiumEntitlements();

  await writePremiumEntitlements({
    ...current,
    premiumPersonality: true,
    unlockedAt: current.unlockedAt ?? new Date().toISOString(),
    productId: current.productId ?? "personality-only",
  });
}

export async function enablePremiumNamingOnly() {
  const current = await readPremiumEntitlements();

  await writePremiumEntitlements({
    ...current,
    premiumNaming: true,
    unlockedAt: current.unlockedAt ?? new Date().toISOString(),
    productId: current.productId ?? "naming-only",
  });
}

export async function enableAdRemovalOnly() {
  const current = await readPremiumEntitlements();

  await writePremiumEntitlements({
    ...current,
    removeAds: true,
    unlockedAt: current.unlockedAt ?? new Date().toISOString(),
    productId: current.productId ?? "remove-ads-only",
  });
}

export async function disablePremiumAccessForTest() {
  try {
    await AsyncStorage.removeItem(PREMIUM_ACCESS_KEY);
    emitPremiumChanged(defaultEntitlements);
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

export function emitPremiumChanged(entitlements: PremiumEntitlements) {
  listeners.forEach((listener) => {
    try {
      listener(entitlements);
    } catch (error) {
      console.error("프리미엄 변경 리스너 오류", error);
    }
  });
}