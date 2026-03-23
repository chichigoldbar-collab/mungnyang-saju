import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
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
const COMPATIBILITY_HISTORY_KEY = "mungnyang-compatibility-history";

type CompatibilityHistoryItem = {
  id: string;
  createdAt: string;
  petId: string;
  petName: string;
  ownerBirthDate: string;
  score: number;
  relationTypeKey: string;
  strengthKey: string;
  cautionKey: string;
  recoveryKey: string;
  tipKey: string;
  closingKey: string;
};

type CompatibilityResult = {
  score: number;
  title: string;
  summary: string;
  relationType: string;
  strengths: string;
  cautions: string;
  recoveryStyle: string;
  todayTip: string;
  closing: string;
  relationTypeKey: string;
  strengthKey: string;
  cautionKey: string;
  recoveryKey: string;
  tipKey: string;
  closingKey: string;
};

type SelectorType = "year" | "month" | "day" | null;

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 80 }, (_, i) => currentYear - i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const relationTypes = [
  {
    key: "heart-bond",
    title: "정서 교감형",
    description:
      "보호자와 반려동물이 감정적으로 빠르게 연결되는 타입이에요. 작은 표정이나 말투 변화에도 서로 영향을 많이 주고받는 편이에요.",
  },
  {
    key: "play-buddy",
    title: "장난 콤비형",
    description:
      "함께 놀거나 반응을 주고받을 때 가장 궁합이 잘 살아나는 타입이에요. 가볍고 밝은 에너지 안에서 교감이 깊어질 수 있어요.",
  },
  {
    key: "healing-pair",
    title: "힐링 안정형",
    description:
      "서로의 존재만으로도 안정감을 느끼는 조합이에요. 큰 자극보다 일상 속 루틴에서 만족도가 높게 올라갈 수 있어요.",
  },
  {
    key: "care-balance",
    title: "보살핌 균형형",
    description:
      "보호자가 살피고 반려동물이 반응하는 흐름이 자연스럽게 이어지는 타입이에요. 섬세한 케어가 관계 만족도를 크게 올려줘요.",
  },
  {
    key: "trust-grow",
    title: "신뢰 성장형",
    description:
      "처음보다 시간이 갈수록 궁합이 더 좋아지는 타입이에요. 천천히 쌓이는 신뢰가 관계의 가장 큰 힘이 돼요.",
  },
  {
    key: "routine-sync",
    title: "생활 리듬형",
    description:
      "생활 패턴과 루틴이 잘 맞을수록 궁합이 크게 좋아지는 조합이에요. 안정적인 시간표가 서로를 편안하게 해줘요.",
  },
];

const strengthPool = [
  {
    key: "warm-reaction",
    text: "서로의 반응을 빠르게 알아차리는 편이라 감정 교감이 자연스럽게 이어질 가능성이 커요.",
  },
  {
    key: "easy-bonding",
    text: "짧은 시간이라도 함께 보내는 밀도가 높아서 교감 만족도가 크게 올라갈 수 있어요.",
  },
  {
    key: "routine-comfort",
    text: "익숙한 루틴을 같이 지킬 때 관계 안정감이 눈에 띄게 좋아질 수 있어요.",
  },
  {
    key: "trust-energy",
    text: "기본적으로 신뢰를 쌓아가는 흐름이 좋아서 시간이 갈수록 더 편안한 관계가 될 가능성이 커요.",
  },
  {
    key: "play-chemistry",
    text: "놀이와 리액션에서 합이 잘 맞는 편이라 함께 있는 시간이 재미로 연결되기 쉬워요.",
  },
  {
    key: "healing-vibe",
    text: "과한 표현이 없어도 서로에게 안정감을 주는 조합이라 조용한 만족도가 높을 수 있어요.",
  },
  {
    key: "care-instinct",
    text: "보호자가 챙겨주고 반려동물이 반응하는 흐름이 자연스러워서 케어 만족감이 높게 쌓일 수 있어요.",
  },
  {
    key: "emotional-match",
    text: "감정 텐션이 크게 어긋나지 않아 서로를 편안하게 느낄 가능성이 높아요.",
  },
];

const cautionPool = [
  {
    key: "too-sensitive",
    text: "서로의 예민한 순간이 겹치면 평소보다 작은 자극도 크게 느껴질 수 있어요.",
  },
  {
    key: "reaction-gap",
    text: "원하는 반응 속도가 다르면 서운함이나 답답함이 생길 수 있으니 템포를 맞추는 게 중요해요.",
  },
  {
    key: "over-care",
    text: "보호자가 너무 많이 신경 쓸수록 오히려 반려동물이 부담을 느낄 수 있어요.",
  },
  {
    key: "routine-break",
    text: "생활 패턴이 흔들릴 때 관계 만족도도 같이 떨어질 수 있으니 루틴 유지가 중요해요.",
  },
  {
    key: "over-excited",
    text: "신난 흐름이 커질 때는 힘 조절이 어려워질 수 있어요. 즐거움과 진정의 균형이 필요해요.",
  },
  {
    key: "distance-mismatch",
    text: "붙어 있고 싶은 타이밍과 혼자 있고 싶은 타이밍이 어긋날 때 미묘한 거리감이 생길 수 있어요.",
  },
  {
    key: "mood-swing",
    text: "기분 변화가 큰 날에는 평소보다 상대 반응을 더 민감하게 받아들일 수 있어요.",
  },
  {
    key: "small-misread",
    text: "좋은 의도였어도 표현 방식이 다르면 서로를 오해할 수 있으니 반응을 천천히 확인해 주세요.",
  },
];

const recoveryPool = [
  {
    key: "quiet-time",
    text: "조용한 시간과 익숙한 공간을 먼저 회복 지점으로 잡아주는 게 좋아요.",
  },
  {
    key: "short-touch",
    text: "길고 과한 교감보다 짧고 부드러운 반응이 관계를 더 빨리 회복시켜줄 수 있어요.",
  },
  {
    key: "play-reset",
    text: "가벼운 놀이 한 번으로도 분위기가 풀릴 수 있는 조합이에요. 단, 너무 길게 끌지는 않는 게 좋아요.",
  },
  {
    key: "routine-reset",
    text: "식사, 산책, 휴식 같은 익숙한 루틴으로 돌아가는 것이 가장 빠른 회복 방법일 수 있어요.",
  },
  {
    key: "warm-voice",
    text: "차분한 말투와 일정한 반응이 긴장을 빠르게 낮추는 데 도움이 될 수 있어요.",
  },
  {
    key: "space-first",
    text: "바로 다가가기보다 먼저 공간을 보장해 주는 것이 오히려 신뢰 회복에 더 좋아요.",
  },
];

const tipPool = [
  {
    key: "tip-eye-contact",
    text: "오늘은 눈맞춤과 짧은 칭찬을 자주 주는 것이 교감운을 올리는 포인트예요.",
  },
  {
    key: "tip-routine",
    text: "오늘은 평소보다 루틴을 일정하게 지켜주는 것이 궁합 만족도를 높여줄 수 있어요.",
  },
  {
    key: "tip-rest",
    text: "오늘은 놀아주는 시간 못지않게 쉬는 시간을 예쁘게 만들어주는 게 중요해요.",
  },
  {
    key: "tip-snack",
    text: "좋아하는 간식이나 보상 타이밍을 잘 잡으면 관계 흐름이 더 부드럽게 이어질 수 있어요.",
  },
  {
    key: "tip-touch",
    text: "무리한 스킨십보다 반응을 살피며 짧게 교감하는 방식이 특히 잘 맞는 날이에요.",
  },
  {
    key: "tip-walk",
    text: "산책이나 이동 시간의 리듬을 편안하게 맞춰주는 것이 오늘 궁합 포인트가 될 수 있어요.",
  },
  {
    key: "tip-praise",
    text: "오늘은 작은 행동에도 바로 칭찬해 주면 서로의 만족감이 더 커질 수 있어요.",
  },
  {
    key: "tip-calm",
    text: "과한 자극보다 조용하고 안정적인 분위기를 유지하는 것이 오늘 관계운에 더 좋아요.",
  },
];

const closingPool = [
  {
    key: "closing-1",
    text: "전체적으로는 서로에게 안정감을 줄 가능성이 높은 궁합이에요. 오늘은 속도보다 분위기를 맞추는 데 집중하면 더 좋아질 수 있어요.",
  },
  {
    key: "closing-2",
    text: "기본적으로 흐름이 좋은 조합이지만, 작은 반응 차이를 세심하게 봐줄수록 만족도가 더 높아질 수 있어요.",
  },
  {
    key: "closing-3",
    text: "함께 보내는 시간의 길이보다 질이 더 중요한 궁합이에요. 짧아도 밀도 있는 교감이 큰 힘이 될 수 있어요.",
  },
  {
    key: "closing-4",
    text: "정서적으로 잘 이어질 가능성이 높은 관계라, 차분한 리듬만 유지하면 점점 더 편안한 궁합으로 자리 잡을 수 있어요.",
  },
  {
    key: "closing-5",
    text: "서로의 타이밍을 조금만 더 읽어주면 아주 좋은 흐름으로 이어질 수 있는 조합이에요.",
  },
  {
    key: "closing-6",
    text: "전반적으로 궁합 밸런스가 좋은 편이에요. 오늘은 무리하지 않고 편안한 분위기를 유지하는 것이 핵심이에요.",
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

function formatBirthDate(year?: number, month?: number, day?: number) {
  if (!year || !month || !day) return "";
  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}

function parseBirthDateToParts(value: string) {
  const onlyNumbers = value.replace(/\D/g, "");
  if (onlyNumbers.length !== 8) {
    return { year: undefined, month: undefined, day: undefined };
  }

  return {
    year: Number(onlyNumbers.slice(0, 4)),
    month: Number(onlyNumbers.slice(4, 6)),
    day: Number(onlyNumbers.slice(6, 8)),
  };
}

function getDaysInMonth(year?: number, month?: number) {
  if (!year || !month) return [];
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
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

function buildCompatibilityResult(args: {
  pet: SavedPetProfile;
  ownerBirthDate: string;
  history: CompatibilityHistoryItem[];
}): CompatibilityResult {
  const { pet, ownerBirthDate, history } = args;

  const todayKey = getTodayKey();
  const baseSeed = hashString(
    `${pet.id}|${pet.petName}|${pet.petType}|${pet.petGender}|${pet.breed}|${ownerBirthDate}|${todayKey}`
  );

  const petHistory = history.filter((item) => item.petId === pet.id).slice(0, 7);

  const recentRelation = petHistory.map((item) => item.relationTypeKey);
  const recentStrength = petHistory.map((item) => item.strengthKey);
  const recentCaution = petHistory.map((item) => item.cautionKey);
  const recentRecovery = petHistory.map((item) => item.recoveryKey);
  const recentTip = petHistory.map((item) => item.tipKey);
  const recentClosing = petHistory.map((item) => item.closingKey);

  const relation = pickNonRecent(relationTypes, baseSeed + 1, recentRelation);
  const strength = pickNonRecent(strengthPool, baseSeed + 2, recentStrength);
  const caution = pickNonRecent(cautionPool, baseSeed + 3, recentCaution);
  const recovery = pickNonRecent(recoveryPool, baseSeed + 4, recentRecovery);
  const tip = pickNonRecent(tipPool, baseSeed + 5, recentTip);
  const closing = pickNonRecent(closingPool, baseSeed + 6, recentClosing);

  const scoreBase = 72 + (baseSeed % 24);
  const scoreAdjust =
    pet.petType === "dog"
      ? 2
      : 0 + (pet.petGender === "female" ? 1 : 0) + (pet.isNeutered ? 1 : 0);

  const score = Math.min(98, scoreBase + scoreAdjust);

  const title =
    score >= 92
      ? "찰떡궁합"
      : score >= 86
      ? "좋은 흐름"
      : score >= 80
      ? "균형 잡힌 궁합"
      : "천천히 깊어지는 궁합";

  const summary = `${pet.petName}와 보호자는 현재 "${relation.title}" 흐름이 강하게 느껴져요. ${relation.description}`;

  return {
    score,
    title,
    summary,
    relationType: relation.description,
    strengths: strength.text,
    cautions: caution.text,
    recoveryStyle: recovery.text,
    todayTip: tip.text,
    closing: closing.text,
    relationTypeKey: relation.key,
    strengthKey: strength.key,
    cautionKey: caution.key,
    recoveryKey: recovery.key,
    tipKey: tip.key,
    closingKey: closing.key,
  };
}

function SelectorModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  formatLabel,
}: {
  visible: boolean;
  title: string;
  options: Array<number | string>;
  selectedValue?: number | string;
  onSelect: (value: number | string) => void;
  onClose: () => void;
  formatLabel?: (value: number | string) => string;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>

          <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const isSelected = selectedValue === option;

              return (
                <Pressable
                  key={String(option)}
                  style={[
                    styles.modalOptionButton,
                    isSelected && styles.modalOptionButtonActive,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextActive,
                    ]}
                  >
                    {formatLabel ? formatLabel(option) : String(option)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <AppButton title="닫기" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

export default function CompatibilityScreen() {
  const [pets, setPets] = useState<SavedPetProfile[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [ownerBirthYear, setOwnerBirthYear] = useState<number | undefined>();
  const [ownerBirthMonth, setOwnerBirthMonth] = useState<number | undefined>();
  const [ownerBirthDay, setOwnerBirthDay] = useState<number | undefined>();
  const [selectorType, setSelectorType] = useState<SelectorType>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const dayOptions = useMemo(
    () => getDaysInMonth(ownerBirthYear, ownerBirthMonth),
    [ownerBirthYear, ownerBirthMonth]
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const ownerBirthDate = formatBirthDate(
    ownerBirthYear,
    ownerBirthMonth,
    ownerBirthDay
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
    if (!selectedPet || !ownerBirthDate) return;

    setIsLoading(true);
    setResult(null);

    try {
      const historyRaw = await AsyncStorage.getItem(COMPATIBILITY_HISTORY_KEY);
      const parsedHistory = historyRaw ? JSON.parse(historyRaw) : [];
      const history: CompatibilityHistoryItem[] = Array.isArray(parsedHistory)
        ? parsedHistory
        : [];

      const generated = buildCompatibilityResult({
        pet: selectedPet,
        ownerBirthDate,
        history,
      });

      const historyItem: CompatibilityHistoryItem = {
        id: `${Date.now()}-${selectedPet.id}`,
        createdAt: new Date().toISOString(),
        petId: selectedPet.id,
        petName: selectedPet.petName,
        ownerBirthDate,
        score: generated.score,
        relationTypeKey: generated.relationTypeKey,
        strengthKey: generated.strengthKey,
        cautionKey: generated.cautionKey,
        recoveryKey: generated.recoveryKey,
        tipKey: generated.tipKey,
        closingKey: generated.closingKey,
      };

      const updatedHistory = [historyItem, ...history].slice(0, 100);
      await AsyncStorage.setItem(
        COMPATIBILITY_HISTORY_KEY,
        JSON.stringify(updatedHistory)
      );

      setTimeout(() => {
        setResult(generated);
        setIsLoading(false);
      }, 2200);
    } catch (error) {
      console.error("궁합 분석 실패", error);
      setIsLoading(false);
    }
  };

  const birthDateLabel =
    ownerBirthYear && ownerBirthMonth && ownerBirthDay
      ? `${ownerBirthYear}년 ${ownerBirthMonth}월 ${ownerBirthDay}일`
      : "년 / 월 / 일을 선택하세요";

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>COMPATIBILITY</Text>
          </View>

          <Text style={styles.heroTitle}>보호자 궁합 💞</Text>
          <Text style={styles.heroSubtitle}>
            보호자와 반려동물 사이의 관계 흐름을 더 섬세하게 분석해드려요.
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

          <Text style={[styles.sectionTitle, styles.spacedTitle]}>
            보호자 생년월일
          </Text>

          <View style={styles.birthRow}>
            <Pressable
              style={styles.dateSelectButton}
              onPress={() => setSelectorType("year")}
            >
              <Text style={styles.dateSelectLabel}>
                {ownerBirthYear ? `${ownerBirthYear}년` : "년 선택"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.dateSelectButton}
              onPress={() => setSelectorType("month")}
            >
              <Text style={styles.dateSelectLabel}>
                {ownerBirthMonth ? `${ownerBirthMonth}월` : "월 선택"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.dateSelectButton}
              onPress={() => setSelectorType("day")}
            >
              <Text style={styles.dateSelectLabel}>
                {ownerBirthDay ? `${ownerBirthDay}일` : "일 선택"}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.selectedDateText}>{birthDateLabel}</Text>

          <View style={styles.actionWrap}>
            <AppButton
              title="궁합 분석하기"
              onPress={handleAnalyze}
              disabled={!selectedPet || !ownerBirthDate || isLoading}
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
              <Text style={styles.loadingTitle}>궁합 분석 중...</Text>
              <Text style={styles.loadingDesc}>
                서로의 리듬과 감정 흐름을 읽고 있어요.
              </Text>
            </View>
          </SectionCard>
        )}

        {!isLoading && result && (
          <>
            <SectionCard>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>COMPATIBILITY SCORE</Text>
                <Text style={styles.scoreValue}>{result.score}점</Text>
                <Text style={styles.scoreTitle}>{result.title}</Text>
                <Text style={styles.scoreSummary}>{result.summary}</Text>
              </View>
            </SectionCard>

            <SectionCard>
              <Text style={styles.sectionTitle}>궁합 해석</Text>

              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>관계 타입</Text>
                <Text style={styles.resultCardDesc}>{result.relationType}</Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>교감 강점</Text>
                <Text style={styles.resultCardDesc}>{result.strengths}</Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>충돌 포인트</Text>
                <Text style={styles.resultCardDesc}>{result.cautions}</Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>회복 방식</Text>
                <Text style={styles.resultCardDesc}>{result.recoveryStyle}</Text>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>오늘의 궁합 팁</Text>
                <Text style={styles.resultCardDesc}>{result.todayTip}</Text>
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

      <SelectorModal
        visible={selectorType === "year"}
        title="년 선택"
        options={YEAR_OPTIONS}
        selectedValue={ownerBirthYear}
        onSelect={(value) => setOwnerBirthYear(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}년`}
      />

      <SelectorModal
        visible={selectorType === "month"}
        title="월 선택"
        options={MONTH_OPTIONS}
        selectedValue={ownerBirthMonth}
        onSelect={(value) => setOwnerBirthMonth(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}월`}
      />

      <SelectorModal
        visible={selectorType === "day"}
        title="일 선택"
        options={dayOptions}
        selectedValue={ownerBirthDay}
        onSelect={(value) => setOwnerBirthDay(Number(value))}
        onClose={() => setSelectorType(null)}
        formatLabel={(value) => `${value}일`}
      />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  spacedTitle: {
    marginTop: 16,
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
  birthRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateSelectButton: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  dateSelectLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  selectedDateText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.muted,
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
  scoreCard: {
    backgroundColor: "#FFF7EF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.secondary,
    letterSpacing: 0.6,
  },
  scoreValue: {
    marginTop: 10,
    fontSize: 40,
    fontWeight: "900",
    color: COLORS.text,
  },
  scoreTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },
  scoreSummary: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  modalList: {
    marginBottom: 14,
  },
  modalOptionButton: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  modalOptionButtonActive: {
    backgroundColor: COLORS.accent,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalOptionTextActive: {
    color: COLORS.text,
  },
});