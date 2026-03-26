import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

const DAILY_FORTUNE_CACHE_KEY = "mungnyang-daily-fortune-cache";
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";

type FortuneApiResponse = {
  success: boolean;
  data?: {
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
  message?: string;
};

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

function getApiBaseUrl() {
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }

  if (Platform.OS === "ios") {
    return "http://localhost:4000";
  }

  return "http://localhost:4000";
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveDailyFortuneResult(item: DailyFortuneCacheItem) {
  try {
    const [dailyCacheRaw, historyRaw] = await Promise.all([
      AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY),
      AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
    ]);

    const parsedDailyCache = dailyCacheRaw ? JSON.parse(dailyCacheRaw) : {};
    const nextDailyCache =
      parsedDailyCache && typeof parsedDailyCache === "object"
        ? parsedDailyCache
        : {};

    nextDailyCache[item.petId] = item;

    const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
    const nextHistory = Array.isArray(parsedHistory) ? parsedHistory : [];

    const alreadyExists = nextHistory.some(
      (historyItem: DailyFortuneCacheItem) =>
        historyItem.petId === item.petId && historyItem.dateKey === item.dateKey
    );

    if (!alreadyExists) {
      nextHistory.unshift(item);
    }

    await Promise.all([
      AsyncStorage.setItem(
        DAILY_FORTUNE_CACHE_KEY,
        JSON.stringify(nextDailyCache)
      ),
      AsyncStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify(nextHistory)),
    ]);
  } catch (error) {
    console.error("오늘 운세 저장 실패", error);
  }
}

export default function LoadingScreen() {
  const params = useLocalSearchParams();
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const petId = String(params.petId ?? "");
  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male") as PetGender;
  const isNeutered = String(params.isNeutered ?? "false") === "true";
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "2024-01-01");
  const birthTime = String(params.birthTime ?? "시간 모름");

  const loadingMessages = useMemo(
    () => [
      `${petName}의 오늘 운세를 읽는 중이에요...`,
      "기분운과 식욕운을 분석하고 있어요...",
      "행운 컬러와 아이템을 찾고 있어요...",
      "결과를 예쁘게 정리하고 있어요...",
    ],
    [petName]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    return () => clearInterval(timer);
  }, [loadingMessages.length]);

  useEffect(() => {
    if (!petId) {
      Alert.alert("오류", "반려동물 정보가 없어요.", [
        {
          text: "확인",
          onPress: () => router.back(),
        },
      ]);
      return;
    }

    let isCancelled = false;

    const fetchDailyFortune = async () => {
      try {
        const [response] = await Promise.all([
          fetch(`${getApiBaseUrl()}/api/fortune/daily`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              petId,
              petName,
              petType,
              petGender,
              isNeutered,
              breed,
              birthDate,
              birthTime,
            }),
          }),
          wait(2300),
        ]);

        const json = (await response.json()) as FortuneApiResponse;

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.message ?? "운세를 불러오지 못했어요.");
        }

        if (isCancelled) return;

        const resultItem: DailyFortuneCacheItem = {
          petId: json.data.petId,
          dateKey: json.data.dateKey,
          petName: json.data.petName,
          petType: json.data.petType,
          petGender: json.data.petGender,
          isNeutered: json.data.isNeutered,
          breed: json.data.breed,
          birthDate: json.data.birthDate,
          birthTime: json.data.birthTime,
          summary: json.data.summary,
          health: json.data.health,
          appetite: json.data.appetite,
          mood: json.data.mood,
          caution: json.data.caution,
          luckyColor: json.data.luckyColor,
          luckyItem: json.data.luckyItem,
          recommendedAction: json.data.recommendedAction,
        };

        await saveDailyFortuneResult(resultItem);

        if (isCancelled) return;

        router.replace({
          pathname: "/result",
          params: {
            petId: resultItem.petId,
            petName: resultItem.petName,
            petType: resultItem.petType,
            petGender: resultItem.petGender,
            isNeutered: resultItem.isNeutered ? "true" : "false",
            breed: resultItem.breed,
            birthDate: resultItem.birthDate,
            birthTime: resultItem.birthTime,
            summary: resultItem.summary,
            health: resultItem.health,
            appetite: resultItem.appetite,
            mood: resultItem.mood,
            caution: resultItem.caution,
            luckyColor: resultItem.luckyColor,
            luckyItem: resultItem.luckyItem,
            recommendedAction: resultItem.recommendedAction,
          },
        });
      } catch (error) {
        console.error("운세 API 호출 실패", error);

        if (isCancelled) return;

        Alert.alert(
          "운세 불러오기 실패",
          "서버와 연결하지 못했어요. 서버가 실행 중인지 확인해주세요.",
          [
            {
              text: "확인",
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    fetchDailyFortune();

    return () => {
      isCancelled = true;
    };
  }, [petId, petName, petType, petGender, isNeutered, breed, birthDate, birthTime]);

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.emoji}>{petType === "cat" ? "🐱" : "🐶"}</Text>
        <ActivityIndicator size="large" color={COLORS.secondary} />
        <Text style={styles.title}>오늘의 운세를 분석하고 있어요</Text>
        <Text style={styles.desc}>{loadingMessages[loadingTextIndex]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
  },
  emoji: {
    fontSize: 42,
    marginBottom: 14,
  },
  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "900",
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