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
const PERSONALITY_HISTORY_KEY = "mungnyang-personality-history";

type PersonalityHistoryItem = {
  id: string;
  createdAt: string;
  petId: string;
  petName: string;
  archetypeKey: string;
  emotionKey: string;
  relationKey: string;
  stressKey: string;
  routineKey: string;
  tipKey: string;
  closingKey: string;
};

type PersonalityResult = {
  title: string;
  summary: string;
  archetype: string;
  emotionStyle: string;
  relationStyle: string;
  stressPattern: string;
  routineFit: string;
  careTip: string;
  closing: string;
  archetypeKey: string;
  emotionKey: string;
  relationKey: string;
  stressKey: string;
  routineKey: string;
  tipKey: string;
  closingKey: string;
};

const archetypePool = [
  {
    key: "bright-player",
    title: "밝은 장난꾸러기형",
    summary:
      "기본적으로 반응이 빠르고 즐거움을 크게 표현하는 타입이에요. 익숙한 사람과 환경 안에서 매력이 더 또렷하게 살아날 수 있어요.",
    detail:
      "놀이와 리액션에서 에너지가 크게 올라오는 편이라, 반응을 잘 받아주면 만족도도 함께 커지는 성향이에요.",
  },
  {
    key: "soft-healer",
    title: "포근한 힐링형",
    summary:
      "자극이 강한 상황보다 편안하고 안정된 환경에서 훨씬 매력이 잘 드러나는 타입이에요.",
    detail:
      "조용한 교감과 익숙한 루틴을 좋아하는 편이라, 천천히 쌓이는 신뢰 안에서 성격의 장점이 더 잘 보여요.",
  },
  {
    key: "curious-observer",
    title: "호기심 관찰형",
    summary:
      "가볍게 넘어가는 것 같아 보여도 주변 흐름을 세심하게 살피는 타입이에요. 궁금한 것이 생기면 집중도가 높아질 수 있어요.",
    detail:
      "새로운 냄새, 분위기, 움직임에 관심을 두는 편이라 탐색 시간이 충분할수록 만족감이 높아질 수 있어요.",
  },
  {
    key: "independent-rhythm",
    title: "자기 리듬 존중형",
    summary:
      "관심은 좋아하지만 방식과 타이밍은 스스로 정하고 싶어 하는 성향이 있어요.",
    detail:
      "혼자 쉬는 시간과 교감 시간이 분리되면 더 안정적으로 지내는 편이라, 거리감이 잘 맞을수록 편안해져요.",
  },
  {
    key: "affection-magnet",
    title: "애정 반응형",
    summary:
      "좋아하는 존재에게 마음이 쉽게 쏠리고, 관심을 받으면 기분이 크게 좋아지는 타입이에요.",
    detail:
      "표현이 크든 작든 애정에 대한 반응이 분명한 편이라, 짧은 칭찬과 교감만으로도 만족감이 크게 올라갈 수 있어요.",
  },
  {
    key: "sensitive-reader",
    title: "섬세한 분위기 감지형",
    summary:
      "작은 변화도 빠르게 읽어내는 편이라, 환경이나 사람의 텐션에 영향을 많이 받을 수 있어요.",
    detail:
      "차분하고 일정한 흐름에서는 안정감을 크게 느끼지만, 낯선 자극이 몰리면 예민함이 먼저 올라올 수 있어요.",
  },
];

const emotionPool = [
  {
    key: "emotion-clear",
    text: "감정 표현이 비교적 분명한 편이라 기분이 좋을 때와 아닌 때의 차이가 잘 드러날 수 있어요.",
  },
  {
    key: "emotion-soft",
    text: "감정 표현이 과하지는 않지만 은근하게 드러나는 편이라, 작은 반응을 잘 읽어주는 것이 중요해요.",
  },
  {
    key: "emotion-fast",
    text: "기분 변화가 빠른 편이라 즐거움과 예민함이 순간적으로 바뀔 수 있어요. 반응의 온도를 섬세하게 살펴주세요.",
  },
  {
    key: "emotion-steady",
    text: "전체적으로는 감정의 중심이 안정적인 편이에요. 다만 한번 불편함이 생기면 회복엔 약간의 시간이 필요할 수 있어요.",
  },
  {
    key: "emotion-affection",
    text: "좋아하는 사람이나 상황에서는 감정이 훨씬 부드럽게 풀리는 편이라, 애정의 방향이 분명한 타입일 가능성이 커요.",
  },
  {
    key: "emotion-observe",
    text: "바로 표현하기보다 먼저 살핀 뒤 반응하는 편이라, 감정이 늦게 드러나는 것처럼 보여도 내면 반응은 꽤 풍부할 수 있어요.",
  },
];

const relationPool = [
  {
    key: "relation-close",
    text: "보호자와 가까운 거리에서 안정감을 느끼는 편이라, 함께 있는 시간 자체가 성격 안정에 큰 영향을 줄 수 있어요.",
  },
  {
    key: "relation-balance",
    text: "붙어 있는 시간도 좋지만 혼자만의 시간도 중요하게 여기는 편이에요. 균형이 맞을수록 더 편안한 관계가 될 수 있어요.",
  },
  {
    key: "relation-play",
    text: "놀이와 반응 속에서 친밀감이 커지는 타입이라, 함께 웃고 움직이는 시간이 관계를 빠르게 깊게 만들 수 있어요.",
  },
  {
    key: "relation-trust",
    text: "빠른 친밀감보다 신뢰가 쌓이면서 점점 더 깊어지는 관계를 선호하는 편이에요.",
  },
  {
    key: "relation-selective",
    text: "누구에게나 마음을 여는 타입보다는, 좋아하는 존재에게 더 선명하게 반응하는 편일 수 있어요.",
  },
  {
    key: "relation-calm",
    text: "큰 이벤트보다 조용하고 안정적인 교감 안에서 관계 만족도가 높아지는 성향이 느껴져요.",
  },
];

const stressPool = [
  {
    key: "stress-noise",
    text: "큰 소리나 갑작스러운 변화에 긴장이 올라갈 수 있어요. 예민한 날엔 안정적인 환경이 특히 중요해요.",
  },
  {
    key: "stress-routine",
    text: "루틴이 흔들릴 때 스트레스를 더 크게 느낄 가능성이 있어요. 일정한 생활 리듬이 안정감을 줄 수 있어요.",
  },
  {
    key: "stress-distance",
    text: "원하는 거리감이 지켜지지 않을 때 예민함이 생길 수 있어요. 혼자 쉬는 시간도 중요한 회복 요소일 수 있어요.",
  },
  {
    key: "stress-excited",
    text: "너무 신난 상황이 오히려 피로로 이어질 수 있어요. 즐거움 뒤의 진정 시간이 꼭 필요할 수 있어요.",
  },
  {
    key: "stress-overcare",
    text: "지나치게 많은 반응이나 관심이 오히려 부담이 될 수 있어요. 때로는 한 템포 쉬어가는 게 더 도움이 돼요.",
  },
  {
    key: "stress-stranger",
    text: "낯선 사람이나 새로운 환경 앞에서 긴장을 느낄 수 있어요. 적응 시간을 충분히 주는 것이 중요해요.",
  },
];

const routinePool = [
  {
    key: "routine-play",
    text: "짧고 자주 노는 리듬이 잘 맞을 수 있어요. 길고 무거운 놀이보다 가볍고 반복적인 교감이 더 만족스러울 수 있어요.",
  },
  {
    key: "routine-rest",
    text: "충분한 휴식과 안정된 공간이 성격의 좋은 면을 더 잘 드러내게 할 수 있어요.",
  },
  {
    key: "routine-walk",
    text: "산책이나 탐색 시간이 성격 만족도에 큰 영향을 줄 수 있어요. 바깥 자극을 편안하게 받아들이게 도와주세요.",
  },
  {
    key: "routine-touch",
    text: "짧은 터치, 빗질, 눈맞춤 같은 소소한 교감이 일상 루틴 안에서 중요한 안정 장치가 될 수 있어요.",
  },
  {
    key: "routine-praise",
    text: "작은 행동에도 칭찬을 자주 받는 루틴이 자신감과 안정감을 동시에 높여줄 수 있어요.",
  },
  {
    key: "routine-predictable",
    text: "예측 가능한 시간표가 특히 잘 맞는 타입이에요. 식사와 휴식 시간이 일정하면 훨씬 편안해질 수 있어요.",
  },
];

const careTipPool = [
  {
    key: "tip-calm-tone",
    text: "오늘은 말투와 반응을 한 톤 차분하게 유지해 주면 성격의 장점이 더 편안하게 살아날 수 있어요.",
  },
  {
    key: "tip-short-play",
    text: "오늘은 짧고 즐거운 놀이를 자주 나눠주는 것이 만족감을 높이는 포인트가 될 수 있어요.",
  },
  {
    key: "tip-space",
    text: "다가가는 것보다 먼저 편안한 공간을 만들어 주는 것이 더 좋은 반응으로 이어질 수 있어요.",
  },
  {
    key: "tip-routine",
    text: "평소와 비슷한 루틴을 유지해 주는 것만으로도 훨씬 안정적인 하루를 보낼 수 있어요.",
  },
  {
    key: "tip-eye",
    text: "눈맞춤과 짧은 칭찬을 자주 해주면 정서적 만족도가 더 크게 올라갈 수 있어요.",
  },
  {
    key: "tip-rest-first",
    text: "무언가를 더 하기보다 먼저 쉬는 환경을 정리해 주는 것이 오늘은 더 좋은 케어가 될 수 있어요.",
  },
];

const closingPool = [
  {
    key: "closing-1",
    text: "전체적으로는 성격의 결이 분명한 타입이에요. 억지로 바꾸기보다 잘 맞는 환경을 만들어 줄수록 더 사랑스러운 면이 자연스럽게 드러날 수 있어요.",
  },
  {
    key: "closing-2",
    text: "이 아이는 반응을 잘 읽어주고 리듬을 맞춰줄 때 훨씬 편안해지는 성향이 강해 보여요. 작은 배려가 큰 안정으로 이어질 수 있어요.",
  },
  {
    key: "closing-3",
    text: "강한 자극보다는 편안한 루틴 안에서 장점이 깊어지는 타입이에요. 보호자의 안정적인 태도가 좋은 성격을 더 길게 유지하게 해줄 수 있어요.",
  },
  {
    key: "closing-4",
    text: "성격 자체가 나쁘다기보다 환경과 방식에 따라 달라지는 폭이 큰 편이에요. 잘 맞는 교감 방식을 찾으면 훨씬 더 매력적으로 빛날 수 있어요.",
  },
  {
    key: "closing-5",
    text: "본래 가진 기질이 분명해서, 억지로 맞추기보다 장점을 살려주는 방향이 훨씬 잘 맞아요. 이해받는다는 느낌이 중요할 수 있어요.",
  },
  {
    key: "closing-6",
    text: "차분한 배려와 적절한 리액션이 함께 있을 때 가장 이상적인 성격 흐름이 나올 수 있어요. 보호자와의 호흡이 성격 안정에 큰 영향을 줄 수 있어요.",
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

function buildPersonalityResult(args: {
  pet: SavedPetProfile;
  history: PersonalityHistoryItem[];
}): PersonalityResult {
  const { pet, history } = args;
  const todayKey = getTodayKey();

  const baseSeed = hashString(
    `${pet.id}|${pet.petName}|${pet.petType}|${pet.petGender}|${pet.breed}|${pet.birthDate}|${pet.birthTime}|${todayKey}`
  );

  const petHistory = history.filter((item) => item.petId === pet.id).slice(0, 7);

  const recentArchetype = petHistory.map((item) => item.archetypeKey);
  const recentEmotion = petHistory.map((item) => item.emotionKey);
  const recentRelation = petHistory.map((item) => item.relationKey);
  const recentStress = petHistory.map((item) => item.stressKey);
  const recentRoutine = petHistory.map((item) => item.routineKey);
  const recentTip = petHistory.map((item) => item.tipKey);
  const recentClosing = petHistory.map((item) => item.closingKey);

  const archetype = pickNonRecent(archetypePool, baseSeed + 1, recentArchetype);
  const emotion = pickNonRecent(emotionPool, baseSeed + 2, recentEmotion);
  const relation = pickNonRecent(relationPool, baseSeed + 3, recentRelation);
  const stress = pickNonRecent(stressPool, baseSeed + 4, recentStress);
  const routine = pickNonRecent(routinePool, baseSeed + 5, recentRoutine);
  const tip = pickNonRecent(careTipPool, baseSeed + 6, recentTip);
  const closing = pickNonRecent(closingPool, baseSeed + 7, recentClosing);

  const title =
    pet.petType === "dog"
      ? `${pet.petName}의 성격 결`
      : `${pet.petName}의 기질 분석`;

  const summary = `${pet.petName}는 "${archetype.title}" 기질이 강하게 느껴져요. ${archetype.summary}`;

  return {
    title,
    summary,
    archetype: `${archetype.title} · ${archetype.detail}`,
    emotionStyle: emotion.text,
    relationStyle: relation.text,
    stressPattern: stress.text,
    routineFit: routine.text,
    careTip: tip.text,
    closing: closing.text,
    archetypeKey: archetype.key,
    emotionKey: emotion.key,
    relationKey: relation.key,
    stressKey: stress.key,
    routineKey: routine.key,
    tipKey: tip.key,
    closingKey: closing.key,
  };
}

export default function PersonalityScreen() {
  const [pets, setPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PersonalityResult | null>(null);

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
      const historyRaw = await AsyncStorage.getItem(PERSONALITY_HISTORY_KEY);
      const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
      const history: PersonalityHistoryItem[] = Array.isArray(parsedHistory)
        ? parsedHistory
        : [];

      const generated = buildPersonalityResult({
        pet: selectedPet,
        history,
      });

      const historyItem: PersonalityHistoryItem = {
        id: `${Date.now()}-${selectedPet.id}`,
        createdAt: new Date().toISOString(),
        petId: selectedPet.id,
        petName: selectedPet.petName,
        archetypeKey: generated.archetypeKey,
        emotionKey: generated.emotionKey,
        relationKey: generated.relationKey,
        stressKey: generated.stressKey,
        routineKey: generated.routineKey,
        tipKey: generated.tipKey,
        closingKey: generated.closingKey,
      };

      const updatedHistory = [historyItem, ...history].slice(0, 100);
      await AsyncStorage.setItem(
        PERSONALITY_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      setTimeout(() => {
        setResult(generated);
        setIsLoading(false);
      }, 2200);
    } catch (error) {
      console.error("성격 분석 실패", error);
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
          <Text style={styles.heroBadgeText}>PERSONALITY</Text>
        </View>

        <Text style={styles.heroTitle}>성격 분석 🔥</Text>
        <Text style={styles.heroSubtitle}>
          우리 아이의 기본 성향과 감정 표현 방식을 더 입체적으로 읽어드려요.
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
            title="성격 분석하기"
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
            <Text style={styles.loadingTitle}>성격 분석 중...</Text>
            <Text style={styles.loadingDesc}>
              기본 기질과 감정 표현 방식을 천천히 읽고 있어요.
            </Text>
          </View>
        </SectionCard>
      )}

      {!isLoading && result && (
        <>
          <SectionCard>
            <View style={styles.todayCard}>
              <Text style={styles.todayLabel}>PERSONALITY REPORT</Text>
              <Text style={styles.todayTitle}>{result.title}</Text>
              <Text style={styles.todaySummary}>{result.summary}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>성격 해석</Text>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>기본 성향</Text>
              <Text style={styles.resultCardDesc}>{result.archetype}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>감정 표현 방식</Text>
              <Text style={styles.resultCardDesc}>{result.emotionStyle}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>관계 스타일</Text>
              <Text style={styles.resultCardDesc}>{result.relationStyle}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>스트레스 반응</Text>
              <Text style={styles.resultCardDesc}>{result.stressPattern}</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultCardTitle}>잘 맞는 루틴</Text>
              <Text style={styles.resultCardDesc}>{result.routineFit}</Text>
            </View>
          </SectionCard>

          <SectionCard>
            <Text style={styles.sectionTitle}>보호자 팁</Text>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>케어 포인트</Text>
              <Text style={styles.tipDesc}>{result.careTip}</Text>
            </View>

            <View style={styles.closingCard}>
              <Text style={styles.closingTitle}>총평</Text>
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
  tipCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 18,
    padding: 16,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  tipDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  closingCard: {
    marginTop: 12,
    backgroundColor: "#F7F2ED",
    borderRadius: 18,
    padding: 16,
  },
  closingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  closingText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.text,
  },
});