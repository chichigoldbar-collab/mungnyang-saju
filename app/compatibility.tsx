import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

type CompatibilityApiResponse = {
  success: boolean;
  data?: {
    score: number;
    grade: string;
    summary: string;
    chemistry: string;
    strength: string;
    caution: string;
    tip: string;
  };
  message?: string;
};

type PickerMode = "year" | "month" | "day" | null;

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

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function formatBirthDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

function buildYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1950; year -= 1) {
    years.push(year);
  }
  return years;
}

export default function CompatibilityScreen() {
  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  const [ownerName, setOwnerName] = useState("");
  const [ownerBirthYear, setOwnerBirthYear] = useState<number>(1995);
  const [ownerBirthMonth, setOwnerBirthMonth] = useState<number>(6);
  const [ownerBirthDay, setOwnerBirthDay] = useState<number>(21);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const [result, setResult] = useState<CompatibilityApiResponse["data"] | null>(
    null
  );

  const yearOptions = useMemo(() => buildYearOptions(), []);
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => i + 1),
    []
  );
  const dayOptions = useMemo(
    () =>
      Array.from(
        { length: getDaysInMonth(ownerBirthYear, ownerBirthMonth) },
        (_, i) => i + 1
      ),
    [ownerBirthYear, ownerBirthMonth]
  );

  const selectedPet = useMemo(
    () => savedPets.find((pet) => pet.id === selectedPetId) ?? null,
    [savedPets, selectedPetId]
  );

  const ownerBirthDate = useMemo(
    () => formatBirthDate(ownerBirthYear, ownerBirthMonth, ownerBirthDay),
    [ownerBirthYear, ownerBirthMonth, ownerBirthDay]
  );

  const loadingMessages = useMemo(
    () => [
      "보호자와 반려동물의 흐름을 읽고 있어요...",
      "감정 궁합과 관계 리듬을 분석하고 있어요...",
      "잘 맞는 포인트와 주의 포인트를 정리하고 있어요...",
      "궁합 결과를 보기 좋게 정리하고 있어요...",
    ],
    []
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
      console.error("궁합용 반려동물 목록 불러오기 실패", error);
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

  const handleSelectYear = (year: number) => {
    setOwnerBirthYear(year);
    const maxDay = getDaysInMonth(year, ownerBirthMonth);
    if (ownerBirthDay > maxDay) {
      setOwnerBirthDay(maxDay);
    }
    setPickerMode(null);
  };

  const handleSelectMonth = (month: number) => {
    setOwnerBirthMonth(month);
    const maxDay = getDaysInMonth(ownerBirthYear, month);
    if (ownerBirthDay > maxDay) {
      setOwnerBirthDay(maxDay);
    }
    setPickerMode(null);
  };

  const handleSelectDay = (day: number) => {
    setOwnerBirthDay(day);
    setPickerMode(null);
  };

  const handleAnalyzeCompatibility = async () => {
    if (!selectedPet) {
      Alert.alert("선택 필요", "등록된 반려동물을 먼저 선택해주세요.");
      return;
    }

    if (!ownerName.trim()) {
      Alert.alert("입력 필요", "보호자 이름을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const [response] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/analysis/compatibility`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petName: selectedPet.petName,
            petType: selectedPet.petType,
            ownerName: ownerName.trim(),
            ownerBirthDate,
          }),
        }),
        wait(2300),
      ]);

      const json = (await response.json()) as CompatibilityApiResponse;

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "궁합 결과를 불러오지 못했어요.");
      }

      setResult(json.data);
    } catch (error) {
      console.error("궁합 API 호출 실패", error);
      Alert.alert(
        "궁합 불러오기 실패",
        "서버와 연결하지 못했어요. 서버 실행 상태를 확인해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderPickerOptions = () => {
    if (pickerMode === "year") {
      return yearOptions.map((year) => (
        <Pressable
          key={year}
          style={styles.optionItem}
          onPress={() => handleSelectYear(year)}
        >
          <Text style={styles.optionText}>{year}년</Text>
        </Pressable>
      ));
    }

    if (pickerMode === "month") {
      return monthOptions.map((month) => (
        <Pressable
          key={month}
          style={styles.optionItem}
          onPress={() => handleSelectMonth(month)}
        >
          <Text style={styles.optionText}>{month}월</Text>
        </Pressable>
      ));
    }

    if (pickerMode === "day") {
      return dayOptions.map((day) => (
        <Pressable
          key={day}
          style={styles.optionItem}
          onPress={() => handleSelectDay(day)}
        >
          <Text style={styles.optionText}>{day}일</Text>
        </Pressable>
      ));
    }

    return null;
  };

  const pickerTitle =
    pickerMode === "year"
      ? "년 선택"
      : pickerMode === "month"
      ? "월 선택"
      : pickerMode === "day"
      ? "일 선택"
      : "";

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💞 보호자 궁합</Text>
          <Text style={styles.headerSub}>
            등록된 반려동물을 선택하고 보호자 정보를 입력해 궁합을 확인해보세요.
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
                    onPress={() => setSelectedPetId(pet.id)}
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
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>보호자 정보</Text>

          <Text style={styles.label}>보호자 이름</Text>
          <TextInput
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="예: 민수"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
          />

          <Text style={styles.label}>보호자 생년월일</Text>
          <View style={styles.birthRow}>
            <Pressable
              style={styles.birthButton}
              onPress={() => setPickerMode("year")}
            >
              <Text style={styles.birthButtonText}>{ownerBirthYear}년</Text>
            </Pressable>

            <Pressable
              style={styles.birthButton}
              onPress={() => setPickerMode("month")}
            >
              <Text style={styles.birthButtonText}>{ownerBirthMonth}월</Text>
            </Pressable>

            <Pressable
              style={styles.birthButton}
              onPress={() => setPickerMode("day")}
            >
              <Text style={styles.birthButtonText}>{ownerBirthDay}일</Text>
            </Pressable>
          </View>

          <Text style={styles.birthPreview}>
            선택된 생년월일 · {ownerBirthDate}
          </Text>

          <View style={styles.submitWrap}>
            <AppButton
              title={isLoading ? "분석 중..." : "궁합 분석하기"}
              onPress={handleAnalyzeCompatibility}
              variant="secondary"
            />
          </View>
        </SectionCard>

        {isLoading && (
          <SectionCard>
            <View style={styles.loadingBox}>
              <Text style={styles.loadingEmoji}>💞</Text>
              <ActivityIndicator size="large" color={COLORS.secondary} />
              <Text style={styles.loadingTitle}>궁합을 분석하고 있어요</Text>
              <Text style={styles.loadingDesc}>
                {loadingMessages[loadingMessageIndex]}
              </Text>
            </View>
          </SectionCard>
        )}

        {!isLoading && result && (
          <>
            <SectionCard>
              <Text style={styles.sectionTitle}>궁합 점수</Text>

              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{result.score}</Text>
                <Text style={styles.scoreLabel}>점</Text>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{result.grade} 등급</Text>
                </View>
              </View>
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>궁합 요약</Text>
              <View style={styles.resultCard}>
                <Text style={styles.resultText}>{result.summary}</Text>
              </View>
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>세부 분석</Text>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>✨ 교감 흐름</Text>
                <Text style={styles.statDesc}>{result.chemistry}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>💛 이 궁합의 장점</Text>
                <Text style={styles.statDesc}>{result.strength}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>⚠️ 주의 포인트</Text>
                <Text style={styles.statDesc}>{result.caution}</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statTitle}>🌿 관계 팁</Text>
                <Text style={styles.statDesc}>{result.tip}</Text>
              </View>
            </SectionCard>
          </>
        )}
      </ScrollView>

      <Modal
        visible={pickerMode !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerMode(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pickerTitle}</Text>
              <Pressable onPress={() => setPickerMode(null)}>
                <Text style={styles.modalClose}>닫기</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.optionList}
              showsVerticalScrollIndicator={false}
            >
              {renderPickerOptions()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
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
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#F7F2ED",
    fontSize: 15,
    color: COLORS.text,
  },
  birthRow: {
    flexDirection: "row",
    gap: 10,
  },
  birthButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#F7F2ED",
    alignItems: "center",
    justifyContent: "center",
  },
  birthButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  birthPreview: {
    marginTop: 10,
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
  scoreCard: {
    backgroundColor: "#FFF5EB",
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: "900",
    color: COLORS.text,
  },
  scoreLabel: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.subText,
  },
  gradeBadge: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  gradeBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  resultCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 18,
    padding: 16,
  },
  resultText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.34)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "72%",
    paddingBottom: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  optionList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  optionItem: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
});