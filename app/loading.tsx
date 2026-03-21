import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

const LOADING_MESSAGES = [
  "오행의 흐름을 읽는 중...",
  "오늘의 기운을 분석하는 중...",
  "행운 컬러를 찾는 중...",
  "우리 아이의 기분을 해석하는 중...",
  "결과를 정리하는 중...",
];

export default function LoadingScreen() {
  const params = useLocalSearchParams();

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 🔄 회전 애니메이션
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // 🌫️ 페이드 인
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // 📝 메시지 변경
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1200);

    // ⏱️ 5초 후 이동
    const timer = setTimeout(() => {
      router.replace({
        pathname: "/result" as const,
        params: {
          petName: String(params.petName ?? "코코"),
          petType: String(params.petType ?? "dog"),
          petGender: String(params.petGender ?? "male"),
          isNeutered: String(params.isNeutered ?? "false"),
          breed: String(params.breed ?? "품종 미입력"),
          birthDate: String(params.birthDate ?? "생일 미입력"),
          birthTime: String(params.birthTime ?? "시간 모름"),
        },
      });
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.emoji}>🔮</Text>

        {/* 회전 링 */}
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ rotate }],
            },
          ]}
        />

        <Text style={styles.title}>멍냥사주 보는 중...</Text>

        <Text style={styles.subtitle}>
          우리 아이의 운명을 정성껏 읽고 있어요
        </Text>

        {/* 동적 메시지 */}
        <View style={styles.messageBox}>
          <Text style={styles.message}>
            {LOADING_MESSAGES[messageIndex]}
          </Text>
        </View>

        {/* 점 애니메이션 느낌 */}
        <View style={styles.dotRow}>
          <View style={[styles.dot, messageIndex % 3 === 0 && styles.dotActive]} />
          <View style={[styles.dot, messageIndex % 3 === 1 && styles.dotActive]} />
          <View style={[styles.dot, messageIndex % 3 === 2 && styles.dotActive]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F3",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
  },
  emoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 999,
    borderWidth: 6,
    borderColor: "#F2C7A5",
    borderTopColor: "#2E2A27",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E2A27",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#6F645C",
    textAlign: "center",
  },
  messageBox: {
    marginTop: 18,
    backgroundColor: "#FFF4EA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  message: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8C5A3C",
  },
  dotRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E6D9CF",
  },
  dotActive: {
    backgroundColor: "#2E2A27",
  },
});