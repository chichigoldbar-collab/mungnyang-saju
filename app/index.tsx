import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function IndexScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/home");
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.logoEmoji}>🐾</Text>
        <Text style={styles.title}>멍냥사주</Text>
        <Text style={styles.subtitle}>우리 아이의 운명을 읽는 시간</Text>
      </Animated.View>

      <Animated.Text style={[styles.bottomText, { opacity: fadeAnim }]}>
        MUNGNYANG SAJU
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrap: {
    alignItems: "center",
  },
  logoEmoji: {
    fontSize: 56,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2E2A27",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#7A6F66",
    textAlign: "center",
    lineHeight: 22,
  },
  bottomText: {
    position: "absolute",
    bottom: 56,
    fontSize: 12,
    fontWeight: "700",
    color: "#B59D8C",
    letterSpacing: 2,
  },
});