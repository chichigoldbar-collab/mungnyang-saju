import {
  AdEventType,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import {
  hasAdRemoval,
  subscribePremiumChange,
} from "./premiumAccess";

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy";

const bannerUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzzzzzz";

let interstitial: InterstitialAd | null = null;
let isInterstitialLoaded = false;
let isInterstitialLoading = false;
let isPremiumAdsBlocked = false;
let hasBoundPremiumListener = false;

function resetInterstitialState() {
  isInterstitialLoaded = false;
  isInterstitialLoading = false;
  interstitial = null;
}

function bindPremiumAdStateListener() {
  if (hasBoundPremiumListener) {
    return;
  }

  hasBoundPremiumListener = true;

  subscribePremiumChange((entitlements) => {
    const premium = entitlements.allAccess || entitlements.removeAds;
    isPremiumAdsBlocked = premium;

    if (premium) {
      resetInterstitialState();
      return;
    }

    preloadInterstitialAd();
  });
}

function createInterstitial() {
  const ad = InterstitialAd.createForAdRequest(interstitialUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  ad.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialLoaded = true;
    isInterstitialLoading = false;
    console.log("[ads] interstitial loaded");
  });

  ad.addAdEventListener(AdEventType.CLOSED, () => {
    console.log("[ads] interstitial closed");
    isInterstitialLoaded = false;
    isInterstitialLoading = false;
    interstitial = null;

    if (!isPremiumAdsBlocked) {
      preloadInterstitialAd();
    }
  });

  ad.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log("[ads] interstitial error", error);
    isInterstitialLoaded = false;
    isInterstitialLoading = false;
    interstitial = null;
  });

  return ad;
}

function getOrCreateInterstitial() {
  if (!interstitial) {
    interstitial = createInterstitial();
  }
  return interstitial;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function preloadInterstitialAd() {
  bindPremiumAdStateListener();

  const premium = await hasAdRemoval();
  isPremiumAdsBlocked = premium;

  if (premium) {
    resetInterstitialState();
    return;
  }

  if (isInterstitialLoaded || isInterstitialLoading) {
    return;
  }

  try {
    const ad = getOrCreateInterstitial();
    isInterstitialLoading = true;
    ad.load();
  } catch (error) {
    console.log("[ads] preload failed", error);
    isInterstitialLoading = false;
    isInterstitialLoaded = false;
    interstitial = null;
  }
}

export async function showInterstitialAd() {
  bindPremiumAdStateListener();

  const premium = await hasAdRemoval();
  isPremiumAdsBlocked = premium;

  if (premium) {
    resetInterstitialState();
    return false;
  }

  try {
    const ad = getOrCreateInterstitial();

    if (!isInterstitialLoaded) {
      if (!isInterstitialLoading) {
        isInterstitialLoading = true;
        ad.load();
      }

      let retry = 0;
      while (!isInterstitialLoaded && retry < 10) {
        await wait(300);
        retry += 1;
      }
    }

    if (!isInterstitialLoaded) {
      console.log("[ads] interstitial not ready");
      return false;
    }

    await ad.show();
    return true;
  } catch (error) {
    console.log("[ads] show failed", error);
    isInterstitialLoaded = false;
    isInterstitialLoading = false;
    interstitial = null;
    return false;
  }
}

export function getBannerAdUnitId() {
  return bannerUnitId;
}

export function getBannerSize() {
  return BannerAdSize.ANCHORED_ADAPTIVE_BANNER;
}