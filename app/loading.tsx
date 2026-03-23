import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "../constants/colors";
import type { FortuneHistoryItem, PetGender, PetType } from "../types";
import { buildFortuneResult } from "../utils/fortune-generator";

const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";
const DAILY_FORTUNE_CACHE_KEY = "mungnyang-daily-fortune-cache";

type DailyFortuneCacheItem = {
  petId: string;
  dateKey: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calculateAge(birthDate: string) {
  const onlyNumbers = birthDate.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) return "나이 미확인";

  const year = Number(onlyNumbers.slice(0, 4));
  const month = Number(onlyNumbers.slice(4, 6));
  const day = Number(onlyNumbers.slice(6, 8));

  const today = new Date();
  let age = today.getFullYear() - year;

  const hasNotHadBirthdayYet =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);

  if (hasNotHadBirthdayYet) age -= 1;
  if (age < 0) return "나이 미확인";

  return `${age}살`;
}

async function saveFortuneHistory(item: FortuneHistoryItem) {
  const saved = await AsyncStorage.getItem(FORTUNE_HISTORY_KEY);
  const parsed = saved ? JSON.parse(saved) : [];
  const current = Array.isArray(parsed) ? parsed : [];
  const updated = [item, ...current].slice(0, 100);
  await AsyncStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify(updated));
}

async function saveDailyFortuneCache(item: DailyFortuneCacheItem) {
  const saved = await AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY);
  const parsed = saved ? JSON.parse(saved) : {};
  const current = parsed && typeof parsed === "object" ? parsed : {};
  current[item.petId] = item;
  await AsyncStorage.setItem(DAILY_FORTUNE_CACHE_KEY, JSON.stringify(current));
}

export default function LoadingScreen() {
  const params = useLocalSearchParams();
  const lastRequestKeyRef = useRef<string | null>(null);

  const petId = String(params.petId ?? "");
  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male") as PetGender;
  const isNeutered = String(params.isNeutered ?? "false") === "true";
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");

  const requestKey = `${petId}|${petName}|${petType}|${petGender}|${isNeutered}|${breed}|${birthDate}|${birthTime}`;

  const fortune = useMemo(async () => {
    const savedHistory = await AsyncStorage.getItem(FORTUNE_HISTORY_KEY);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];
    const history = Array.isArray(parsedHistory) ? parsedHistory : [];

    return buildFortuneResult({
      petId,
      petName,
      petType,
      petGender,
      isNeutered,
      history,
    });
  }, [petId, petName, petType, petGender, isNeutered]);

  useEffect(() => {
    if (lastRequestKeyRef.current === requestKey) return;
    lastRequestKeyRef.current = requestKey;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let isActive = true;

    const run = async () => {
      try {
        const resolvedFortune = await fortune;

        const historyItem: FortuneHistoryItem = {
          id: `${Date.now()}-${petId}`,
          petId,
          createdAt: new Date().toISOString(),
          petName,
          petType,
          petGender,
          breed,
          age: calculateAge(birthDate),
          summary: resolvedFortune.summary,
          health: resolvedFortune.health,
          appetite: resolvedFortune.appetite,
          mood: resolvedFortune.mood,
          caution: resolvedFortune.caution,
          luckyColor: resolvedFortune.luckyColor,
          luckyItem: resolvedFortune.luckyItem,
          recommendedAction: resolvedFortune.recommendedAction,
          personalityKey: resolvedFortune.personalityKey,
          moodKey: resolvedFortune.moodKey,
          focusKey: resolvedFortune.focusKey,
          cautionKey: resolvedFortune.cautionKey,
        };

        const dailyItem: DailyFortuneCacheItem = {
          petId,
          dateKey: getTodayKey(),
          petName,
          petType,
          petGender,
          isNeutered,
          breed,
          birthDate,
          birthTime,
          summary: resolvedFortune.summary,
          health: resolvedFortune.health,
          appetite: resolvedFortune.appetite,
          mood: resolvedFortune.mood,
          caution: resolvedFortune.caution,
          luckyColor: resolvedFortune.luckyColor,
          luckyItem: resolvedFortune.luckyItem,
          recommendedAction: resolvedFortune.recommendedAction,
        };

        await Promise.all([
          saveFortuneHistory(historyItem),
          saveDailyFortuneCache(dailyItem),
        ]);

        if (!isActive) return;

        timer = setTimeout(() => {
          router.replace({
            pathname: "/(tabs)/result",
            params: {
              petId,
              petName,
              petType,
              petGender,
              isNeutered: isNeutered ? "true" : "false",
              breed,
              birthDate,
              birthTime,
              summary: resolvedFortune.summary,
              health: resolvedFortune.health,
              appetite: resolvedFortune.appetite,
              mood: resolvedFortune.mood,
              caution: resolvedFortune.caution,
              luckyColor: resolvedFortune.luckyColor,
              luckyItem: resolvedFortune.luckyItem,
              recommendedAction: resolvedFortune.recommendedAction,
            },
          });
        }, 2200);
      } catch (error) {
        console.error("로딩 중 저장 실패", error);
      }
    };

    run();

    return () => {
      isActive = false;
      if (timer) clearTimeout(timer);
    };
  }, [
    requestKey,
    petId,
    petName,
    petType,
    petGender,
    isNeutered,
    breed,
    birthDate,
    birthTime,
    fortune,
  ]);

  let LottieView: any = null;
  if (Platform.OS !== "web") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      LottieView = require("lottie-react-native").default;
    } catch {
      LottieView = null;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.petIcon}>{petType === "cat" ? "🐱" : "🐶"}</Text>

        {LottieView ? (
          <LottieView
            source={require("../assets/lottie/fortune-loading.json")}
            autoPlay
            loop
            style={styles.lottie}
          />
        ) : (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color={COLORS.secondary} />
          </View>
        )}

        <Text style={styles.title}>우리 아이 운세 분석 중...</Text>
        <Text style={styles.desc}>
          {petName}의 오늘 기분과 흐름을 천천히 읽고 있어요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  petIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  lottie: {
    width: 160,
    height: 160,
    marginBottom: 8,
  },
  spinnerWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  desc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
  },
});