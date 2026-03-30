import { Slot } from "expo-router";
import { useEffect } from "react";
import mobileAds from "react-native-google-mobile-ads";

export default function RootLayout() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {
        console.log("✅ Google Mobile Ads initialized");
      })
      .catch((error) => {
        console.error("❌ Ads init failed", error);
      });
  }, []);

  return <Slot />;
}