import {
  getBreedProfile,
  getLuckyItemsBySpecies,
  luckyColors,
  personalityDescriptions,
} from "../constants/fortune-data";
import type { FortuneHistoryItem, PetGender, PetType } from "../types";

export type PersonalityKey =
  | "energetic"
  | "gentle"
  | "curious"
  | "independent"
  | "affectionate"
  | "sensitive";

export type MoodKey =
  | "up"
  | "stable"
  | "rest"
  | "playful"
  | "clingy"
  | "alert";

export type FocusKey =
  | "walk"
  | "food"
  | "rest"
  | "bonding"
  | "play"
  | "routine";

export type CautionKey =
  | "overexcited"
  | "sensitive"
  | "stranger"
  | "speed"
  | "space"
  | "noise";

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

type AgeGroup = "baby" | "young" | "adult" | "senior";

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
  items: readonly T[],
  seed: number,
  recent: T[]
) {
  const filtered = items.filter((item) => !recent.includes(item));
  const source = filtered.length > 0 ? filtered : items;
  return source[seed % source.length];
}

function pickText(items: readonly string[], seed: number) {
  return items[seed % items.length];
}

function parseBirthDate(birthDate: string) {
  const normalized = birthDate.replace(/\./g, "-").trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function getAgeGroup(birthDate: string): AgeGroup {
  const date = parseBirthDate(birthDate);
  if (!date) return "adult";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  if (ageYears < 1) return "baby";
  if (ageYears < 3) return "young";
  if (ageYears < 9) return "adult";
  return "senior";
}

function getLifeStageLabel(ageGroup: AgeGroup, petType: PetType) {
  if (petType === "cat") {
    if (ageGroup === "baby") return "키튼";
    if (ageGroup === "young") return "주니어";
    if (ageGroup === "adult") return "어덜트";
    return "시니어";
  }

  if (ageGroup === "baby") return "퍼피";
  if (ageGroup === "young") return "주니어";
  if (ageGroup === "adult") return "어덜트";
  return "시니어";
}

function inferPersonalityKey(
  petType: PetType,
  breed: string,
  petGender: PetGender,
  seed: number
): PersonalityKey {
  const profile = getBreedProfile(petType, breed);
  const tags = profile.temperamentTags;

  if (tags.includes("active")) return "energetic";
  if (tags.includes("calm")) return "gentle";
  if (tags.includes("curious")) return "curious";
  if (tags.includes("independent")) return "independent";
  if (tags.includes("affectionate")) return "affectionate";
  if (tags.includes("sensitive")) return "sensitive";

  if (petType === "dog") {
    return petGender === "female" ? "affectionate" : "energetic";
  }

  const fallback: PersonalityKey[] = [
    "energetic",
    "gentle",
    "curious",
    "independent",
    "affectionate",
    "sensitive",
  ];

  return fallback[seed % fallback.length];
}

function inferFocusKey(
  petType: PetType,
  moodKey: MoodKey,
  ageGroup: AgeGroup,
  seed: number
): FocusKey {
  if (petType === "dog") {
    if (moodKey === "up" || moodKey === "playful") return "walk";
    if (moodKey === "clingy") return "bonding";
    if (moodKey === "rest") return "rest";
    if (ageGroup === "senior") return "routine";
    if (ageGroup === "baby") return "play";
    return seed % 2 === 0 ? "play" : "food";
  }

  if (moodKey === "rest") return "rest";
  if (moodKey === "clingy") return "bonding";
  if (moodKey === "alert") return "routine";
  if (ageGroup === "baby") return "play";
  return seed % 2 === 0 ? "food" : "play";
}

function inferCautionKey(
  petType: PetType,
  moodKey: MoodKey,
  ageGroup: AgeGroup
): CautionKey {
  if (petType === "dog") {
    if (moodKey === "up" || moodKey === "playful") return "overexcited";
    if (moodKey === "alert") return "stranger";
    if (ageGroup === "senior") return "speed";
    if (ageGroup === "baby") return "overexcited";
    if (moodKey === "rest") return "noise";
    return "sensitive";
  }

  if (moodKey === "alert") return "space";
  if (moodKey === "clingy") return "noise";
  if (ageGroup === "senior") return "speed";
  if (ageGroup === "baby") return "overexcited";
  if (moodKey === "rest") return "space";
  return "sensitive";
}

const moodKeyOptions: readonly MoodKey[] = [
  "up",
  "stable",
  "rest",
  "playful",
  "clingy",
  "alert",
];

const dogSummaryOpenings: Record<MoodKey, readonly string[]> = {
  up: [
    "오늘은 꼬리와 표정에서 기대감이 먼저 올라오는 하루예요.",
    "몸보다 마음이 먼저 들뜨는 흐름이 보여요.",
    "좋아하는 사람의 반응을 기다리며 에너지가 살아나는 날이에요.",
  ],
  stable: [
    "오늘은 익숙한 루틴 안에서 편안함을 잘 느끼는 흐름이에요.",
    "전반적으로 안정적인 리듬을 유지하기 좋은 날이에요.",
    "흥분보다 편안한 만족감이 더 크게 느껴질 수 있어요.",
  ],
  rest: [
    "오늘은 차분하게 쉬면서 컨디션을 조절하고 싶어 하는 날이에요.",
    "활동보다 편안한 휴식이 더 중요하게 느껴질 수 있어요.",
    "무리 없이 자기 속도를 지키는 쪽이 잘 맞는 하루예요.",
  ],
  playful: [
    "오늘은 놀이 신호에 반응이 빨라질 가능성이 커요.",
    "장난기와 호기심이 같이 올라오는 흐름이에요.",
    "가볍게 놀아도 만족감이 크게 올라갈 수 있는 날이에요.",
  ],
  clingy: [
    "오늘은 보호자 곁에서 안정감을 확인하고 싶어 하는 흐름이 강해요.",
    "반응을 자주 확인하며 교감을 찾으려는 날이에요.",
    "함께 있다는 느낌이 평소보다 더 중요하게 작용할 수 있어요.",
  ],
  alert: [
    "오늘은 바깥 자극이나 낯선 소리에 예민하게 반응할 수 있어요.",
    "주변을 유난히 세심하게 살피는 흐름이 느껴져요.",
    "경계심과 호기심이 동시에 올라오는 날일 수 있어요.",
  ],
};

const catSummaryOpenings: Record<MoodKey, readonly string[]> = {
  up: [
    "오늘은 눈빛과 움직임에서 호기심이 살아나는 하루예요.",
    "익숙한 공간 안에서도 새로운 포인트를 살피고 싶어 할 수 있어요.",
    "기분이 올라오면 먼저 장난 신호를 보내는 흐름이 보여요.",
  ],
  stable: [
    "오늘은 자기 리듬을 편안하게 지키기 좋은 날이에요.",
    "크게 들뜨지 않고 익숙한 공간에서 만족감을 느끼기 쉬워요.",
    "조용하지만 안정감 있는 무드가 중심이 되는 하루예요.",
  ],
  rest: [
    "오늘은 혼자 있는 시간과 쉬는 자리를 더 중시할 수 있어요.",
    "짧은 교감보다 편안한 휴식이 더 잘 맞는 흐름이에요.",
    "눈에 띄기보다 익숙한 자리에서 몸을 풀고 싶어 하는 날이에요.",
  ],
  playful: [
    "오늘은 장난감이나 움직이는 물체에 반응이 빨라질 수 있어요.",
    "가볍게 뛰고 쫓는 행동에서 만족감이 올라오기 쉬워요.",
    "놀이 욕구가 살아나면서 표정과 움직임이 더 또렷해질 수 있어요.",
  ],
  clingy: [
    "오늘은 멀리 떨어져 있기보다 익숙한 사람 근처를 의식할 수 있어요.",
    "먼저 다가오지는 않아도 곁을 확인하려는 흐름이 강할 수 있어요.",
    "짧고 부드러운 교감이 안정감으로 이어지기 쉬운 날이에요.",
  ],
  alert: [
    "오늘은 작은 소리나 환경 변화도 크게 느껴질 수 있어요.",
    "먼저 다가가기보다 거리에서 상황을 살피려는 흐름이 보여요.",
    "경계심이 높아지면서 평소보다 관찰 시간이 길어질 수 있어요.",
  ],
};

const dogBehaviorByMood: Record<MoodKey, readonly string[]> = {
  up: [
    "산책을 나가면 냄새 탐색과 발걸음이 평소보다 경쾌할 수 있어요.",
    "간단한 호출이나 장난에도 반응이 빠르게 올라올 가능성이 커요.",
    "보호자를 자주 바라보며 다음 놀이를 기대하는 행동이 늘 수 있어요.",
  ],
  stable: [
    "익숙한 루틴을 따라갈수록 아이가 더 편안해질 수 있어요.",
    "평소 좋아하던 장난감이나 쉬는 자리에서 안정감을 잘 느낄 수 있어요.",
    "오늘은 과한 자극 없이도 만족스러운 흐름을 유지하기 쉬워요.",
  ],
  rest: [
    "짧게 움직인 뒤 바로 쉬고 싶어 하는 패턴이 나타날 수 있어요.",
    "놀이보다 잠자리나 쿠션, 담요 같은 익숙한 공간을 더 찾을 수 있어요.",
    "반응이 느려 보여도 억지로 끌어올리기보다 페이스를 지켜주는 게 좋아요.",
  ],
  playful: [
    "공이나 터그 같은 반응형 놀이에 집중도가 올라갈 수 있어요.",
    "짧고 끊어치는 놀이가 오히려 더 큰 만족감을 줄 수 있어요.",
    "가볍게 신호를 주고받는 놀이에서 표정이 더 밝아질 가능성이 커요.",
  ],
  clingy: [
    "이름을 부르거나 눈을 맞출 때 정서적 만족감이 더 크게 올라올 수 있어요.",
    "보호자 주변을 맴돌며 반응을 확인하는 행동이 늘어날 수 있어요.",
    "칭찬과 짧은 스킨십이 아이의 하루 리듬을 안정시키는 데 도움이 돼요.",
  ],
  alert: [
    "갑작스러운 소리나 낯선 사람에게 먼저 반응이 갈 수 있어요.",
    "산책에서는 빠르게 걷기보다 주변을 확인하는 템포가 더 잘 맞을 수 있어요.",
    "오늘은 새로운 자극보다 익숙한 루틴이 마음을 안정시키는 데 좋아요.",
  ],
};

const catBehaviorByMood: Record<MoodKey, readonly string[]> = {
  up: [
    "창가, 선반, 익숙한 동선에서 탐색 욕구가 더 살아날 수 있어요.",
    "평소보다 먼저 다가와 장난 신호를 보내는 순간이 생길 수 있어요.",
    "움직이는 장난감이나 소리 나는 물체에 집중이 길어질 가능성이 커요.",
  ],
  stable: [
    "아이가 좋아하는 자리와 루틴을 유지해주면 편안한 하루가 되기 쉬워요.",
    "먼저 다가오지 않더라도 조용히 곁을 의식하는 흐름이 느껴질 수 있어요.",
    "오늘은 무리한 스킨십 없이도 만족감 있는 교감이 가능해 보여요.",
  ],
  rest: [
    "숨숨집이나 익숙한 쿠션, 높은 자리에서 쉬는 시간이 길어질 수 있어요.",
    "관찰은 하되 직접 참여하는 시간은 짧게 가져가고 싶어 할 수 있어요.",
    "조용한 환경을 유지해주면 아이가 더 빠르게 안정감을 찾을 수 있어요.",
  ],
  playful: [
    "낚싯대 장난감이나 짧은 추격 놀이에 반응이 살아날 가능성이 커요.",
    "순간적으로 에너지가 올라왔다가 금방 쉬는 패턴이 나타날 수 있어요.",
    "놀이 강도를 오래 끌기보다 짧고 선명하게 주는 편이 더 잘 맞아요.",
  ],
  clingy: [
    "먼저 안기지 않더라도 가까운 자리를 선택하려는 흐름이 나타날 수 있어요.",
    "부드럽고 짧은 반응에 정서적으로 크게 안정될 가능성이 있어요.",
    "아이가 먼저 허용하는 순간에 맞춰 반응해주면 교감이 더 좋아져요.",
  ],
  alert: [
    "낯선 소리나 환경 변화에 예민해져 관찰 시간이 길어질 수 있어요.",
    "스킨십보다는 거리에서 지켜보는 안정감을 더 선호할 수 있어요.",
    "오늘은 루틴 변화보다 익숙한 자리를 유지해주는 편이 좋아요.",
  ],
};

const ageToneBySpecies: Record<
  PetType,
  Record<AgeGroup, readonly string[]>
> = {
  dog: {
    baby: [
      "아직 감정과 에너지가 빠르게 오르내릴 수 있어요.",
      "짧은 반응에도 들뜨거나 지칠 수 있으니 템포를 잘 나눠주세요.",
      "퍼피 시기라 작은 자극에도 금방 신나고 금방 지칠 수 있어요.",
    ],
    young: [
      "활동성과 호기심이 함께 커지는 시기라 자극 반응이 빠를 수 있어요.",
      "배우고 반응하는 즐거움이 커서 칭찬 리듬이 특히 중요해요.",
      "주니어 시기답게 에너지를 쓰고 확인받는 흐름이 잘 맞아요.",
    ],
    adult: [
      "기본 루틴 안에서 컨디션을 조절하는 힘이 비교적 안정적인 편이에요.",
      "오늘의 흐름도 익숙한 패턴을 잘 활용하면 더 좋아질 수 있어요.",
      "어덜트 시기라 무리하지 않는 균형감이 컨디션 유지에 중요해요.",
    ],
    senior: [
      "의욕은 있어도 몸의 반응 속도는 천천히 따라올 수 있어요.",
      "짧고 편안한 움직임 뒤에 충분한 회복 시간을 주는 게 좋아요.",
      "시니어 시기라 회복과 안정적인 루틴이 특히 중요해요.",
    ],
  },
  cat: {
    baby: [
      "자극에 대한 흥미가 큰 대신 피로도도 빠르게 쌓일 수 있어요.",
      "놀고 쉬는 리듬을 짧게 나누면 아이가 더 편안해질 수 있어요.",
      "키튼 시기라 순간적으로 몰입했다가 금방 쉬고 싶어 할 수 있어요.",
    ],
    young: [
      "호기심과 영역 탐색 욕구가 강하게 드러날 수 있는 시기예요.",
      "새로운 놀이 포인트를 발견하면 만족감이 크게 올라갈 수 있어요.",
      "주니어 시기라 탐색과 관찰의 리듬이 하루 흐름을 크게 좌우할 수 있어요.",
    ],
    adult: [
      "익숙한 루틴과 자기만의 동선을 중시하는 안정적인 흐름이 강해요.",
      "관찰과 반응의 균형을 스스로 맞추려는 경향이 살아 있어요.",
      "어덜트 시기답게 스스로 편한 템포를 지키는 것이 중요해 보여요.",
    ],
    senior: [
      "움직임보다는 편안한 자리와 안정적인 환경을 더 중시할 수 있어요.",
      "무리 없는 교감과 조용한 휴식이 컨디션 유지에 도움이 돼요.",
      "시니어 시기라 환경 안정감이 기분과 컨디션에 크게 연결될 수 있어요.",
    ],
  },
};

const ageSpecificMoodLines: Record<
  PetType,
  Record<AgeGroup, readonly string[]>
> = {
  dog: {
    baby: [
      "아직 감정 표현이 서툴 수 있어 신난 뒤 갑자기 쉬고 싶어질 수 있어요.",
      "퍼피 시기라 보호자의 반응 하나에도 기분이 크게 움직일 수 있어요.",
    ],
    young: [
      "주니어 시기답게 호기심이 기분 흐름을 빠르게 끌어올릴 수 있어요.",
      "배우고 확인받는 과정에서 정서적 만족감이 커질 수 있어요.",
    ],
    adult: [
      "어덜트 시기라 익숙한 패턴 안에서 감정이 더 안정되기 쉬워요.",
      "크게 흔들리기보다 편안한 루틴 속에서 기분이 정리되기 좋아요.",
    ],
    senior: [
      "시니어 시기라 감정보다 컨디션 리듬이 기분에 더 크게 연결될 수 있어요.",
      "무리 없는 반응과 충분한 회복이 정서 안정에 도움이 될 수 있어요.",
    ],
  },
  cat: {
    baby: [
      "키튼 시기라 놀이와 휴식의 전환이 아주 빠르게 나타날 수 있어요.",
      "작은 자극에도 금방 흥미를 보였다가 곧 쉬고 싶어질 수 있어요.",
    ],
    young: [
      "주니어 시기라 관찰과 탐색이 기분 흐름을 크게 좌우할 수 있어요.",
      "흥미로운 포인트를 발견하면 하루 리듬이 훨씬 살아날 수 있어요.",
    ],
    adult: [
      "어덜트 시기라 자기 페이스를 지키는 것이 기분 안정에 중요해요.",
      "무리한 개입보다 익숙한 패턴 유지가 더 잘 맞을 수 있어요.",
    ],
    senior: [
      "시니어 시기라 작은 변화도 피로감으로 이어질 수 있어요.",
      "편안한 자리와 조용한 분위기가 정서 안정에 더 중요할 수 있어요.",
    ],
  },
};

const ageSpecificActionLines: Record<
  PetType,
  Record<AgeGroup, readonly string[]>
> = {
  dog: {
    baby: [
      "짧은 놀이를 여러 번 나눠주고 충분히 쉬게 해주세요.",
      "퍼피 시기에는 신난 뒤 바로 진정할 시간을 같이 만들어주는 게 좋아요.",
    ],
    young: [
      "주니어 시기에는 짧은 학습형 놀이와 칭찬 리듬이 잘 맞아요.",
      "에너지를 쓰는 시간과 안정되는 시간을 분명히 나눠주세요.",
    ],
    adult: [
      "어덜트 시기에는 익숙한 산책과 루틴을 일정하게 지켜주는 게 좋아요.",
      "무리한 자극보다 만족도 높은 짧은 교감이 더 효과적일 수 있어요.",
    ],
    senior: [
      "시니어 시기에는 짧고 편안한 움직임 뒤 회복 시간을 꼭 주세요.",
      "오늘은 컨디션을 먼저 보고 활동 강도를 천천히 맞춰주세요.",
    ],
  },
  cat: {
    baby: [
      "키튼 시기에는 짧고 선명한 놀이 뒤 바로 쉴 수 있게 해주세요.",
      "흥미가 살아날 때만 가볍게 반응하고 오래 끌지는 않는 편이 좋아요.",
    ],
    young: [
      "주니어 시기에는 탐색 욕구를 풀 수 있는 장난감과 공간이 중요해요.",
      "짧은 관찰과 놀이를 번갈아 주면 만족감이 커질 수 있어요.",
    ],
    adult: [
      "어덜트 시기에는 익숙한 루틴과 익숙한 자리를 유지해주는 게 좋아요.",
      "아이가 먼저 반응하는 순간에만 짧고 부드럽게 교감해 주세요.",
    ],
    senior: [
      "시니어 시기에는 쉬는 자리를 방해하지 않는 것이 가장 중요할 수 있어요.",
      "오늘은 놀이보다 편안한 환경과 조용한 교감이 더 잘 맞을 수 있어요.",
    ],
  },
};

const genderToneLines: Record<
  PetType,
  Record<PetGender, readonly string[]>
> = {
  dog: {
    male: [
      "남아라서라기보다 자기 템포가 분명하게 드러날 수 있는 흐름이에요.",
      "오늘은 주도적으로 반응하려는 기질이 조금 더 선명할 수 있어요.",
    ],
    female: [
      "세밀한 반응과 감정 교류가 더 또렷하게 느껴질 수 있어요.",
      "오늘은 분위기 변화에 빠르게 맞추는 섬세함이 강해질 수 있어요.",
    ],
  },
  cat: {
    male: [
      "자기 영역을 살피는 리듬이 조금 더 선명해질 수 있어요.",
      "오늘은 편한 거리와 타이밍을 스스로 정하려는 흐름이 보여요.",
    ],
    female: [
      "기분 변화와 경계감이 더 섬세하게 나타날 수 있어요.",
      "오늘은 주변 분위기를 빠르게 읽고 반응하려는 흐름이 강할 수 있어요.",
    ],
  },
};

const neuterToneLines: Record<
  PetType,
  {
    neutered: readonly string[];
    intact: readonly string[];
  }
> = {
  dog: {
    neutered: [
      "중성화 이후 안정적인 루틴을 선호하는 흐름이 더 잘 드러날 수 있어요.",
      "큰 자극보다 익숙한 패턴 안에서 편안함을 느끼기 쉬울 수 있어요.",
    ],
    intact: [
      "자극에 대한 반응이 조금 더 선명하고 즉각적으로 올라올 수 있어요.",
      "오늘은 주변 반응에 예민하게 흥미를 보일 가능성도 있어요.",
    ],
  },
  cat: {
    neutered: [
      "중성화 이후 익숙한 자리와 편안한 루틴을 더 중시하는 흐름이 느껴질 수 있어요.",
      "갑작스러운 변화보다 예측 가능한 환경이 더 잘 맞을 수 있어요.",
    ],
    intact: [
      "주변 자극에 대한 관찰과 반응이 조금 더 또렷하게 나타날 수 있어요.",
      "오늘은 환경 흐름을 더 세밀하게 읽으려는 모습이 강할 수 있어요.",
    ],
  },
};

const dogAppetiteByMood: Record<MoodKey, readonly string[]> = {
  up: [
    "기분이 오르면 식사나 간식 반응도 함께 빨라질 수 있어요.",
    "먹는 속도가 올라갈 수 있으니 급하게 삼키지 않게 리듬을 봐주세요.",
  ],
  stable: [
    "평소 먹던 루틴 안에서 비교적 안정적인 식사 흐름을 보일 수 있어요.",
    "과한 흥분이 없다면 식사 만족도도 무난하게 이어질 가능성이 커요.",
  ],
  rest: [
    "양보다 편안한 분위기가 더 중요하게 작용할 수 있어요.",
    "식사 전후로 조용한 휴식 시간을 주면 부담이 덜할 수 있어요.",
  ],
  playful: [
    "놀이 후에는 간식이나 식사 반응이 더 또렷해질 수 있어요.",
    "에너지를 쓰고 나면 먹는 즐거움이 커질 가능성이 있어요.",
  ],
  clingy: [
    "보호자와 함께 있는 안정감이 식사 만족에도 영향을 줄 수 있어요.",
    "혼자 먹이기보다 익숙한 분위기를 만들어주면 반응이 좋을 수 있어요.",
  ],
  alert: [
    "주변 자극이 많으면 먹는 데 집중하지 못할 수 있어요.",
    "조용하고 예측 가능한 환경에서 식사 반응을 보는 게 좋아요.",
  ],
};

const catAppetiteByMood: Record<MoodKey, readonly string[]> = {
  up: [
    "기분이 오르면 냄새 확인 뒤 먹는 반응이 또렷해질 수 있어요.",
    "호기심이 식욕과 함께 올라오면 먹기 전 탐색 시간이 길어질 수 있어요.",
  ],
  stable: [
    "평소 루틴을 유지하면 무난한 식사 흐름을 보이기 쉬워요.",
    "오늘은 급하게 먹기보다 자기 템포로 식사하려는 흐름이 강할 수 있어요.",
  ],
  rest: [
    "식사량보다 편안하게 쉬는 환경이 더 중요할 수 있어요.",
    "조용한 자리에서 천천히 먹을 수 있게 해주는 편이 잘 맞아요.",
  ],
  playful: [
    "놀이 뒤에는 짧게 식사나 간식 반응이 올라올 수 있어요.",
    "움직인 뒤 먹는 리듬이 더 자연스럽게 이어질 가능성이 있어요.",
  ],
  clingy: [
    "보호자의 존재를 확인한 뒤 마음이 놓이면 먹는 흐름도 편해질 수 있어요.",
    "가까운 거리의 안정감이 식사 반응에 영향을 줄 수 있어요.",
  ],
  alert: [
    "작은 소리나 변화에도 식사 집중이 끊길 수 있어요.",
    "오늘은 먹는 양보다 방해 없는 환경을 만드는 게 더 중요할 수 있어요.",
  ],
};

const dogHealthByFocus: Record<FocusKey, readonly string[]> = {
  walk: [
    "오늘은 다리와 발걸음 템포를 무리 없이 맞추는 게 중요해요.",
    "산책 강도보다 기분 좋게 마무리되는 흐름을 우선해 주세요.",
  ],
  food: [
    "먹는 반응과 흥분도가 같이 올라갈 수 있으니 천천히 살펴봐 주세요.",
    "간식이나 식사 리듬이 너무 빠르지 않도록 조절해 주는 편이 좋아요.",
  ],
  rest: [
    "충분히 눕고 쉬는 시간이 컨디션 유지에 직접적인 도움이 될 수 있어요.",
    "오늘은 억지 활동보다 회복 시간을 길게 잡는 편이 좋아요.",
  ],
  bonding: [
    "정서적 안정이 몸의 긴장도를 낮추는 데 도움이 될 수 있어요.",
    "차분한 목소리와 익숙한 접촉이 컨디션 유지에 긍정적일 수 있어요.",
  ],
  play: [
    "놀이 강도를 짧고 명확하게 나누면 몸에 무리가 덜할 수 있어요.",
    "즐거움은 좋지만 과열되면 호흡이나 집중이 빨라질 수 있어요.",
  ],
  routine: [
    "익숙한 생활 패턴을 지켜주는 것만으로도 컨디션이 안정되기 쉬워요.",
    "갑작스러운 변화보다 평소 흐름을 유지하는 쪽이 더 잘 맞아요.",
  ],
};

const catHealthByFocus: Record<FocusKey, readonly string[]> = {
  walk: [
    "오늘은 이동량보다 안정적인 동선이 더 중요할 수 있어요.",
    "무리한 활동보다 익숙한 공간 안에서 몸을 푸는 흐름이 잘 맞아요.",
  ],
  food: [
    "먹는 반응을 서두르기보다 편안한 식사 환경을 먼저 만들어 주세요.",
    "천천히 냄새를 확인하고 먹는 리듬을 존중하는 편이 좋아요.",
  ],
  rest: [
    "쉬는 자리를 건드리지 않는 것이 컨디션 유지에 큰 도움이 될 수 있어요.",
    "편안한 휴식 흐름이 몸의 긴장을 푸는 데 가장 중요해 보여요.",
  ],
  bonding: [
    "아이가 먼저 다가오는 타이밍을 존중하면 긴장도가 낮아질 수 있어요.",
    "짧고 부드러운 교감이 심리적 안정에 더 잘 맞는 날일 수 있어요.",
  ],
  play: [
    "짧고 선명한 놀이 뒤 바로 쉴 수 있게 해주는 편이 좋아요.",
    "움직임은 좋지만 지속 시간을 길게 끌지 않는 쪽이 더 잘 맞을 수 있어요.",
  ],
  routine: [
    "익숙한 동선과 생활 패턴을 유지하면 컨디션이 안정되기 쉬워요.",
    "환경 변화가 적을수록 몸과 마음이 더 편안해질 가능성이 커요.",
  ],
};

const dogCautionByKey: Record<CautionKey, readonly string[]> = {
  overexcited: [
    "신나면 힘 조절이 어려워질 수 있으니 중간중간 끊어주는 리듬이 필요해요.",
    "흥분이 길어지면 평소보다 거칠게 반응할 수 있어요.",
  ],
  sensitive: [
    "오늘은 사소한 분위기 변화도 크게 느껴질 수 있어요.",
    "말투와 반응을 부드럽게 유지해 주는 것이 중요해요.",
  ],
  stranger: [
    "낯선 사람이나 새로운 자극에 경계가 올라갈 수 있어요.",
    "가까워지는 속도를 천천히 가져가는 편이 안전해요.",
  ],
  speed: [
    "갑자기 뛰거나 방향을 바꾸는 움직임은 몸에 부담이 될 수 있어요.",
    "속도보다 안정적인 템포를 우선해 주세요.",
  ],
  space: [
    "혼자 쉬고 싶어 하는 순간을 억지로 끊지 않는 편이 좋아요.",
    "붙어 있으려 하기보다 편안한 거리감을 지켜주세요.",
  ],
  noise: [
    "큰 소리나 갑작스러운 자극에 예민해질 수 있어요.",
    "조용한 공간에서 감정을 정리할 시간을 주세요.",
  ],
};

const catCautionByKey: Record<CautionKey, readonly string[]> = {
  overexcited: [
    "짧게 뛰어오른 뒤 갑자기 예민해질 수 있으니 놀이를 길게 끌지 마세요.",
    "흥분이 올라간 직후 바로 만지려 하면 불편해할 수 있어요.",
  ],
  sensitive: [
    "오늘은 접촉 강도나 환경 변화에 평소보다 민감할 수 있어요.",
    "원치 않는 스킨십은 피하고 아이의 반응을 먼저 봐주세요.",
  ],
  stranger: [
    "낯선 냄새나 사람, 물건에 대한 경계심이 커질 수 있어요.",
    "숨을 수 있는 자리와 안전한 거리를 보장해 주는 게 좋아요.",
  ],
  speed: [
    "갑작스러운 점프나 빠른 움직임을 무리하게 유도하지 않는 편이 좋아요.",
    "움직임 뒤에 충분히 쉬는 흐름이 필요할 수 있어요.",
  ],
  space: [
    "혼자 있고 싶어 하는 시간과 자리를 침범하지 않는 것이 중요해요.",
    "아이가 먼저 다가올 때까지 기다려주는 편이 잘 맞아요.",
  ],
  noise: [
    "큰 소리나 생활 소음이 긴장도를 빠르게 올릴 수 있어요.",
    "조용하고 예측 가능한 분위기를 유지해 주세요.",
  ],
};

const dogRecommendedActions: Record<MoodKey, readonly string[]> = {
  up: [
    "짧은 산책이나 냄새 탐색 시간을 충분히 주면 만족도가 높아질 수 있어요.",
    "놀이 전후에 진정 시간을 함께 만들어 주면 흐름이 훨씬 안정돼요.",
  ],
  stable: [
    "평소 루틴을 그대로 지켜주는 것만으로도 좋은 하루가 될 수 있어요.",
    "오늘은 과한 이벤트보다 익숙한 행복을 챙겨주세요.",
  ],
  rest: [
    "쉬는 자리를 정돈하고 방해 없는 시간을 길게 주세요.",
    "가벼운 교감 뒤 충분한 휴식으로 연결해 주는 편이 좋아요.",
  ],
  playful: [
    "짧고 반응이 빠른 놀이를 여러 번 나눠서 해보세요.",
    "장난감 한두 개만 선명하게 활용해도 만족감이 커질 수 있어요.",
  ],
  clingy: [
    "이름을 불러주고 눈을 맞춰주는 짧은 교감을 자주 만들어 주세요.",
    "함께 있다는 느낌을 자주 확인시켜 주는 것이 큰 도움이 될 수 있어요.",
  ],
  alert: [
    "새로운 자극을 줄이기보다 반응 템포를 천천히 맞춰주세요.",
    "산책과 놀이 모두 ‘천천히 확인하기’ 흐름으로 가는 편이 좋아요.",
  ],
};

const catRecommendedActions: Record<MoodKey, readonly string[]> = {
  up: [
    "짧은 추격 놀이와 탐색 시간을 적절히 섞어주면 만족감이 커질 수 있어요.",
    "높은 자리나 창가처럼 아이가 좋아하는 관찰 포인트를 열어 주세요.",
  ],
  stable: [
    "익숙한 자리, 익숙한 루틴을 유지해 주는 것이 가장 좋아요.",
    "오늘은 조용한 존재감만으로도 충분한 교감이 될 수 있어요.",
  ],
  rest: [
    "숨숨집이나 쉬는 자리를 정리해 아이가 오래 머물 수 있게 해주세요.",
    "스킨십보다 방해받지 않는 휴식 시간을 보장해 주는 편이 좋아요.",
  ],
  playful: [
    "낚싯대 장난감처럼 짧고 선명한 놀이를 여러 번 나눠주세요.",
    "놀이가 끝난 뒤 바로 쉴 수 있는 자리를 함께 준비해 주세요.",
  ],
  clingy: [
    "아이가 먼저 다가오는 순간에 맞춰 짧고 부드럽게 반응해 주세요.",
    "무리한 접촉보다 가까운 자리를 함께 쓰는 방식이 잘 맞을 수 있어요.",
  ],
  alert: [
    "오늘은 새로운 자극보다 익숙한 환경을 지켜주는 편이 더 좋아요.",
    "거리에서 지켜보는 시간을 존중해 주면 긴장이 빨리 낮아질 수 있어요.",
  ],
};

const breedSpecificSummaryLines: Partial<
  Record<PetType, Record<string, readonly string[]>>
> = {
  dog: {
    말티즈: [
      "말티즈답게 보호자 반응에 정서적으로 크게 기대는 흐름이 살아날 수 있어요.",
      "말티즈 특유의 애정 표현이 더 또렷하게 드러날 수 있는 날이에요.",
    ],
    푸들: [
      "푸들답게 반응을 빠르게 읽고 상황에 민감하게 맞추려는 흐름이 보여요.",
      "푸들 특유의 영리한 반응성이 오늘 더 도드라질 수 있어요.",
    ],
    토이푸들: [
      "토이푸들 특유의 빠른 눈치와 반응이 교감 흐름을 살려줄 수 있어요.",
      "토이푸들답게 보호자의 신호를 세심하게 읽으려는 모습이 강할 수 있어요.",
    ],
    포메라니안: [
      "포메라니안 특유의 경쾌한 반응과 예민함이 함께 살아날 수 있어요.",
      "포메라니안답게 작지만 선명한 감정 표현이 도드라질 수 있어요.",
    ],
    비숑프리제: [
      "비숑프리제 특유의 밝은 교감 성향이 오늘 더 크게 느껴질 수 있어요.",
      "비숑프리제답게 함께 노는 흐름에서 만족감이 빠르게 올라올 수 있어요.",
    ],
    웰시코기: [
      "웰시코기 특유의 활발한 에너지와 주변 살핌이 함께 살아날 수 있어요.",
      "웰시코기답게 움직이면서도 상황을 빠르게 읽으려는 흐름이 보여요.",
    ],
    골든리트리버: [
      "골든리트리버 특유의 다정한 교감 기질이 오늘 더 따뜻하게 드러날 수 있어요.",
      "골든리트리버답게 사람과 함께하는 흐름에서 안정감이 커질 수 있어요.",
    ],
    래브라도리트리버: [
      "래브라도리트리버 특유의 밝은 사회성과 활동성이 살아날 수 있어요.",
      "래브라도리트리버답게 함께 움직이고 반응하는 흐름이 강해질 수 있어요.",
    ],
    비글: [
      "비글 특유의 탐색 욕구와 호기심이 평소보다 더 선명하게 드러날 수 있어요.",
      "비글답게 냄새와 움직임에 대한 관심이 크게 올라올 수 있어요.",
    ],
    시바견: [
      "시바견 특유의 독립적인 템포를 존중해줄수록 흐름이 좋아질 수 있어요.",
      "시바견답게 자기 기준으로 상황을 살피며 반응하려는 기질이 강해질 수 있어요.",
    ],
  },
  cat: {
    코리안숏헤어: [
      "코리안숏헤어 특유의 상황 판단과 생활 적응력이 오늘의 흐름을 안정시켜줄 수 있어요.",
      "코리안숏헤어답게 관찰과 반응의 균형을 스스로 잘 맞추려는 모습이 보여요.",
    ],
    러시안블루: [
      "러시안블루 특유의 섬세한 거리감과 조용한 신뢰 흐름이 살아날 수 있어요.",
      "러시안블루답게 편안한 사람에게만 조용히 마음을 여는 기질이 느껴질 수 있어요.",
    ],
    브리티시숏헤어: [
      "브리티시숏헤어 특유의 차분한 리듬을 지켜줄수록 만족감이 커질 수 있어요.",
      "브리티시숏헤어답게 안정적인 환경 안에서 편안함을 깊게 느끼기 쉬워요.",
    ],
    랙돌: [
      "랙돌 특유의 부드럽고 다정한 교감 기질이 평소보다 더 도드라질 수 있어요.",
      "랙돌답게 가까운 사람 곁에서 정서적 안정감을 찾으려는 흐름이 보여요.",
    ],
    샴: [
      "샴 특유의 선명한 표현력과 반응성이 오늘 더 또렷하게 살아날 수 있어요.",
      "샴답게 관심이 가는 대상에 집중하는 흐름이 강해질 수 있어요.",
    ],
    먼치킨: [
      "먼치킨 특유의 발랄한 호기심이 짧은 교감과 놀이에서 살아날 수 있어요.",
      "먼치킨답게 가볍고 빠른 관심 전환이 오늘의 리듬을 만들 수 있어요.",
    ],
    메인쿤: [
      "메인쿤 특유의 여유 있는 탐색 성향과 교감 기질이 함께 살아날 수 있어요.",
      "메인쿤답게 부드럽게 상황을 읽으면서도 관심 있는 순간에는 또렷하게 반응할 수 있어요.",
    ],
    벵갈: [
      "벵갈 특유의 강한 탐색 욕구와 활동성이 오늘 더 선명하게 드러날 수 있어요.",
      "벵갈답게 움직임과 자극에 대한 반응이 빠르게 올라올 수 있어요.",
    ],
    아비시니안: [
      "아비시니안 특유의 민첩한 호기심과 높은 집중력이 살아날 수 있어요.",
      "아비시니안답게 가볍게 시작한 놀이도 금방 진지하게 몰입할 수 있어요.",
    ],
    스코티시폴드: [
      "스코티시폴드 특유의 부드럽고 조용한 교감 흐름이 안정감을 만들어줄 수 있어요.",
      "스코티시폴드답게 편안한 분위기 안에서 정서적 만족감이 잘 올라올 수 있어요.",
    ],
  },
};

function getBreedSpecificLine(
  petType: PetType,
  breed: string,
  seed: number
) {
  const normalized = breed.trim().replace(/\s+/g, "");
  const speciesLines = breedSpecificSummaryLines[petType];
  if (!speciesLines) return "";
  const lines = speciesLines[normalized];
  if (!lines || lines.length === 0) return "";
  return pickText(lines, seed);
}

function buildSummary(
  petType: PetType,
  moodKey: MoodKey,
  ageGroup: AgeGroup,
  behaviorLine: string,
  ageLine: string
) {
  const opening = pickText(
    petType === "dog" ? dogSummaryOpenings[moodKey] : catSummaryOpenings[moodKey],
    hashString(`${petType}|${moodKey}|opening`)
  );

  return `${opening} ${behaviorLine} ${ageLine}`;
}

export function buildFortuneResult(args: {
  petId: string;
  petName: string;
  petType: PetType;
  petGender: PetGender;
  isNeutered: boolean;
  breed: string;
  birthDate?: string;
  birthTime?: string;
  history: FortuneHistoryItem[];
}): GeneratedFortune {
  const {
    petId,
    petName,
    petType,
    petGender,
    isNeutered,
    breed,
    birthDate = "생일 미입력",
    birthTime = "시간 모름",
    history,
  } = args;

  const todayKey = getTodayKey();
  const ageGroup = getAgeGroup(birthDate);
  const lifeStageLabel = getLifeStageLabel(ageGroup, petType);
  const breedProfile = getBreedProfile(petType, breed);

  const personalitySeed = hashString(
    `${petId}|${petName}|${petType}|${petGender}|${breed}`
  );
  const dailySeed = hashString(
    `${petId}|${todayKey}|${birthDate}|${birthTime}|${isNeutered}`
  );

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

  const breedBasedPersonality = inferPersonalityKey(
    petType,
    breed,
    petGender,
    personalitySeed
  );

  const personalityCandidates: readonly PersonalityKey[] = [
    breedBasedPersonality,
    petType === "dog" ? "affectionate" : "independent",
    ageGroup === "baby" ? "curious" : "gentle",
    breedProfile.energy === "high" ? "energetic" : "gentle",
    breedProfile.temperamentTags.includes("sensitive")
      ? "sensitive"
      : "affectionate",
  ];

  const personalityPool = Array.from(
    new Set<PersonalityKey>([
      ...personalityCandidates,
      "energetic",
      "gentle",
      "curious",
      "independent",
      "affectionate",
      "sensitive",
    ])
  );

  const personalityKey = pickNonRepeating(
    personalityPool,
    personalitySeed,
    recentPersonality
  );

  const personalityLine = pickText(
    personalityDescriptions[personalityKey][petType],
    dailySeed + 9
  );

  const moodKey = pickNonRepeating(moodKeyOptions, dailySeed + 1, recentMood);

  const focusKey = pickNonRepeating(
    [
      inferFocusKey(petType, moodKey, ageGroup, dailySeed),
      "bonding",
      "routine",
      petType === "dog" ? "walk" : "rest",
      petType === "dog" ? "play" : "food",
    ] as const,
    dailySeed + 2,
    recentFocus
  );

  const cautionKey = pickNonRepeating(
    [
      inferCautionKey(petType, moodKey, ageGroup),
      "sensitive",
      petType === "dog" ? "noise" : "space",
      "speed",
    ] as const,
    dailySeed + 3,
    recentCaution
  );

  const behaviorLine = pickText(
    petType === "dog" ? dogBehaviorByMood[moodKey] : catBehaviorByMood[moodKey],
    dailySeed + 10
  );

  const ageLine = pickText(
    ageToneBySpecies[petType][ageGroup],
    dailySeed + 11
  );

  const ageMoodLine = pickText(
    ageSpecificMoodLines[petType][ageGroup],
    dailySeed + 19
  );

  const ageActionLine = pickText(
    ageSpecificActionLines[petType][ageGroup],
    dailySeed + 20
  );

  const genderToneLine = pickText(
    genderToneLines[petType][petGender],
    dailySeed + 21
  );

  const neuterToneLine = pickText(
    isNeutered
      ? neuterToneLines[petType].neutered
      : neuterToneLines[petType].intact,
    dailySeed + 22
  );

  const breedEnergyLine =
    breedProfile.energy === "high"
      ? petType === "dog"
        ? `${breed} 특유의 활동성이 오늘은 더 살아날 수 있어요.`
        : `${breed} 특유의 반응성과 탐색 욕구가 또렷해질 수 있어요.`
      : petType === "dog"
      ? `${breed}답게 차분한 리듬을 지킬수록 더 편안할 수 있어요.`
      : `${breed} 특유의 신중한 리듬을 지켜주는 것이 중요해 보여요.`;

  const breedSpecificLine = getBreedSpecificLine(petType, breed, dailySeed + 18);

  const summary = `${petName}의 오늘 운세는 이렇게 읽혀요. ${lifeStageLabel} 시기의 흐름을 기준으로 보면, ${buildSummary(
    petType,
    moodKey,
    ageGroup,
    behaviorLine,
    ageLine
  )} ${personalityLine} ${breedEnergyLine}${
    breedSpecificLine ? ` ${breedSpecificLine}` : ""
  } ${genderToneLine} ${neuterToneLine}`;

  const mood = `${behaviorLine} ${ageMoodLine} ${
    petType === "dog"
      ? "보호자의 반응 템포를 맞춰주면 감정 흐름이 더 안정될 수 있어요."
      : "아이가 먼저 반응하는 순간을 기다려주면 기분 흐름이 더 좋아질 수 있어요."
  }`;

  const healthBase = pickText(
    petType === "dog" ? dogHealthByFocus[focusKey] : catHealthByFocus[focusKey],
    dailySeed + 12
  );

  const health =
    ageGroup === "senior"
      ? `${healthBase} 오늘은 회복 시간을 넉넉히 주는 것이 특히 중요해요.`
      : ageGroup === "baby"
      ? `${healthBase} 아직 체력 조절이 서툴 수 있어 무리 없는 흐름이 중요해요.`
      : healthBase;

  const appetiteBase = pickText(
    petType === "dog" ? dogAppetiteByMood[moodKey] : catAppetiteByMood[moodKey],
    dailySeed + 13
  );

  const appetite =
    breedProfile.energy === "high"
      ? `${appetiteBase} 평소보다 에너지를 더 쓰는 날이라 먹는 반응도 또렷할 수 있어요.`
      : ageGroup === "baby"
      ? `${appetiteBase} 아직 리듬이 쉽게 흔들릴 수 있으니 편안한 분위기를 먼저 만들어 주세요.`
      : appetiteBase;

  const cautionBase = pickText(
    petType === "dog"
      ? dogCautionByKey[cautionKey]
      : catCautionByKey[cautionKey],
    dailySeed + 14
  );

  const caution =
    ageGroup === "senior"
      ? `${cautionBase} 오늘은 무리한 속도나 급한 전환을 특히 피하는 편이 좋아요.`
      : ageGroup === "baby"
      ? `${cautionBase} 아직 흥분 조절이 서툴 수 있어 짧게 끊어주는 리듬이 중요해요.`
      : cautionBase;

  const actionBase = pickText(
    petType === "dog"
      ? dogRecommendedActions[moodKey]
      : catRecommendedActions[moodKey],
    dailySeed + 15
  );

  const recommendedActionBase =
    breedProfile.temperamentTags.includes("affectionate")
      ? `${actionBase} 오늘은 짧게라도 교감 시간을 분명하게 만들어주면 만족도가 높아질 수 있어요.`
      : breedProfile.temperamentTags.includes("independent")
      ? `${actionBase} 너무 앞서기보다 아이가 먼저 템포를 정하도록 두는 편이 잘 맞아요.`
      : actionBase;

  const recommendedAction = `${recommendedActionBase} ${ageActionLine}`;

  const luckyItemPool = getLuckyItemsBySpecies(petType);

  return {
    summary,
    health,
    appetite,
    mood,
    caution,
    luckyColor: luckyColors[(dailySeed + 16) % luckyColors.length],
    luckyItem: luckyItemPool[(dailySeed + 17) % luckyItemPool.length],
    recommendedAction,
    personalityKey,
    moodKey,
    focusKey,
    cautionKey,
  };
}