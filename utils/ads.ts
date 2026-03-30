import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy";

let interstitial: InterstitialAd | null = null;
let isLoaded = false;

async function isPremiumUser() {
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

function createInterstitial() {
  const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
    console.log("Interstitial loaded");
  });

  ad.addAdEventListener(AdEventType.CLOSED, () => {
    console.log("Interstitial closed");
    isLoaded = false;
    interstitial = createInterstitial();
    interstitial.load();
  });

  ad.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error("Interstitial error", error);
    isLoaded = false;
  });

  return ad;
}

export async function preloadInterstitialAd() {
  const premium = await isPremiumUser();
  if (premium) return;

  if (!interstitial) {
    interstitial = createInterstitial();
    interstitial.load();
    return;
  }

  if (!isLoaded) {
    interstitial.load();
  }
}

export async function showInterstitialAd() {
  const premium = await isPremiumUser();
  if (premium) {
    return false;
  }

  try {
    if (!interstitial) {
      interstitial = createInterstitial();
      interstitial.load();
      return false;
    }

    if (!isLoaded) {
      console.log("Interstitial not loaded yet");
      return false;
    }

    await interstitial.show();
    return true;
  } catch (error) {
    console.error("Interstitial show failed", error);
    return false;
  }
}