import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";
import { saveHistoryItem } from "../utils/historyStorage";

const PET_STORAGE_KEY = "mungnyang-pet-profiles";
const CURRENT_PET_KEY = "mungnyang-current-pet";

type SavedPetProfile = {
  id: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
  isBirthTimeKnown: boolean;
};

type NamingApiResponse = {
  success: boolean;
  data?: {
    petName: string;
    nameEnergy: string;
    summary: string;
    firstImpression: string;
    hiddenCharm: string;
    relationshipFlow: string;
    luckyPoint: string;
    namingTip: string;
  };
  message?: string;
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

export default function NamingScreen() {
  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [result, setResult] = useState<NamingApiResponse["data"] | null>(null);

  const selectedPet = useMemo(
    () => savedPets.find((pet) => pet.id === selectedPetId) ?? null,
    [savedPets, selectedPetId]
  );

  const loadingMessages = useMemo(
    () => [
      selectedPet
        ? `${selectedPet.petName}라는 이름의 울림을 읽고 있어요...`
        : "이름의 울림을 읽고 있어요...",
      "이름이 주는 첫인상과 숨은 매력을 분석하고 있어요...",
      "관계 흐름과 좋은 포인트를 정리하고 있어요...",
      "작명풀이 결과를 보기 좋게 정리하고 있어요...",
    ],
    [selectedPet]
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessageIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 900);

    return () => clearInterval(timer);
  }, [isLoading, loadingMessages.length]);

  const loadSavedPets = useCallback(async () => {
    try {
      setIsLoadingPets(true);

      const [savedPetsRaw, currentPetRaw] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(CURRENT_PET_KEY),
      ]);

      const parsedPets: SavedPetProfile[] = savedPetsRaw
        ? JSON.parse(savedPetsRaw)
        : [];
      const pets = Array.isArray(parsedPets) ? parsedPets : [];
      setSavedPets(pets);

      if (pets.length === 0) {
        setSelectedPetId("");
        return;
      }

      const parsedCurrentPet: SavedPetProfile | null = currentPetRaw
        ? JSON.parse(currentPetRaw)
        : null;

      if (
        parsedCurrentPet &&
        pets.some((pet) => pet.id === parsedCurrentPet.id)
      ) {
        setSelectedPetId(parsedCurrentPet.id);
      } else {
        setSelectedPetId(pets[0].id);
      }
    } catch (error) {
      console.error("작명풀이용 반려동물 목록 불러오기 실패", error);
      setSavedPets([]);
      setSelectedPetId("");
    } finally {
      setIsLoadingPets(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedPets();
    }, [loadSavedPets])
  );

  const handleAnalyzeNaming = async () => {
    if (!selectedPet) {
      Alert.alert("선택 필요", "등록된 반려동물을 먼저 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(selectedPet));

      const [response] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/premium/naming`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petName: selectedPet.petName,
            petType: selectedPet.petType,
            petGender: selectedPet.petGender,
            birthDate: selectedPet.birthDate,
          }),
        }),
        wait(2300),
      ]);

      const json = (await response.json()) as NamingApiResponse;

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "작명풀이를 불러오지 못했어요.");
      }

      await saveHistoryItem({
        id: `naming-${selectedPet.id}-${Date.now()}`,
        petId: selectedPet.id,
        petName: selectedPet.petName,
        createdAt: new Date().toISOString(),
        analysisType: "naming",
        title: "작명 풀이",
        summary: json.data.summary,
        payload: json.data,
      });

      setResult(json.data);
    } catch (error) {
      console.error("작명풀이 API 호출 실패", error);
      Alert.alert(
        "작명풀이 불러오기 실패",
        "서버와 연결하지 못했어요. 서버 실행 상태를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✍️ 작명 풀이</Text>
        <Text style={styles.headerSub}>
          등록된 반려동물을 선택하고 이름이 가진 울림과 기운을 깊게 살펴봐요.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>반려동물 선택</Text>

        {isLoadingPets ? (
          <Text style={styles.helperText}>등록된 반려동물을 불러오는 중...</Text>
        ) : savedPets.length === 0 ? (
          <Text style={styles.helperText}>
            등록된 반려동물이 없어요. 먼저 아이를 등록해주세요.
          </Text>
        ) : (
          <View style={styles.petList}>
            {savedPets.map((pet) => {
              const active = pet.id === selectedPetId;
              return (
                <Pressable
                  key={pet.id}
                  style={[styles.petChip, active && styles.petChipActive]}
                  onPress={() => {
                    setSelectedPetId(pet.id);
                    setResult(null);
                  }}
                >
                  <Text
                    style={[
                      styles.petChipText,
                      active && styles.petChipTextActive,
                    ]}
                  >
                    {pet.petType === "cat" ? "🐱" : "🐶"} {pet.petName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {selectedPet && (
          <View style={styles.selectedPetCard}>
            <Text style={styles.selectedPetTitle}>
              {selectedPet.petType === "cat" ? "🐱" : "🐶"}{" "}
              {selectedPet.petName}
            </Text>
            <Text style={styles.selectedPetMeta}>{selectedPet.breed}</Text>
            <Text style={styles.selectedPetMeta}>
              생일 · {selectedPet.birthDate}
            </Text>
          </View>
        )}

        <View style={styles.submitWrap}>
          <AppButton
            title={isLoading ? "분석 중..." : "작명 풀이하기"}
            onPress={handleAnalyzeNaming}
            variant="secondary"
          />
        </View>
      </SectionCard>

      {isLoading && (
        <SectionCard>
          <View style={styles.loadingBox}>
            <Text style={styles.loadingEmoji}>
              {selectedPet?.petType === "cat" ? "🐱" : "🐶"}
            </Text>
            <ActivityIndicator size="large" color={COLORS.secondary} />
            <Text style={styles.loadingTitle}>이름의 기운을 분석하고 있어요</Text>
            <Text style={styles.loadingDesc}>
              {loadingMessages[loadingMessageIndex]}
            </Text>
          </View>
        </SectionCard>
      )}

      {!isLoading && result && (
        <>
          <SectionCard>
            <Text style={styles.sectionTitle}>이름의 전체 기운</Text>
            <View style={styles.energyCard}>
              <Text style={styles.energyValue}>{result.nameEnergy}</Text>
              <Text style={styles.energyName}>{result.petName}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>전체 풀이</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>세부 작명 풀이</Text>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>✨ 이름의 첫인상</Text>
              <Text style={styles.statDesc}>{result.firstImpression}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>💎 숨은 매력</Text>
              <Text style={styles.statDesc}>{result.hiddenCharm}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🤝 관계 흐름</Text>
              <Text style={styles.statDesc}>{result.relationshipFlow}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🍀 좋은 포인트</Text>
              <Text style={styles.statDesc}>{result.luckyPoint}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🫶 이름 활용 팁</Text>
              <Text style={styles.statDesc}>{result.namingTip}</Text>
            </View>
          </SectionCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  petList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  petChip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  petChipActive: {
    backgroundColor: COLORS.accent,
  },
  petChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B625C",
  },
  petChipTextActive: {
    color: COLORS.text,
  },
  selectedPetCard: {
    marginTop: 14,
    backgroundColor: "#FFF8F0",
    borderRadius: 18,
    padding: 14,
  },
  selectedPetTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  selectedPetMeta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
  },
  submitWrap: {
    marginTop: 18,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 10,
  },
  loadingEmoji: {
    fontSize: 34,
    marginBottom: 12,
  },
  loadingTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  loadingDesc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  energyCard: {
    backgroundColor: "#FFF5EB",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  energyValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  energyName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.secondary,
  },
  summaryCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 18,
    padding: 16,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },
  statCard: {
    backgroundColor: "#F7F2ED",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  statTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  statDesc: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.subText,
  },
});