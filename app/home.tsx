import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";
const DAILY_FORTUNE_CACHE_KEY = "mungnyang-daily-fortune-cache";

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

type NameStyle =
  | "cute"
  | "soft"
  | "luxury"
  | "trendy"
  | "unique";

type NameKind = "animation" | "art" | "myth" | "meaning";

type RecommendedNameItem = {
  name: string;
  source: string;
  meaning: string;
  story: string;
  tags: string[];
};

type NameRecommendApiResponse = {
  success: boolean;
  data?: RecommendedNameItem[];
  message?: string;
};

const STYLE_OPTIONS: Array<{ key: NameStyle; label: string }> = [
  { key: "cute", label: "귀여운" },
  { key: "soft", label: "부드러운" },
  { key: "luxury", label: "고급스러운" },
  { key: "trendy", label: "트렌디한" },
  { key: "unique", label: "유니크한" },
];

const KIND_OPTIONS: Array<{ key: NameKind; label: string }> = [
  { key: "animation", label: "애니 · 영화" },
  { key: "art", label: "명화 · 예술" },
  { key: "myth", label: "신화 · 전설" },
  { key: "meaning", label: "좋은 의미" },
];

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

export default function HomeScreen() {
  const [savedPets, setSavedPets] = useState<SavedPetProfile[]>([]);
  const [dailyCacheMap, setDailyCacheMap] = useState<
    Record<string, DailyFortuneCacheItem>
  >({});
  const [isLoadingSavedData, setIsLoadingSavedData] = useState(true);

  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState<PetType>("dog");
  const [selectedGender, setSelectedGender] = useState<PetGender>("male");
  const [selectedKind, setSelectedKind] = useState<NameKind>("animation");
  const [selectedStyle, setSelectedStyle] = useState<NameStyle>("cute");
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedNameItem[]>([]);

  const loadSavedData = useCallback(async () => {
    try {
      const [savedPetsRaw, dailyCacheRaw] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY),
      ]);

      const parsedPets: SavedPetProfile[] = savedPetsRaw
        ? JSON.parse(savedPetsRaw)
        : [];
      const pets = Array.isArray(parsedPets) ? parsedPets : [];
      setSavedPets(pets);

      const parsedCache = dailyCacheRaw ? JSON.parse(dailyCacheRaw) : {};
      setDailyCacheMap(
        parsedCache && typeof parsedCache === "object" ? parsedCache : {}
      );

      const currentPet = await AsyncStorage.getItem(CURRENT_PET_KEY);
      if (!currentPet && pets.length > 0) {
        await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pets[0]));
      }
    } catch (error) {
      console.error("저장된 데이터를 불러오지 못했습니다.", error);
      setSavedPets([]);
      setDailyCacheMap({});
    } finally {
      setIsLoadingSavedData(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
    }, [loadSavedData])
  );

  const savePetsToStorage = async (pets: SavedPetProfile[]) => {
    await AsyncStorage.setItem(PET_STORAGE_KEY, JSON.stringify(pets));
    setSavedPets(pets);

    if (pets.length > 0) {
      await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pets[0]));
    } else {
      await AsyncStorage.removeItem(CURRENT_PET_KEY);
    }
  };

  const handleSelectSavedPet = async (pet: SavedPetProfile) => {
    await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pet));

    const todayKey = getTodayKey();
    const todayFortune = dailyCacheMap[pet.id];

    if (todayFortune && todayFortune.dateKey === todayKey) {
      router.push({
        pathname: "/(tabs)/result" as const,
        params: {
          petId: todayFortune.petId,
          petName: todayFortune.petName,
          petType: todayFortune.petType,
          petGender: todayFortune.petGender,
          isNeutered: todayFortune.isNeutered ? "true" : "false",
          breed: todayFortune.breed,
          birthDate: todayFortune.birthDate,
          birthTime: todayFortune.birthTime,
          summary: todayFortune.summary,
          health: todayFortune.health,
          appetite: todayFortune.appetite,
          mood: todayFortune.mood,
          caution: todayFortune.caution,
          luckyColor: todayFortune.luckyColor,
          luckyItem: todayFortune.luckyItem,
          recommendedAction: todayFortune.recommendedAction,
        },
      });
      return;
    }

    router.push({
      pathname: "/(tabs)/loading" as const,
      params: {
        petId: pet.id,
        petName: pet.petName,
        petType: pet.petType,
        petGender: pet.petGender,
        isNeutered: pet.isNeutered ? "true" : "false",
        breed: pet.breed,
        birthDate: pet.birthDate,
        birthTime: pet.birthTime,
      },
    });
  };

  const handleDeleteSavedPet = async (id: string) => {
    const targetPet = savedPets.find((pet) => pet.id === id);
    if (!targetPet) return;

    const runDelete = async () => {
      try {
        const updatedPets = savedPets.filter((pet) => pet.id !== id);

        const [historyRaw, dailyCacheRaw] = await Promise.all([
          AsyncStorage.getItem(FORTUNE_HISTORY_KEY),
          AsyncStorage.getItem(DAILY_FORTUNE_CACHE_KEY),
        ]);

        const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
        const parsedDailyCache = dailyCacheRaw ? JSON.parse(dailyCacheRaw) : {};

        const updatedHistory = Array.isArray(parsedHistory)
          ? parsedHistory.filter((item: any) => item.petId !== id)
          : [];

        const updatedDailyCache: Record<string, DailyFortuneCacheItem> =
          parsedDailyCache && typeof parsedDailyCache === "object"
            ? (Object.fromEntries(
                Object.entries(
                  parsedDailyCache as Record<string, DailyFortuneCacheItem>
                ).filter(([key]) => key !== id)
              ) as Record<string, DailyFortuneCacheItem>)
            : {};

        await Promise.all([
          savePetsToStorage(updatedPets),
          AsyncStorage.setItem(
            FORTUNE_HISTORY_KEY,
            JSON.stringify(updatedHistory)
          ),
          AsyncStorage.setItem(
            DAILY_FORTUNE_CACHE_KEY,
            JSON.stringify(updatedDailyCache)
          ),
        ]);

        setDailyCacheMap(updatedDailyCache);
      } catch (error) {
        console.error("반려동물 삭제 실패", error);

        if (Platform.OS === "web") {
          window.alert("반려동물을 삭제하지 못했어요.");
        } else {
          Alert.alert("삭제 실패", "반려동물을 삭제하지 못했어요.");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `${targetPet.petName} 정보를 삭제할까요?\n운세 기록과 오늘 운세 데이터도 함께 삭제됩니다.`
      );

      if (confirmed) {
        await runDelete();
      }
      return;
    }

    Alert.alert(
      "반려동물 삭제",
      `${targetPet.petName} 정보를 삭제할까요?\n운세 기록과 오늘 운세 데이터도 함께 삭제됩니다.`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: () => {
            runDelete();
          },
        },
      ]
    );
  };

  const handleEditSavedPet = async (pet: SavedPetProfile) => {
    await AsyncStorage.setItem(CURRENT_PET_KEY, JSON.stringify(pet));

    router.push({
      pathname: "/(tabs)/register",
      params: {
        editId: pet.id,
        petName: pet.petName,
        petType: pet.petType,
        petGender: pet.petGender,
        isNeutered: pet.isNeutered ? "true" : "false",
        breed: pet.breed,
        birthDate: pet.birthDate,
        birthTime: pet.birthTime,
        isBirthTimeKnown: pet.isBirthTimeKnown ? "true" : "false",
      },
    });
  };

  const handleRecommendNames = async () => {
    try {
      setIsNameLoading(true);
      setRecommendations([]);
  
      const [response] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/names/recommend`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            petType: selectedType,
            gender: selectedGender,
            kind: selectedKind,
            style: selectedStyle,
            limit: 10,
          }),
        }),
        wait(2300),
      ]);
  
      const json = await response.json();
  
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "이름 추천 실패");
      }
  
      setRecommendations(json.data);
    } catch (error) {
      console.error(error);
      alert("이름 추천 실패");
    } finally {
      setIsNameLoading(false);
    }
  };

  const openNameModal = () => {
    setRecommendations([]);
    setIsNameLoading(false);
    setIsNameModalVisible(true);
  };

  const closeNameModal = () => {
    if (isNameLoading) return;
    setIsNameModalVisible(false);
  };

  const todayKey = getTodayKey();

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>FREE FORTUNE</Text>
          </View>

          <Text style={styles.heroTitle}>무료운세 🐾</Text>
          <Text style={styles.heroSubtitle}>
            등록된 우리 아이 카드를 눌러 오늘의 운세를 확인해보세요.
          </Text>
        </View>

        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>등록된 우리 아이</Text>
            <Text style={styles.sectionCaption}>
              하루 1번 운세를 볼 수 있고, 본 뒤에는 오늘 결과를 다시 열 수 있어요.
            </Text>
          </View>

          {isLoadingSavedData ? (
            <Text style={styles.helperText}>저장된 목록을 불러오는 중...</Text>
          ) : savedPets.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>아직 등록된 아이가 없어요</Text>
              <Text style={styles.emptyDesc}>
                먼저 등록 탭에서 반려동물을 등록해 주세요.
              </Text>

              <AppButton
                title="아이 등록하기"
                onPress={() => router.push("/(tabs)/register")}
                variant="secondary"
              />
            </View>
          ) : (
            <>
              {savedPets.map((pet) => {
                const emoji = pet.petType === "cat" ? "🐱" : "🐶";
                const typeLabel = pet.petType === "cat" ? "고양이" : "강아지";
                const todayFortune = dailyCacheMap[pet.id];
                const hasViewedToday =
                  !!todayFortune && todayFortune.dateKey === todayKey;

                return (
                  <View key={pet.id} style={styles.savedPetCard}>
                    <Pressable
                      style={[
                        styles.savedPetMain,
                        hasViewedToday && styles.savedPetMainDone,
                      ]}
                      onPress={() => handleSelectSavedPet(pet)}
                    >
                      <View style={styles.savedPetTopRow}>
                        <Text style={styles.savedPetName}>
                          {emoji} {pet.petName}
                        </Text>

                        <View style={styles.savedPetTypeBadge}>
                          <Text style={styles.savedPetTypeBadgeText}>
                            {typeLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.savedPetMeta}>{pet.breed}</Text>
                      <Text style={styles.savedPetMeta}>
                        생일 · {pet.birthDate}
                      </Text>
                      <Text style={styles.savedPetMeta}>
                        시간 · {pet.birthTime}
                      </Text>

                      <View style={styles.fortuneStatusRow}>
                        <View
                          style={[
                            styles.statusBadge,
                            hasViewedToday
                              ? styles.statusBadgeDone
                              : styles.statusBadgeReady,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusBadgeText,
                              hasViewedToday
                                ? styles.statusBadgeTextDone
                                : styles.statusBadgeTextReady,
                            ]}
                          >
                            {hasViewedToday ? "오늘 운세 완료" : "오늘 운세 가능"}
                          </Text>
                        </View>

                        <Text style={styles.fortuneCTA}>
                          {hasViewedToday
                            ? "눌러서 오늘 결과 다시 보기"
                            : "눌러서 오늘 운세 보기"}
                        </Text>
                      </View>
                    </Pressable>

                    <View style={styles.savedPetActions}>
                      <View style={styles.actionHalf}>
                        <AppButton
                          title="수정"
                          onPress={() => handleEditSavedPet(pet)}
                          variant="secondary"
                        />
                      </View>

                      <View style={styles.actionHalf}>
                        <AppButton
                          title="삭제"
                          onPress={() => handleDeleteSavedPet(pet.id)}
                        />
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={styles.bottomAddWrap}>
                <AppButton
                  title="아이 등록하기"
                  onPress={() => router.push("/(tabs)/register")}
                  variant="outline"
                />
              </View>
            </>
          )}
        </SectionCard>

        <SectionCard>
          <View style={styles.nameRecommendCard}>
            <View style={styles.nameRecommendTop}>
              <Text style={styles.nameRecommendEmoji}>✨</Text>
              <Text style={styles.nameRecommendTitle}>
                새로 가족이 된 아이, 이름이 필요하신가요?
              </Text>
            </View>

            <Text style={styles.nameRecommendDesc}>
              이름 종류와 분위기를 같이 반영해서
              {"\n"}
              스토리가 있는 이름을 추천해드려요.
            </Text>

            <View style={styles.nameRecommendButtonWrap}>
              <AppButton
                title="이름 추천받기"
                onPress={openNameModal}
                variant="secondary"
              />
            </View>
          </View>
        </SectionCard>
      </ScrollView>

      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeNameModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBox}>
                  <Text style={styles.modalTitle}>이름 추천 ✨</Text>
                  <Text style={styles.modalSubtitle}>
                    종류와 분위기를 함께 반영해서 이름 10개를 추천해드려요.
                  </Text>
                </View>

                <Pressable
                  style={styles.modalCloseButton}
                  onPress={closeNameModal}
                  disabled={isNameLoading}
                >
                  <Text style={styles.modalCloseText}>닫기</Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>아이 종류</Text>
              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedType === "dog" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedType("dog")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedType === "dog" && styles.choiceTextActive,
                    ]}
                  >
                    🐶 강아지
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedType === "cat" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedType("cat")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedType === "cat" && styles.choiceTextActive,
                    ]}
                  >
                    🐱 고양이
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>성별</Text>
              <View style={styles.row}>
                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedGender === "male" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedGender("male")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedGender === "male" && styles.choiceTextActive,
                    ]}
                  >
                    남아
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.choiceButton,
                    selectedGender === "female" && styles.choiceButtonActive,
                  ]}
                  onPress={() => setSelectedGender("female")}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      selectedGender === "female" && styles.choiceTextActive,
                    ]}
                  >
                    여아
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.nameSectionTitle}>이름 종류</Text>
              <View style={styles.chipWrap}>
                {KIND_OPTIONS.map((item) => {
                  const active = selectedKind === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedKind(item.key)}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.nameSectionTitle}>원하는 분위기</Text>
              <View style={styles.chipWrap}>
                {STYLE_OPTIONS.map((style) => {
                  const active = selectedStyle === style.key;
                  return (
                    <Pressable
                      key={style.key}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => setSelectedStyle(style.key)}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {style.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.nameRecommendButtonWrap}>
                <AppButton
                  title={recommendations.length > 0 ? "다시 추천받기" : "이름 추천받기"}
                  onPress={handleRecommendNames}
                  variant="secondary"
                />
              </View>

              {isNameLoading && (
                <View style={styles.loadingCard}>
                  <Text style={styles.loadingEmoji}>
                    {selectedType === "dog" ? "🐶" : "🐱"}
                  </Text>
                  <ActivityIndicator size="large" color={COLORS.secondary} />
                  <Text style={styles.loadingTitle}>이름을 찾고 있어요...</Text>
                  <Text style={styles.loadingDesc}>
                    {selectedKind === "animation" &&
                      "선택한 분위기에 맞는 애니 · 영화 이름을 고르는 중..."}
                    {selectedKind === "art" &&
                      "선택한 분위기에 맞는 명화 · 예술 이름을 고르는 중..."}
                    {selectedKind === "myth" &&
                      "선택한 분위기에 맞는 신화 · 전설 이름을 고르는 중..."}
                    {selectedKind === "meaning" &&
                      "선택한 분위기에 맞는 의미형 이름을 고르는 중..."}
                  </Text>
                </View>
              )}

              {!isNameLoading && recommendations.length > 0 && (
                <View style={styles.recommendListWrap}>
                  <Text style={styles.recommendListTitle}>추천 이름 10개</Text>
                  <Text style={styles.recommendListSub}>
                    같은 조건이어도 최근 본 이름은 최대한 피해서 보여드려요.
                  </Text>

                  {recommendations.map((item, index) => (
                    <View key={`${item.name}-${index}`} style={styles.nameCard}>
                      <View style={styles.nameTopRow}>
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.nameValue}>{item.name}</Text>
                      </View>

                      <Text style={styles.nameSource}>{item.source}</Text>
                      <Text style={styles.nameMeaning}>의미 · {item.meaning}</Text>
                      <Text style={styles.nameStory}>{item.story}</Text>

                      <View style={styles.tagWrap}>
                        {item.tags.map((tag) => (
                          <View key={`${item.name}-${tag}`} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}
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
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 26,
    padding: 22,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#F5ECE5",
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  emptyBox: {
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  savedPetCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  savedPetMain: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 4,
  },
  savedPetMainDone: {
    backgroundColor: "#FFF8F0",
  },
  savedPetTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  savedPetName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  savedPetTypeBadge: {
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  savedPetTypeBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  savedPetMeta: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 18,
  },
  fortuneStatusRow: {
    marginTop: 12,
    gap: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusBadgeReady: {
    backgroundColor: "#EEF8EE",
  },
  statusBadgeDone: {
    backgroundColor: "#FFF1E4",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusBadgeTextReady: {
    color: "#2F7D32",
  },
  statusBadgeTextDone: {
    color: "#A85C1C",
  },
  fortuneCTA: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  savedPetActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionHalf: {
    flex: 1,
  },
  bottomAddWrap: {
    marginTop: 14,
  },
  nameRecommendCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 20,
    padding: 18,
  },
  nameRecommendTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameRecommendEmoji: {
    fontSize: 22,
  },
  nameRecommendTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 24,
  },
  nameRecommendDesc: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  nameRecommendButtonWrap: {
    marginTop: 16,
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
    maxHeight: "88%",
  },
  modalContent: {
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  modalTitleBox: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.subText,
  },
  modalCloseButton: {
    backgroundColor: "#F3EAE2",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  nameSectionTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  choiceButtonActive: {
    backgroundColor: COLORS.accent,
  },
  choiceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B625C",
  },
  choiceTextActive: {
    color: COLORS.text,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B625C",
  },
  chipTextActive: {
    color: COLORS.text,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: 18,
    marginTop: 18,
    backgroundColor: "#FFFDFB",
    borderRadius: 18,
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
  recommendListWrap: {
    marginTop: 18,
  },
  recommendListTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  recommendListSub: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  nameCard: {
    backgroundColor: "#F7F2ED",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  nameTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.text,
  },
  nameValue: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  nameSource: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  nameMeaning: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
  },
  nameStory: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.subText,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: "#FFFDFB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.secondary,
  },
});