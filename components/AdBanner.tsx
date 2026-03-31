import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BannerAd } from "react-native-google-mobile-ads";

import { getBannerAdUnitId, getBannerSize } from "../utils/ads";
import {
  isPremiumUser,
  subscribePremiumChange,
} from "../utils/premiumAccess";

export default function AdBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncPremium = async () => {
      const premium = await isPremiumUser();
      if (isMounted) {
        setHidden(premium);
      }
    };

    syncPremium();

    const unsubscribe = subscribePremiumChange((premium) => {
      setHidden(premium);
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