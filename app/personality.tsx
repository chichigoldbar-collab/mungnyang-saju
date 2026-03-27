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

type PersonalityApiResponse = {
  success: boolean;
  data?: {
    petId: string;
    petName: string;
    coreType: string;
    summary: string;
    personality: string;
    emotionStyle: string;
    socialStyle: string;
    stressPoint: string;
    bondStyle: string;
    careTip: string;
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

export default function PersonalityScreen() {
  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [result, setResult] = useState<PersonalityApiResponse["data"] | null>(
    null
  );

  const selectedPet = useMemo(
    () => savedPets.find((pet) => pet.id === selectedPetId) ?? null,
    [savedPets, selectedPetId]
  );

  const loadingMessages = useMemo(
    () => [
      selectedPet
        ? `${selectedPet.petName}의 성향 결을 읽고 있어요...`
        : "성향 결을 읽고 있어요...",
      "감정 표현 방식과 사회성을 분석하고 있어요...",
      "스트레스 포인트와 돌봄 팁을 정리하고 있어요...",
      "유료 분석 결과를 보기 좋게 정리하고 있어요...",
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
      console.error("성격분석용 반려동물 목록 불러오기 실패", error);
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

  const handleAnalyzePersonality = async () => {
    if (!selectedPet) {
      Alert.alert("선택 필요", "등록된 반려동물을 먼저 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(selectedPet));

      const [response] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/premium/personality`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petId: selectedPet.id,
            petName: selectedPet.petName,
            petType: selectedPet.petType,
            petGender: selectedPet.petGender,
            isNeutered: selectedPet.isNeutered,
            breed: selectedPet.breed,
            birthDate: selectedPet.birthDate,
            birthTime: selectedPet.birthTime,
          }),
        }),
        wait(2300),
      ]);

      const json = (await response.json()) as PersonalityApiResponse;

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "성격분석을 불러오지 못했어요.");
      }

      setResult(json.data);
    } catch (error) {
      console.error("성격분석 API 호출 실패", error);
      Alert.alert(
        "성격분석 불러오기 실패",
        "서버와 연결하지 못했어요. 서버 실행 상태를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 성격 분석</Text>
        <Text style={styles.headerSub}>
          등록된 반려동물을 선택하고 타고난 성향과 감정 표현 방식을 깊게 살펴봐요.
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
            <Text style={styles.selectedPetMeta}>
              시간 · {selectedPet.birthTime}
            </Text>
          </View>
        )}

        <View style={styles.submitWrap}>
          <AppButton
            title={isLoading ? "분석 중..." : "성격 분석하기"}
            onPress={handleAnalyzePersonality}
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
            <Text style={styles.loadingTitle}>성격을 분석하고 있어요</Text>
            <Text style={styles.loadingDesc}>
              {loadingMessages[loadingMessageIndex]}
            </Text>
          </View>
        </SectionCard>
      )}

      {!isLoading && result && (
        <>
          <SectionCard>
            <Text style={styles.sectionTitle}>핵심 성향 타입</Text>
            <View style={styles.coreTypeCard}>
              <Text style={styles.coreTypeValue}>{result.coreType}</Text>
              <Text style={styles.coreTypeName}>{result.petName}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>전체 요약</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{result.summary}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>세부 성향 분석</Text>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🌿 기본 성격</Text>
              <Text style={styles.statDesc}>{result.personality}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>💛 감정 표현 방식</Text>
              <Text style={styles.statDesc}>{result.emotionStyle}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>👥 사회성 스타일</Text>
              <Text style={styles.statDesc}>{result.socialStyle}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>⚠️ 스트레스 포인트</Text>
              <Text style={styles.statDesc}>{result.stressPoint}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🤝 보호자와의 유대 방식</Text>
              <Text style={styles.statDesc}>{result.bondStyle}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statTitle}>🫶 돌봄 팁</Text>
              <Text style={styles.statDesc}>{result.careTip}</Text>
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
  coreTypeCard: {
    backgroundColor: "#FFF5EB",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  coreTypeValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  coreTypeName: {
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