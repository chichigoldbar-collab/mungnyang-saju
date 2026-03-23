import {
  cautionKeys,
  focusKeys,
  fortuneTemplates,
  luckyColors,
  luckyItems,
  moodKeys,
  personalityKeys,
  recommendedActions,
  type CautionKey,
  type FocusKey,
  type MoodKey,
  type PersonalityKey,
} from "../constants/fortune-data";
import type { FortuneHistoryItem, PetGender, PetType } from "../types";

export type GeneratedFortune = {
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
  personalityKey: PersonalityKey;
  moodKey: MoodKey;
  focusKey: FocusKey;
  cautionKey: CautionKey;
};

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

function uniqueRecentValues<T extends string>(
  history: FortuneHistoryItem[],
  petId: string,
  keyName: "personalityKey" | "moodKey" | "focusKey" | "cautionKey",
  limit = 7
) {
  return history
    .filter((item) => item.petId === petId)
    .slice(0, limit)
    .map((item) => item[keyName])
    .filter(Boolean) as T[];
}

function pickNonRepeating<T extends string>(
  items: T[],
  seed: number,
  recent: T[]
) {
  const filtered = items.filter((item) => !recent.includes(item));
  const source = filtered.length > 0 ? filtered : items;
  return source[seed % source.length];
}

function pickText(items: string[], seed: number) {
  return items[seed % items.length];
}

export function buildFortuneResult(args: {
  petId: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  history: FortuneHistoryItem[];
}): GeneratedFortune {
  const { petId, petName, petType, petGender, isNeutered, history } = args;

  const todayKey = getTodayKey();

  const personalitySeed = hashString(`${petId}|${petName}|${petType}|${petGender}`);
  const dailySeed = hashString(`${petId}|${todayKey}`);
  const comboSeed = hashString(`${petId}|${petName}|${todayKey}|${isNeutered}`);

  const recentPersonality = uniqueRecentValues<PersonalityKey>(
    history,
    petId,
    "personalityKey"
  );
  const recentMood = uniqueRecentValues<MoodKey>(history, petId, "moodKey");
  const recentFocus = uniqueRecentValues<FocusKey>(history, petId, "focusKey");
  const recentCaution = uniqueRecentValues<CautionKey>(
    history,
    petId,
    "cautionKey"
  );

  const personalityKey = pickNonRepeating(
    personalityKeys,
    personalitySeed,
    recentPersonality
  );
  const moodKey = pickNonRepeating(moodKeys, dailySeed + 1, recentMood);
  const focusKey = pickNonRepeating(focusKeys, dailySeed + 2, recentFocus);
  const cautionKey = pickNonRepeating(
    cautionKeys,
    dailySeed + 3,
    recentCaution
  );

  const templates = fortuneTemplates[petType][petGender][personalityKey];

  const opening = pickText(templates.opening, comboSeed + 1);
  const moodLine = pickText(templates.mood, comboSeed + 2);
  const focusLine = pickText(templates.focus, comboSeed + 3);
  const closing = pickText(templates.closing, comboSeed + 4);

  const summary = `${opening} ${moodLine} ${focusLine} ${closing}`;

  const moodText = `${moodLine} 오늘은 감정 반응을 천천히 읽어주면 더 안정적일 수 있어요.`;
  const healthText = `${focusLine} 무리하지 않는 선에서 컨디션을 살피는 게 중요해요.`;
  const appetiteText =
    moodKey === "up" || moodKey === "playful"
      ? "기분이 올라오면 식사나 간식 반응도 함께 커질 수 있어요. 먹는 속도와 흥분도를 함께 봐주세요."
      : moodKey === "rest"
      ? "오늘은 먹는 양보다 편안한 분위기가 더 중요할 수 있어요. 조용한 환경에서 천천히 살펴봐 주세요."
      : "식욕은 크게 나쁘지 않지만, 기분과 분위기에 따라 반응 차이가 생길 수 있어요.";
  const cautionText =
    cautionKey === "overexcited"
      ? "신나면 힘 조절이 어려워질 수 있어요. 흥분이 높아질 때는 잠깐 멈추는 리듬이 필요해요."
      : cautionKey === "sensitive"
      ? "오늘은 사소한 자극도 크게 느껴질 수 있어요. 차분한 반응이 큰 도움이 될 수 있어요."
      : cautionKey === "stranger"
      ? "낯선 환경이나 대상에 대한 경계가 올라갈 수 있어요. 너무 빠른 접근은 피하는 게 좋아요."
      : cautionKey === "speed"
      ? "움직임이 빨라지면 사고성 행동이 나올 수 있어요. 실내외 모두 속도 조절을 신경 써주세요."
      : cautionKey === "space"
      ? "혼자만의 공간이 필요할 수 있어요. 원치 않는 접촉은 오히려 피로를 줄 수 있어요."
      : "큰 소리나 갑작스러운 변화에 예민해질 수 있어요. 안정적인 분위기를 유지해 주세요.";

  return {
    summary,
    health: healthText,
    appetite: appetiteText,
    mood: moodText,
    caution: cautionText,
    luckyColor: luckyColors[(dailySeed + 5) % luckyColors.length],
    luckyItem: luckyItems[(dailySeed + 6) % luckyItems.length],
    recommendedAction:
      recommendedActions[(dailySeed + 7) % recommendedActions.length],
    personalityKey,
    moodKey,
    focusKey,
    cautionKey,
  };
}