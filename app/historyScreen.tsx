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
import type { SavedPetProfile } from "../types";
import {
  getHistoryItems,
  HISTORY_STORAGE_KEY,
  type HistoryItem,
} from "../utils/historyStorage";

const PET_STORAGE_KEY = "mungnyang-pet-profiles";
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";

type LegacyFortuneHistoryItem = {
  id?: string;
  petId: string;
  petName: string;
  createdAt: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

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

function normalizeLegacyFortuneHistory(
  items: LegacyFortuneHistoryItem[]
): HistoryItem[] {
  return items.map((item, index) => ({
    id:
      item.id ??
      `fortune-${item.petId}-${item.createdAt ?? "no-date"}-${index}`,
    petId: item.petId,
    petName: item.petName,
    createdAt: item.createdAt,
    analysisType: "fortune",
    title: "무료운세",
    summary: item.summary,
    payload: {
      summary: item.summary,
      health: item.health,
      appetite: item.appetite,
      mood: item.mood,
      caution: item.caution,
      luckyColor: item.luckyColor,
      luckyItem: item.luckyItem,
      recommendedAction: item.recommendedAction,
    },
  }));
}

function getHistoryTypeLabel(type: HistoryItem["analysisType"]) {
  if (type === "fortune") return "무료운세";
  if (type === "personality") return "성격 분석";
  return "작명 풀이";
}

export default function HistoryScreen() {
  const [pets, setPets] = useState<SavedPetProfile[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [savedPetsRaw, legacyFortuneRaw, premiumHistory] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
        getHistoryItems(),
      ]);

      const petList = savedPetsRaw ? JSON.parse(savedPetsRaw) : [];
      const legacyFortuneList = legacyFortuneRaw ? JSON.parse(legacyFortuneRaw) : [];

      const validPets = Array.isArray(petList) ? petList : [];
      const validLegacyFortune = Array.isArray(legacyFortuneList)
        ? (legacyFortuneList as LegacyFortuneHistoryItem[])
        : [];
      const validPremiumHistory = Array.isArray(premiumHistory)
        ? premiumHistory
        : [];

      const normalizedFortune = normalizeLegacyFortuneHistory(validLegacyFortune);
      const mergedHistory = [...normalizedFortune, ...validPremiumHistory].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPets(validPets);
      setHistory(mergedHistory);

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

    try {
      const [legacyFortuneRaw, premiumRaw] = await Promise.all([
        AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY),
      ]);

      const legacyFortuneList = legacyFortuneRaw ? JSON.parse(legacyFortuneRaw) : [];
      const premiumList = premiumRaw ? JSON.parse(premiumRaw) : [];

      const updatedLegacyFortune = Array.isArray(legacyFortuneList)
        ? legacyFortuneList.filter((item: LegacyFortuneHistoryItem) => item.petId !== selectedPet.id)
        : [];

      const updatedPremiumHistory = Array.isArray(premiumList)
        ? premiumList.filter((item: HistoryItem) => item.petId !== selectedPet.id)
        : [];

      await Promise.all([
        AsyncStorage.setItem(
          FORTUNE_HISTORY_KEY,
          JSON.stringify(updatedLegacyFortune)
        ),
        AsyncStorage.setItem(
          HISTORY_STORAGE_KEY,
          JSON.stringify(updatedPremiumHistory)
        ),
      ]);

      await loadData();
    } catch (error) {
      console.error("기록 삭제 실패", error);
    }
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
        <Text style={styles.heroTitle}>분석 기록 📚</Text>
        <Text style={styles.heroSubtitle}>
          등록된 반려동물을 선택하면 무료운세와 유료 분석 기록을 함께 볼 수 있어요.
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
                {getPetVisual(selectedPet.petType, selectedPet.breed)}{" "}
                {selectedPet.petName}
              </Text>
              <Text style={styles.petMeta}>
                {selectedPet.petType === "cat" ? "고양이" : "강아지"} ·{" "}
                {selectedPet.breed}
              </Text>
              <Text style={styles.subText}>생일: {selectedPet.birthDate}</Text>
            </SectionCard>
          )}

          <SectionCard>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>선택한 아이의 기록</Text>
              {filteredHistory.length > 0 && (
                <Pressable style={styles.clearButton} onPress={handleDeleteHistory}>
                  <Text style={styles.clearButtonText}>이 아이 기록 삭제</Text>
                </Pressable>
              )}
            </View>

            {filteredHistory.length === 0 ? (
              <Text style={styles.helperText}>아직 이 아이의 분석 기록이 없어요.</Text>
            ) : (
              filteredHistory.map((item, index) => (
                <View
                  key={`${item.id ?? "history"}-${item.createdAt ?? "no-date"}-${index}`}
                  style={styles.historyCard}
                >
                  <Text style={styles.historyDate}>
                    {formatDateTime(item.createdAt)}
                  </Text>

                  <View style={styles.historyTypeBadge}>
                    <Text style={styles.historyTypeBadgeText}>
                      {getHistoryTypeLabel(item.analysisType)}
                    </Text>
                  </View>

                  <View style={styles.historyBlock}>
                    <Text style={styles.historyLabel}>{item.title}</Text>
                    <Text style={styles.historyText}>{item.summary}</Text>
                  </View>

                  {item.analysisType === "fortune" && (
                    <>
                      <View style={styles.historyGrid}>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>건강운</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.health}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>식욕운</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.appetite}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>기분운</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.mood}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>주의</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.caution}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.bottomMetaWrap}>
                        <View style={styles.metaPill}>
                          <Text style={styles.metaPillText}>
                            행운 컬러 · {item.payload.luckyColor}
                          </Text>
                        </View>
                        <View style={styles.metaPill}>
                          <Text style={styles.metaPillText}>
                            행운 아이템 · {item.payload.luckyItem}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recommendBox}>
                        <Text style={styles.recommendLabel}>추천 행동</Text>
                        <Text style={styles.recommendText}>
                          {item.payload.recommendedAction}
                        </Text>
                      </View>
                    </>
                  )}

                  {item.analysisType === "personality" && (
                    <>
                      <View style={styles.metaSection}>
                        <Text style={styles.metaSectionTitle}>핵심 성향 타입</Text>
                        <Text style={styles.metaSectionText}>
                          {item.payload.coreType}
                        </Text>
                      </View>

                      <View style={styles.historyGrid}>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>기본 성격</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.personality}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>감정 표현</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.emotionStyle}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>사회성</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.socialStyle}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>스트레스</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.stressPoint}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recommendBox}>
                        <Text style={styles.recommendLabel}>유대 방식</Text>
                        <Text style={styles.recommendText}>
                          {item.payload.bondStyle}
                        </Text>
                      </View>

                      <View style={styles.recommendBox}>
                        <Text style={styles.recommendLabel}>돌봄 팁</Text>
                        <Text style={styles.recommendText}>
                          {item.payload.careTip}
                        </Text>
                      </View>
                    </>
                  )}

                  {item.analysisType === "naming" && (
                    <>
                      <View style={styles.metaSection}>
                        <Text style={styles.metaSectionTitle}>이름의 전체 기운</Text>
                        <Text style={styles.metaSectionText}>
                          {item.payload.nameEnergy}
                        </Text>
                      </View>

                      <View style={styles.historyGrid}>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>첫인상</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.firstImpression}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>숨은 매력</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.hiddenCharm}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>관계 흐름</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.relationshipFlow}
                          </Text>
                        </View>
                        <View style={styles.historyMiniCard}>
                          <Text style={styles.historyMiniLabel}>좋은 포인트</Text>
                          <Text style={styles.historyMiniText}>
                            {item.payload.luckyPoint}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.recommendBox}>
                        <Text style={styles.recommendLabel}>이름 활용 팁</Text>
                        <Text style={styles.recommendText}>
                          {item.payload.namingTip}
                        </Text>
                      </View>
                    </>
                  )}
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
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#F5ECE5",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  helperText: { fontSize: 14, lineHeight: 22, color: COLORS.subText },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    marginBottom: 16,
  },

  petChipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  petChip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
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

  historyCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  historyDate: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 10,
  },
  historyTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF3E8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  historyTypeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },

  historyBlock: { marginBottom: 12 },
  historyLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 6,
  },
  historyText: { fontSize: 14, lineHeight: 22, color: COLORS.text },

  historyGrid: { gap: 8 },
  historyMiniCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
  },
  historyMiniLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 6,
  },
  historyMiniText: { fontSize: 13, lineHeight: 20, color: COLORS.text },

  bottomMetaWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metaPill: {
    backgroundColor: "#EFE7DF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: { fontSize: 12, fontWeight: "800", color: COLORS.text },

  metaSection: {
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
  },
  metaSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 6,
  },
  metaSectionText: { fontSize: 13, lineHeight: 20, color: COLORS.text },

  recommendBox: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
  },
  recommendLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
    marginBottom: 6,
  },
  recommendText: { fontSize: 13, lineHeight: 20, color: COLORS.text },
});