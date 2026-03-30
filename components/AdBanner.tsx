import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import {
  isPremiumUser,
  subscribePremiumAccess,
} from "../utils/premiumAccess";

const adUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyyyyyy";

export default function AdBanner() {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    let mounted = true;

    const sync = async () => {
      const premium = await isPremiumUser();
      if (mounted) {
        setIsPremium(premium);
      }
    };

    sync();

    const unsubscribe = subscribePremiumAccess((premium) => {
      setIsPremium(premium);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (isPremium) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
    paddingBottom: 6,
    backgroundColor: "#FFFDFB",
  },
});