import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

const PET_STORAGE_KEY = "mungnyang-pet-profiles";
const CURRENT_PET_KEY = "mungnyang-current-pet";
const NAMING_HISTORY_KEY = "mungnyang-naming-history";

type NamingHistoryItem = {
  id: string;
  createdAt: string;
  petId: string;
  petName: string;
  flowKey: string;
  soundKey: string;
  impressionKey: string;
  energyKey: string;
  bondKey: string;
  closingKey: string;
};

type NamingResult = {
  title: string;
  summary: string;
  nameFlow: string;
  soundMood: string;
  impression: string;
  energyMatch: string;
  ownerBond: string;
  closing: string;
  flowKey: string;
  soundKey: string;
  impressionKey: string;
  energyKey: string;
  bondKey: string;
  closingKey: string;
};

const flowPool = [
  {
    key: "flow-soft",
    title: "부드럽게 흐르는 이름",
    summary:
      "이 이름은 전반적으로 부드럽고 편안하게 이어지는 결이 강해요. 자주 불러도 부담이 적고 정이 천천히 깊어지는 느낌을 줄 수 있어요.",
    detail:
      "이름의 울림이 과하게 튀지 않아서 일상 속에서 자연스럽게 스며드는 장점이 있어요.",
  },
  {
    key: "flow-bright",
    title: "밝고 가벼운 이름",
    summary:
      "이 이름은 발음했을 때 밝고 통통 튀는 리듬감이 살아나는 편이에요. 친근하고 사랑스러운 인상을 만들기 쉬운 이름이에요.",
    detail:
      "짧게 불러도 생동감이 있고, 반응을 주고받는 상황에서 매력이 더 크게 느껴질 수 있어요.",
  },
  {
    key: "flow-clear",
    title: "또렷하게 남는 이름",
    summary:
      "이 이름은 발음의 선이 비교적 분명해서 기억에 잘 남는 흐름을 가지고 있어요.",
    detail:
      "부르면 인상이 선명하게 남는 편이라, 존재감 있는 분위기를 만들기 좋은 이름일 수 있어요.",
  },
  {
    key: "flow-warm",
    title: "따뜻한 정이 느껴지는 이름",
    summary:
      "이 이름은 듣는 순간 포근하고 정감 있는 분위기를 만들어주는 결이 있어요.",
    detail:
      "가까운 거리에서 자주 부를수록 더 애착이 깊어지는 이름의 흐름을 가진 편이에요.",
  },
  {
    key: "flow-lovely",
    title: "애칭처럼 사랑스러운 이름",
    summary:
      "이 이름은 자꾸 불러보고 싶게 만드는 친밀한 매력이 있어요. 애칭처럼 자연스럽게 입에 붙는 장점이 느껴져요.",
    detail:
      "가볍게 불러도 귀엽고 다정한 인상을 줄 수 있어서 정서적 교감과 잘 어울릴 수 있어요.",
  },
  {
    key: "flow-elegant",
    title: "정돈되고 세련된 이름",
    summary:
      "이 이름은 지나치게 가볍지 않고, 단정하면서도 세련된 인상을 주는 흐름이 있어요.",
    detail:
      "차분한 존재감과 안정적인 무드를 함께 느끼게 해주는 이름의 결이 살아 있어요.",
  },
];

const soundPool = [
  {
    key: "sound-round",
    text: "발음의 끝이 둥글고 부드럽게 떨어지는 편이라, 이름 전체에서 포근하고 편안한 분위기가 느껴질 수 있어요.",
  },
  {
    key: "sound-light",
    text: "발음의 텐션이 가볍고 산뜻해서, 귀엽고 통통 튀는 인상을 만들기 쉬운 이름이에요.",
  },
  {
    key: "sound-stable",
    text: "이름의 소리 결이 안정적이라 자주 불러도 질리지 않고, 일상적인 호칭으로 오래 잘 어울릴 가능성이 커요.",
  },
  {
    key: "sound-soft-end",
    text: "끝음이 부드럽게 감싸지는 느낌이 있어서 다정하고 친근한 무드를 주기 쉬워요.",
  },
  {
    key: "sound-clear-end",
    text: "끝음이 비교적 또렷해서 불렀을 때 존재감이 선명하게 살아나는 편이에요.",
  },
  {
    key: "sound-cute-bounce",
    text: "소리의 리듬이 귀엽고 가볍게 튀는 편이라, 애칭처럼 부르기 좋은 이름의 매력이 있어요.",
  },
];

const impressionPool = [
  {
    key: "impression-friendly",
    text: "처음 들었을 때도 거리감이 적고 친근하게 느껴지는 이름이라, 정이 빨리 붙는 인상을 줄 수 있어요.",
  },
  {
    key: "impression-lovely",
    text: "사랑스럽고 보호해주고 싶은 이미지가 자연스럽게 따라오는 이름의 분위기가 있어요.",
  },
  {
    key: "impression-neat",
    text: "단정하고 정리된 인상이 느껴져서 차분하고 안정적인 존재감으로 연결되기 쉬워요.",
  },
  {
    key: "impression-bright",
    text: "밝고 경쾌한 이미지가 먼저 떠오르는 편이라, 에너지 있는 아이와 특히 잘 어울릴 수 있어요.",
  },
  {
    key: "impression-gentle",
    text: "전체적으로 부드럽고 온순한 분위기를 만들어줘서, 차분한 매력을 가진 아이와 잘 맞을 가능성이 커요.",
  },
  {
    key: "impression-special",
    text: "흔한 느낌보다는 조금 더 특별하고 기억에 남는 인상을 주는 이름이에요.",
  },
];

const energyPool = [
  {
    key: "energy-calm",
    text: "전체적으로는 안정과 편안함 쪽의 기운이 강하게 느껴져요. 일상적인 교감 안에서 이름의 매력이 더 잘 살아날 수 있어요.",
  },
  {
    key: "energy-lively",
    text: "밝고 발랄한 기운이 깔려 있어서, 부를 때마다 생기 있는 분위기를 만들어줄 수 있어요.",
  },
  {
    key: "energy-warm",
    text: "따뜻하고 다정한 기운이 느껴져 보호자와의 정서적 거리감을 줄여주는 데 잘 어울릴 수 있어요.",
  },
  {
    key: "energy-balanced",
    text: "특정 방향으로 과하게 치우치지 않고 균형감 있게 느껴지는 이름이라 오래 불러도 편안할 가능성이 커요.",
  },
  {
    key: "energy-soft-bond",
    text: "강한 존재감보다 은근한 애착과 친밀감을 높여주는 쪽의 기운이 잘 살아 있어요.",
  },
  {
    key: "energy-clean",
    text: "맑고 깔끔한 인상이 느껴지는 이름이라, 선명하고 좋은 이미지를 오래 유지하기 쉬워요.",
  },
];

const bondPool = [
  {
    key: "bond-close",
    text: "보호자가 이 이름을 부를 때 애칭처럼 자연스럽게 정이 쌓일 가능성이 커요. 자주 부를수록 이름의 매력이 깊어질 수 있어요.",
  },
  {
    key: "bond-comfort",
    text: "이 이름은 부르는 사람과 듣는 사람 모두에게 비교적 편안한 감정을 주기 쉬워서, 관계의 온도를 부드럽게 유지해줄 수 있어요.",
  },
  {
    key: "bond-affection",
    text: "짧게 불러도 애정이 실리기 쉬운 구조라, 보호자와의 애착 표현에 잘 어울릴 수 있어요.",
  },
  {
    key: "bond-trust",
    text: "처음엔 잔잔하지만 시간이 갈수록 신뢰와 안정감이 쌓이는 관계에 특히 잘 어울리는 이름이에요.",
  },
  {
    key: "bond-playful",
    text: "반응을 주고받는 상황에서 이름의 매력이 더 크게 느껴져서, 놀이와 교감 속에서 정이 깊어지기 쉬워요.",
  },
  {
    key: "bond-gentle",
    text: "강한 자극보다는 차분한 애정과 돌봄의 분위기를 잘 담아내는 이름이라, 일상적인 케어와 잘 어울릴 수 있어요.",
  },
];

const closingPool = [
  {
    key: "closing-1",
    text: "전체적으로 이 이름은 자주 부를수록 더 좋은 결이 살아나는 타입이에요. 화려함보다 오래 곁에 두기 좋은 안정적인 매력이 느껴져요.",
  },
  {
    key: "closing-2",
    text: "이름 자체가 주는 인상이 부드럽고 정서적이라, 보호자와 아이 사이의 친밀감을 자연스럽게 깊게 만들어줄 가능성이 커요.",
  },
  {
    key: "closing-3",
    text: "과하게 튀지 않으면서도 기억에는 남는 이름이라, 일상 속에서 편안하게 사랑받기 좋은 작명 흐름이라고 볼 수 있어요.",
  },
  {
    key: "closing-4",
    text: "이 이름은 시간이 지날수록 더 잘 어울린다고 느껴질 가능성이 큰 타입이에요. 처음보다 나중에 더 애착이 깊어질 수 있어요.",
  },
  {
    key: "closing-5",
    text: "이름이 가진 부드러운 울림과 관계의 온도가 잘 맞아떨어질 가능성이 높아요. 오래 부를수록 정이 쌓이는 작명으로 보여요.",
  },
  {
    key: "closing-6",
    text: "전체적으로 균형감이 좋아서 특별히 과하지 않으면서도 충분히 사랑스러운 이름이에요. 일상 속에서 자연스럽게 빛나는 스타일이에요.",
  },
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getTodayKey() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pickNonRecent<T extends { key: string }>(
  pool: T[],
  seed: number,
  recentKeys: string[]
) {
  const filtered = pool.filter((item) => !recentKeys.includes(item.key));
  const source = filtered.length > 0 ? filtered : pool;
  return source[seed % source.length];
}

function buildNamingResult(args: {
  pet: SavedPetProfile;
  history: NamingHistoryItem[];
}): NamingResult {
  const { pet, history } = args;
  const todayKey = getTodayKey();

  const baseSeed = hashString(
    `${pet.id}|${pet.petName}|${pet.petType}|${pet.petGender}|${pet.breed}|${pet.birthDate}|${pet.birthTime}|${todayKey}`
  );

  const petHistory = history.filter((item) => item.petId === pet.id).slice(0, 7);

  const recentFlow = petHistory.map((item) => item.flowKey);
  const recentSound = petHistory.map((item) => item.soundKey);
  const recentImpression = petHistory.map((item) => item.impressionKey);
  const recentEnergy = petHistory.map((item) => item.energyKey);
  const recentBond = petHistory.map((item) => item.bondKey);
  const recentClosing = petHistory.map((item) => item.closingKey);

  const flow = pickNonRecent(flowPool, baseSeed + 1, recentFlow);
  const sound = pickNonRecent(soundPool, baseSeed + 2, recentSound);
  const impression = pickNonRecent(impressionPool, baseSeed + 3, recentImpression);
  const energy = pickNonRecent(energyPool, baseSeed + 4, recentEnergy);
  const bond = pickNonRecent(bondPool, baseSeed + 5, recentBond);
  const closing = pickNonRecent(closingPool, baseSeed + 6, recentClosing);

  const title = `"${pet.petName}" 이름 풀이`;
  const summary = `${pet.petName}라는 이름은 "${flow.title}"의 흐름이 강하게 느껴져요. ${flow.summary}`;

  return {
    title,
    summary,
    nameFlow: `${flow.title} · ${flow.detail}`,
    soundMood: sound.text,
    impression: impression.text,
    energyMatch: energy.text,
    ownerBond: bond.text,
    closing: closing.text,
    flowKey: flow.key,
    soundKey: sound.key,
    impressionKey: impression.key,
    energyKey: energy.key,
    bondKey: bond.key,
    closingKey: closing.key,
  };
}

export default function NamingScreen() {
  const [pets, setPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NamingResult | null>(null);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const loadPets = useCallback(async () => {
    try {
      const [petsRaw, currentPetRaw] = await Promise.all([
        AsyncStorage.getItem(PET_STORAGE_KEY),
        AsyncStorage.getItem(CURRENT_PET_KEY),
      ]);

      const parsedPets = petsRaw ? JSON.parse(petsRaw) : [];
      const petList: SavedPetProfile[] = Array.isArray(parsedPets) ? parsedPets : [];
      setPets(petList);

      if (currentPetRaw) {
        const currentPet: SavedPetProfile = JSON.parse(currentPetRaw);
        const exists = petList.some((pet) => pet.id === currentPet.id);
        if (exists) {
          setSelectedPetId(currentPet.id);
          return;
        }
      }

      if (petList.length > 0) {
        setSelectedPetId(petList[0].id);
      } else {
        setSelectedPetId("");
      }
    } catch (error) {
      console.error("반려동물 목록 불러오기 실패", error);
      setPets([]);
      setSelectedPetId("");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const handleAnalyze = async () => {
    if (!selectedPet) return;

    setIsLoading(true);
    setResult(null);

    try {
      const historyRaw = await AsyncStorage.getItem(NAMING_HISTORY_KEY);
      const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
      const history: NamingHistoryItem[] = Array.isArray(parsedHistory)
        ? parsedHistory
        : [];

      const generated = buildNamingResult({
        pet: selectedPet,
        history,
      });

      const historyItem: NamingHistoryItem = {
        id: `${Date.now()}-${selectedPet.id}`,
        createdAt: new Date().toISOString(),
        petId: selectedPet.id,
        petName: selectedPet.petName,
        flowKey: generated.flowKey,
        soundKey: generated.soundKey,
        impressionKey: generated.impressionKey,
        energyKey: generated.energyKey,
        bondKey: generated.bondKey,
        closingKey: generated.closingKey,
      };

      const updatedHistory = [historyItem, ...history].slice(0, 100);
      await AsyncStorage.setItem(
        NAMING_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      setTimeout(() => {
        setResult(generated);
        setIsLoading(false);
      }, 2200);
    } catch (error) {
      console.error("이름 풀이 실패", error);
      setIsLoading(false);
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
          <Text style={styles.heroBadgeText}>NAMING ANALYSIS</Text>
        </View>

        <Text style={styles.heroTitle}>이름 풀이 ✍️</Text>
        <Text style={styles.heroSubtitle}>
          현재 이름이 주는 울림과 분위기, 정서적인 결을 더 섬세하게 읽어드려요.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>반려동물 선택</Text>

        {pets.length === 0 ? (
          <Text style={styles.helperText}>
            등록된 반려동물이 없어요. 먼저 아이를 등록해 주세요.
          </Text>
        ) : (
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
        )}

        <View style={styles.actionWrap}>
          <AppButton
            title="이름 풀이하기"
            onPress={handleAnalyze}
            disabled={!selectedPet || isLoading}
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
            <Text style={styles.loadingTitle}>이름을 해석하는 중...</Text>
            <Text style={styles.loadingDesc}>
              이름이 가진 울림과 정서적인 흐름을 읽고 있어요.
            </Text>
          </View>
        </SectionCard>
      )}

      {!isLoading && result && (
        <>
          <SectionCard>
            <View style={styles.todayCard}>
              <Text style={styles.todayLabel}>NAME REPORT</Text>
              <Text style={styles.todayTitle}>{result.title}</Text>
              <Text style={styles.todaySummary}>{result.summary}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>이름 해석</Text>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>이름의 결</Text>
              <Text style={styles.resultCardDesc}>{result.nameFlow}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>발음 분위기</Text>
              <Text style={styles.resultCardDesc}>{result.soundMood}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>주는 인상</Text>
              <Text style={styles.resultCardDesc}>{result.impression}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>잘 맞는 기운</Text>
              <Text style={styles.resultCardDesc}>{result.energyMatch}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>보호자에게 느껴지는 이미지</Text>
              <Text style={styles.resultCardDesc}>{result.ownerBond}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>총평</Text>
            <View style={styles.closingCard}>
              <Text style={styles.closingText}>{result.closing}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  petChipWrap: {
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
  actionWrap: {
    marginTop: 18,
  },
  loadingBox: {
    alignItems: "center",
    paddingVertical: 14,
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
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
  },
  todayCard: {
    backgroundColor: "#FFF7EF",
    borderRadius: 20,
    padding: 18,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.secondary,
    letterSpacing: 0.6,
  },
  todayTitle: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.text,
  },
  todaySummary: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  resultCard: {
    backgroundColor: "#F7F2ED",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  resultCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  resultCardDesc: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  closingCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 18,
    padding: 16,
  },
  closingText: {
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.text,
  },
});