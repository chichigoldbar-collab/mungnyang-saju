import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { FortuneHistoryItem, SavedPetProfile } from "../types";

const PET_STORAGE_KEY = "mungnyang-pet-profiles";
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";

function getPetVisual(petType: SavedPetProfile["petType"], breed: string) {
  const lower = breed.toLowerCase();
  if (petType === "dog") {
    if (lower.includes("포메")) return "🐕";
    if (lower.includes("푸들")) return "🐩";
    return "🐶";
  }
  if (lower.includes("러시안")) return "🐈‍⬛";
  return "🐱";
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export default function HistoryScreen() {
  const [pets, setPets] = useState<SavedPetProfile[]>([]);
  const [history, setHistory] = useState<FortuneHistoryItem[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [savedPetsRaw, savedHistoryRaw] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
      ]);

      const petList = savedPetsRaw ? JSON.parse(savedPetsRaw) : [];
      const historyList = savedHistoryRaw ? JSON.parse(savedHistoryRaw) : [];

      const validPets = Array.isArray(petList) ? petList : [];
      const validHistory = Array.isArray(historyList) ? historyList : [];

      setPets(validPets);
      setHistory(validHistory);

      if (validPets.length === 0) {
        setSelectedPetId("");
      } else {
        setSelectedPetId((prev) => {
          const exists = validPets.some((pet) => pet.id === prev);
          return exists ? prev : validPets[0].id;
        });
      }
    } catch (error) {
      console.error("기록 화면 데이터 불러오기 실패", error);
      setPets([]);
      setHistory([]);
      setSelectedPetId("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const filteredHistory = useMemo(
    () => (selectedPet ? history.filter((item) => item.petId === selectedPet.id) : []),
    [history, selectedPet]
  );

  const handleDeleteHistory = async () => {
    if (!selectedPet) return;

    const updatedHistory = history.filter((item) => item.petId !== selectedPet.id);
    await AsyncStorage.setItem(FORTUNE_HISTORY_KEY, JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>HISTORY</Text>
        </View>
        <Text style={styles.heroTitle}>운세 기록 📚</Text>
        <Text style={styles.heroSubtitle}>
          등록된 반려동물을 선택하면 그 아이의 운세 기록만 따로 볼 수 있어요.
        </Text>
      </View>

      {isLoading ? (
        <SectionCard>
          <Text style={styles.helperText}>기록을 불러오는 중...</Text>
        </SectionCard>
      ) : pets.length === 0 ? (
        <SectionCard>
          <Text style={styles.emptyTitle}>등록된 반려동물이 없어요</Text>
          <Text style={styles.emptyDesc}>
            먼저 등록 탭에서 아이를 등록하면 기록을 모아볼 수 있어요.
          </Text>
          <AppButton
            title="등록하러 가기"
            onPress={() => router.replace("/(tabs)/register")}
          />
        </SectionCard>
      ) : (
        <>
          <SectionCard>
            <Text style={styles.sectionTitle}>아이 선택</Text>
            <View style={styles.petChipWrap}>
              {pets.map((pet) => {
                const active = selectedPetId === pet.id;
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
          </SectionCard>

          {selectedPet && (
            <SectionCard>
              <Text style={styles.sectionTitle}>선택된 아이</Text>
              <Text style={styles.petName}>
                {getPetVisual(selectedPet.petType, selectedPet.breed)} {selectedPet.petName}
              </Text>
              <Text style={styles.petMeta}>
                {selectedPet.petType === "cat" ? "고양이" : "강아지"} · {selectedPet.breed}
              </Text>
              <Text style={styles.subText}>생일: {selectedPet.birthDate}</Text>
            </SectionCard>
          )}

          <SectionCard>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>선택한 아이의 운세 기록</Text>
              {filteredHistory.length > 0 && (
                <Pressable style={styles.clearButton} onPress={handleDeleteHistory}>
                  <Text style={styles.clearButtonText}>이 아이 기록 삭제</Text>
                </Pressable>
              )}
            </View>

            {filteredHistory.length === 0 ? (
              <Text style={styles.helperText}>아직 이 아이의 운세 기록이 없어요.</Text>
            ) : (
              filteredHistory.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <Text style={styles.historyDate}>{formatDateTime(item.createdAt)}</Text>

                  <View style={styles.historyBlock}>
                    <Text style={styles.historyLabel}>오늘의 운세</Text>
                    <Text style={styles.historyText}>{item.summary}</Text>
                  </View>

                  <View style={styles.historyGrid}>
                    <View style={styles.historyMiniCard}>
                      <Text style={styles.historyMiniLabel}>건강운</Text>
                      <Text style={styles.historyMiniText}>{item.health}</Text>
                    </View>
                    <View style={styles.historyMiniCard}>
                      <Text style={styles.historyMiniLabel}>식욕운</Text>
                      <Text style={styles.historyMiniText}>{item.appetite}</Text>
                    </View>
                    <View style={styles.historyMiniCard}>
                      <Text style={styles.historyMiniLabel}>기분운</Text>
                      <Text style={styles.historyMiniText}>{item.mood}</Text>
                    </View>
                    <View style={styles.historyMiniCard}>
                      <Text style={styles.historyMiniLabel}>주의</Text>
                      <Text style={styles.historyMiniText}>{item.caution}</Text>
                    </View>
                  </View>

                  <View style={styles.bottomMetaWrap}>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>행운 컬러 · {item.luckyColor}</Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Text style={styles.metaPillText}>행운 아이템 · {item.luckyItem}</Text>
                    </View>
                  </View>

                  <View style={styles.recommendBox}>
                    <Text style={styles.recommendLabel}>추천 행동</Text>
                    <Text style={styles.recommendText}>{item.recommendedAction}</Text>
                  </View>
                </View>
              ))
            )}
          </SectionCard>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  heroCard: { backgroundColor: COLORS.primary, borderRadius: 26, padding: 22 },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  heroBadgeText: { fontSize: 11, fontWeight: "800", color: COLORS.primary },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" },
  heroSubtitle: { marginTop: 10, fontSize: 15, lineHeight: 24, color: "#F5ECE5" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 12 },
  helperText: { fontSize: 14, lineHeight: 22, color: COLORS.subText },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, lineHeight: 22, color: COLORS.subText, marginBottom: 16 },
  petChipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  petChip: { backgroundColor: "#F7F2ED", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  petChipActive: { backgroundColor: COLORS.accent },
  petChipText: { fontSize: 14, fontWeight: "700", color: "#6B625C" },
  petChipTextActive: { color: COLORS.text },
  petName: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  petMeta: { marginTop: 4, color: COLORS.subText },
  subText: { marginTop: 6, fontSize: 13, color: COLORS.muted },
  historyHeader: { marginBottom: 4 },
  clearButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3F0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  clearButtonText: { fontSize: 12, fontWeight: "800", color: "#A0523D" },
  historyCard: { backgroundColor: COLORS.bg, borderRadius: 18, padding: 14, marginTop: 10 },
  historyDate: { fontSize: 12, fontWeight: "800", color: COLORS.muted, marginBottom: 10 },
  historyBlock: { marginBottom: 12 },
  historyLabel: { fontSize: 13, fontWeight: "800", color: COLORS.secondary, marginBottom: 6 },
  historyText: { fontSize: 14, lineHeight: 22, color: COLORS.text },
  historyGrid: { gap: 8 },
  historyMiniCard: { backgroundColor: COLORS.card, borderRadius: 14, padding: 12 },
  historyMiniLabel: { fontSize: 12, fontWeight: "800", color: COLORS.muted, marginBottom: 6 },
  historyMiniText: { fontSize: 13, lineHeight: 20, color: COLORS.text },
  bottomMetaWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  metaPill: { backgroundColor: "#EFE7DF", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  metaPillText: { fontSize: 12, fontWeight: "800", color: COLORS.text },
  recommendBox: { marginTop: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 12 },
  recommendLabel: { fontSize: 12, fontWeight: "800", color: COLORS.muted, marginBottom: 6 },
  recommendText: { fontSize: 13, lineHeight: 20, color: COLORS.text },
});