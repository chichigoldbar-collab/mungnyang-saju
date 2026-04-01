import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd } from "react-native-google-mobile-ads";

import { getBannerAdUnitId, getBannerSize } from "../utils/ads";
import {
  hasAdRemoval,
  subscribePremiumChange,
} from "../utils/premiumAccess";

export default function AdBanner() {
  const [hidden, setHidden] = useState(true);
  const [bannerKey, setBannerKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const syncPremium = async () => {
      const premium = await hasAdRemoval();
      if (isMounted) {
        setHidden(premium);
      }
    };

    syncPremium();

    const unsubscribe = subscribePremiumChange((entitlements) => {
      const premium = entitlements.allAccess || entitlements.removeAds;

      setHidden(premium);

      if (!premium) {
        setBannerKey((prev) => prev + 1);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        key={bannerKey}
        unitId={getBannerAdUnitId()}
        size={getBannerSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    backgroundColor: "transparent",
  },
});