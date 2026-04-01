import bondStylePool from "../data/personality/bond-style.json";
import careTipPool from "../data/personality/care-tip.json";
import coreTypeDescPool from "../data/personality/core-type-desc.json";
import coreTypePool from "../data/personality/core-type.json";
import emotionStylePool from "../data/personality/emotion-style.json";
import personalityPool from "../data/personality/personality.json";
import socialStylePool from "../data/personality/social-style.json";
import stressPointPool from "../data/personality/stress-point.json";
import summaryAdvicePool from "../data/personality/summary-advice.json";
import summaryFlowPool from "../data/personality/summary-flow.json";
import summaryIntroPool from "../data/personality/summary-intro.json";
import {
  getRecentPremiumTexts,
  saveRecentPremiumTexts,
} from "./premium-history.service";

type PetType = "dog" | "cat";
type PersonalityLevel = "low" | "mid" | "high";
type AgeStage = "baby" | "young" | "adult" | "senior";

type BreedPersonalityProfile = {
  energy: PersonalityLevel;
  sociability: PersonalityLevel;
  dependency: PersonalityLevel;
  sensitivity: PersonalityLevel;
  activity: PersonalityLevel;
  routine: PersonalityLevel;
};

const dogBreedPersonalityProfiles: Record<string, BreedPersonalityProfile> = {
  말티즈: {
    energy: "mid",
    sociability: "high",
    dependency: "high",
    sensitivity: "high",
    activity: "mid",
    routine: "mid",
  },
  말티푸: {
    energy: "mid",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  포메라니안: {
    energy: "high",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "high",
    activity: "high",
    routine: "low",
  },
  푸들: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  토이푸들: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  미니어처푸들: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  비숑프리제: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  치와와: {
    energy: "mid",
    sociability: "low",
    dependency: "high",
    sensitivity: "high",
    activity: "mid",
    routine: "high",
  },
  시츄: {
    energy: "low",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  요크셔테리어: {
    energy: "high",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "high",
    activity: "high",
    routine: "mid",
  },
  닥스훈트: {
    energy: "mid",
    sociability: "low",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  웰시코기: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  골든리트리버: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "low",
    activity: "high",
    routine: "mid",
  },
  래브라도리트리버: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "low",
    activity: "high",
    routine: "mid",
  },
  진돗개: {
    energy: "mid",
    sociability: "low",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  시바견: {
    energy: "mid",
    sociability: "low",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  프렌치불도그: {
    energy: "low",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  퍼그: {
    energy: "low",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  스피츠: {
    energy: "mid",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  보더콜리: {
    energy: "high",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "high",
    activity: "high",
    routine: "high",
  },
  슈나우저: {
    energy: "mid",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  코카스파니엘: {
    energy: "mid",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  비글: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  사모예드: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "low",
    activity: "high",
    routine: "mid",
  },
  알래스칸말라뮤트: {
    energy: "high",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  시베리안허스키: {
    energy: "high",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  파피용: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  페키니즈: {
    energy: "low",
    sociability: "low",
    dependency: "mid",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  보스턴테리어: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "mid",
  },
  도베르만: {
    energy: "high",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "high",
  },
  셰틀랜드쉽독: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "high",
    activity: "high",
    routine: "high",
  },
  믹스견: {
    energy: "mid",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
};

const catBreedPersonalityProfiles: Record<string, BreedPersonalityProfile> = {
  코리안숏헤어: {
    energy: "mid",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  페르시안: {
    energy: "low",
    sociability: "low",
    dependency: "mid",
    sensitivity: "high",
    activity: "low",
    routine: "high",
  },
  러시안블루: {
    energy: "mid",
    sociability: "low",
    dependency: "low",
    sensitivity: "high",
    activity: "mid",
    routine: "high",
  },
  브리티시숏헤어: {
    energy: "low",
    sociability: "low",
    dependency: "low",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  브리티시롱헤어: {
    energy: "low",
    sociability: "low",
    dependency: "low",
    sensitivity: "mid",
    activity: "low",
    routine: "high",
  },
  랙돌: {
    energy: "low",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "low",
    routine: "mid",
  },
  스코티시폴드: {
    energy: "low",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "high",
    activity: "low",
    routine: "high",
  },
  샴: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  먼치킨: {
    energy: "mid",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  노르웨이숲: {
    energy: "mid",
    sociability: "low",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  메인쿤: {
    energy: "mid",
    sociability: "high",
    dependency: "mid",
    sensitivity: "low",
    activity: "mid",
    routine: "mid",
  },
  벵갈: {
    energy: "high",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  터키시앙고라: {
    energy: "mid",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  아비시니안: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  봄베이: {
    energy: "mid",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  아메리칸숏헤어: {
    energy: "mid",
    sociability: "mid",
    dependency: "low",
    sensitivity: "mid",
    activity: "mid",
    routine: "high",
  },
  엑조틱숏헤어: {
    energy: "low",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "high",
    activity: "low",
    routine: "high",
  },
  스핑크스: {
    energy: "high",
    sociability: "high",
    dependency: "high",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  버만: {
    energy: "mid",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
  데본렉스: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  코니시렉스: {
    energy: "high",
    sociability: "high",
    dependency: "mid",
    sensitivity: "mid",
    activity: "high",
    routine: "low",
  },
  믹스묘: {
    energy: "mid",
    sociability: "mid",
    dependency: "mid",
    sensitivity: "mid",
    activity: "mid",
    routine: "mid",
  },
};

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function replaceName(text: string, petName: string) {
  return text.split("{petName}").join(petName);
}

function normalizeBreedName(breed: string) {
  return breed.trim().replace(/\s+/g, "");
}

function getBreedPersonalityProfile(
  petType: PetType,
  breed: string
): BreedPersonalityProfile {
  const normalized = normalizeBreedName(breed);

  if (petType === "dog") {
    return (
      dogBreedPersonalityProfiles[normalized] ?? {
        energy: "mid",
        sociability: "mid",
        dependency: "mid",
        sensitivity: "mid",
        activity: "mid",
        routine: "mid",
      }
    );
  }

  return (
    catBreedPersonalityProfiles[normalized] ?? {
      energy: "mid",
      sociability: "mid",
      dependency: "mid",
      sensitivity: "mid",
      activity: "mid",
      routine: "mid",
    }
  );
}

function parseBirthDate(birthDate: string) {
  const normalized = birthDate.replace(/\./g, "-").trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  return date;
}

function getAgeMonths(birthDate: string) {
  const birth = parseBirthDate(birthDate);
  if (!birth) return 36;

  const now = new Date();

  return (
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth()) -
    (now.getDate() < birth.getDate() ? 1 : 0)
  );
}

function getAgeStage(months: number): AgeStage {
  if (months < 6) return "baby";
  if (months < 24) return "young";
  if (months < 84) return "adult";
  return "senior";
}

function getAgeStageLabel(ageStage: AgeStage, petType: PetType) {
  if (petType === "cat") {
    if (ageStage === "baby") return "키튼";
    if (ageStage === "young") return "주니어";
    if (ageStage === "adult") return "어덜트";
    return "시니어";
  }

  if (ageStage === "baby") return "퍼피";
  if (ageStage === "young") return "주니어";
  if (ageStage === "adult") return "어덜트";
  return "시니어";
}

function pickAvoidRecent(
  items: string[],
  seed: number,
  recentValues: string[],
  petName?: string
) {
  const recentSet = new Set(recentValues);

  const sorted = [...items].sort((a, b) => {
    const aScore = hashString(`${a}|${seed}`);
    const bScore = hashString(`${b}|${seed}`);
    return aScore - bScore;
  });

  const picked =
    sorted.find((item) => {
      const value = petName ? replaceName(item, petName) : item;
      return !recentSet.has(value);
    }) ?? sorted[0];

  return petName ? replaceName(picked, petName) : picked;
}

function levelToKorean(level: PersonalityLevel, kind: string) {
  const map: Record<string, Record<PersonalityLevel, string>> = {
    energy: {
      low: "차분한 편",
      mid: "균형 잡힌 편",
      high: "에너지가 높은 편",
    },
    sociability: {
      low: "낯을 가리는 편",
      mid: "선택적으로 어울리는 편",
      high: "교감을 좋아하는 편",
    },
    dependency: {
      low: "혼자만의 템포가 뚜렷한 편",
      mid: "적당히 기대는 편",
      high: "가까운 존재에게 정서적으로 기대는 편",
    },
    sensitivity: {
      low: "자극에 비교적 안정적인 편",
      mid: "상황에 따라 예민함이 달라지는 편",
      high: "환경 변화에 민감한 편",
    },
    activity: {
      low: "움직임보다 휴식을 중시하는 편",
      mid: "활동과 휴식의 균형을 찾는 편",
      high: "움직이며 반응하는 성향이 강한 편",
    },
    routine: {
      low: "변화에 비교적 유연한 편",
      mid: "익숙한 흐름을 무난히 따르는 편",
      high: "루틴과 예측 가능한 흐름을 좋아하는 편",
    },
  };

  return map[kind]?.[level] ?? "균형 잡힌 편";
}

function buildCoreType(profile: BreedPersonalityProfile, petType: PetType) {
  const energyPart =
    profile.energy === "high"
      ? "활동형"
      : profile.energy === "low"
      ? "안정형"
      : "균형형";

  const bondPart =
    profile.dependency === "high" || profile.sociability === "high"
      ? "교감형"
      : profile.dependency === "low" && profile.sociability === "low"
      ? "독립형"
      : "관찰형";

  const sensitivityPart =
    profile.sensitivity === "high"
      ? petType === "cat"
        ? "섬세형"
        : "예민형"
      : profile.activity === "high"
      ? "반응형"
      : "안정추구형";

  return `${energyPart} ${bondPart} ${sensitivityPart}`;
}

function buildProfileSummaryLine(
  petName: string,
  petType: PetType,
  breed: string,
  ageStageLabel: string,
  profile: BreedPersonalityProfile
) {
  const speciesText = petType === "cat" ? "고양이" : "강아지";

  return `${petName}는 ${breed} ${speciesText}의 결을 바탕으로, ${ageStageLabel} 시기 특성이 함께 나타나는 아이예요. 전반적으로 ${levelToKorean(
    profile.energy,
    "energy"
  )}, ${levelToKorean(profile.sociability, "sociability")}, ${levelToKorean(
    profile.sensitivity,
    "sensitivity"
  )}으로 읽히는 편이에요.`;
}

function buildPersonalityAddon(
  petName: string,
  profile: BreedPersonalityProfile
) {
  const parts: string[] = [];

  if (profile.dependency === "high") {
    parts.push(
      `${petName}는 가까운 보호자와의 정서적 연결을 통해 안정감을 크게 얻는 편이에요.`
    );
  } else if (profile.dependency === "low") {
    parts.push(
      `${petName}는 스스로 템포를 정하고 자기 방식대로 반응할 때 더 편안함을 느끼는 편이에요.`
    );
  }

  if (profile.activity === "high") {
    parts.push("생각보다 몸이 먼저 반응하는 순간이 많아 놀이와 자극의 질이 중요해요.");
  } else if (profile.activity === "low") {
    parts.push("움직임보다 편안한 환경과 감정적 안정이 먼저 갖춰질 때 만족도가 올라가기 쉬워요.");
  }

  if (profile.routine === "high") {
    parts.push("루틴이 흔들리면 컨디션과 반응 폭이 같이 흔들릴 가능성이 있어요.");
  }

  return parts.join(" ");
}

function buildEmotionAddon(
  petName: string,
  petType: PetType,
  ageStage: AgeStage,
  profile: BreedPersonalityProfile
) {
  const lines: string[] = [];

  if (profile.sensitivity === "high") {
    lines.push(
      `${petName}는 작은 분위기 변화나 낯선 자극도 감정적으로 크게 받아들일 수 있어요.`
    );
  }

  if (profile.dependency === "high") {
    lines.push(
      petType === "cat"
        ? "믿는 상대 앞에서는 감정이 풀리지만, 낯선 상황에서는 표현을 아끼는 편일 수 있어요."
        : "보호자의 반응 하나가 감정 흐름을 정리하는 데 큰 영향을 줄 수 있어요."
    );
  }

  if (ageStage === "baby") {
    lines.push("아직 감정 조절이 서툴 수 있어 신난 뒤 갑자기 쉬고 싶어질 수 있어요.");
  } else if (ageStage === "senior") {
    lines.push("요즘은 감정보다 컨디션 흐름이 먼저 반응을 이끌 가능성도 커요.");
  }

  return lines.join(" ");
}

function buildSocialAddon(
  petType: PetType,
  profile: BreedPersonalityProfile,
  isNeutered: boolean
) {
  const lines: string[] = [];

  if (profile.sociability === "high") {
    lines.push(
      petType === "cat"
        ? "신뢰가 생기면 가까운 존재에게는 예상보다 따뜻하게 반응할 수 있어요."
        : "익숙한 존재와의 교감에서 빠르게 마음이 열리는 편이에요."
    );
  } else if (profile.sociability === "low") {
    lines.push(
      "누구와도 바로 가까워지기보다, 스스로 안전하다고 판단한 뒤 관계를 여는 타입에 가까워요."
    );
  }

  if (isNeutered) {
    lines.push("전반적으로 익숙한 관계 안에서 편안함을 유지하려는 경향이 더 잘 드러날 수 있어요.");
  } else {
    lines.push("주변 자극에 대한 관심이 선명하게 올라오는 날에는 관계 반응도 조금 더 즉각적일 수 있어요.");
  }

  return lines.join(" ");
}

function buildStressAddon(
  petName: string,
  profile: BreedPersonalityProfile,
  ageStage: AgeStage
) {
  const lines: string[] = [];

  if (profile.sensitivity === "high") {
    lines.push(
      `${petName}는 소리, 거리감, 분위기 변화처럼 눈에 잘 안 보이는 자극에도 스트레스를 받을 수 있어요.`
    );
  }

  if (profile.routine === "high") {
    lines.push("예상하던 흐름이 갑자기 깨지면 평소보다 더 크게 불편함을 느낄 수 있어요.");
  }

  if (ageStage === "baby") {
    lines.push("지금 시기에는 과한 자극이 누적되면 금방 지치거나 예민해질 수 있어요.");
  } else if (ageStage === "senior") {
    lines.push("요즘은 회복 속도를 먼저 고려해주는 것이 스트레스 관리에 더 중요할 수 있어요.");
  }

  return lines.join(" ");
}

function buildBondAddon(
  petName: string,
  profile: BreedPersonalityProfile,
  petGender: string
) {
  const lines: string[] = [];

  if (profile.dependency === "high") {
    lines.push(
      `${petName}는 보호자의 표정, 말투, 반응 패턴을 유심히 읽으면서 유대를 깊게 쌓는 편이에요.`
    );
  } else if (profile.dependency === "low") {
    lines.push(
      `${petName}는 먼저 다가오기보다, 본인이 편하다고 느끼는 순간에 관계를 여는 편이에요.`
    );
  }

  if (petGender === "female") {
    lines.push("정서적인 교감이 부드럽고 세밀하게 이어질 때 유대감이 더 깊어질 수 있어요.");
  } else {
    lines.push("짧고 분명한 반응을 주고받을 때 신뢰가 더 빨리 쌓일 가능성이 있어요.");
  }

  return lines.join(" ");
}

function buildCareTipAddon(
  petType: PetType,
  ageStage: AgeStage,
  profile: BreedPersonalityProfile
) {
  const lines: string[] = [];

  if (profile.activity === "high") {
    lines.push(
      petType === "cat"
        ? "짧고 선명한 놀이를 여러 번 나눠주는 방식이 특히 잘 맞을 수 있어요."
        : "산책, 놀이, 반응 훈련을 짧고 분명하게 나눠주면 만족도가 올라가기 쉬워요."
    );
  } else {
    lines.push("무리하게 끌어올리기보다 편안함을 먼저 확보한 뒤 반응을 기다려주는 편이 좋아요.");
  }

  if (profile.routine === "high") {
    lines.push("생활 리듬과 공간 사용 패턴을 일정하게 유지해주면 컨디션이 훨씬 안정될 수 있어요.");
  }

  if (ageStage === "baby") {
    lines.push("아직 어린 시기에는 짧게 놀고 충분히 쉬는 흐름을 자주 만들어 주세요.");
  } else if (ageStage === "senior") {
    lines.push("지금은 자극의 양보다 회복 시간을 넉넉히 주는 것이 더 중요할 수 있어요.");
  }

  return lines.join(" ");
}

export function generatePersonalityAnalysis(input: {
  petId: string;
  petName: string;
  petType: string;
  petGender: string;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
}) {
  const petType = (input.petType === "cat" ? "cat" : "dog") as PetType;
  const profile = getBreedPersonalityProfile(petType, input.breed);
  const ageMonths = getAgeMonths(input.birthDate);
  const ageStage = getAgeStage(ageMonths);
  const ageStageLabel = getAgeStageLabel(ageStage, petType);

  const seed = hashString(
    [
      input.petId,
      input.petName,
      petType,
      input.petGender,
      input.isNeutered ? "1" : "0",
      input.breed,
      input.birthDate,
      input.birthTime,
      profile.energy,
      profile.sociability,
      profile.dependency,
      profile.sensitivity,
      profile.activity,
      profile.routine,
      ageStage,
    ].join("|")
  );

  const historyKey = `personality|${input.petId}`;
  const recent = getRecentPremiumTexts(historyKey, 8);

  const baseCoreTypePool = Array.from(
    new Set([buildCoreType(profile, petType), ...coreTypePool])
  );

  const coreType = pickAvoidRecent(baseCoreTypePool, seed, recent);
  const coreTypeDesc = pickAvoidRecent(coreTypeDescPool, seed + 1, recent);
  const summaryIntro = pickAvoidRecent(
    summaryIntroPool,
    seed + 2,
    recent,
    input.petName
  );
  const summaryFlow = pickAvoidRecent(
    summaryFlowPool,
    seed + 3,
    recent,
    input.petName
  );
  const summaryAdvice = pickAvoidRecent(
    summaryAdvicePool,
    seed + 4,
    recent,
    input.petName
  );

  const profileSummaryLine = buildProfileSummaryLine(
    input.petName,
    petType,
    input.breed,
    ageStageLabel,
    profile
  );

  const personalityAddon = buildPersonalityAddon(input.petName, profile);
  const emotionAddon = buildEmotionAddon(
    input.petName,
    petType,
    ageStage,
    profile
  );
  const socialAddon = buildSocialAddon(
    petType,
    profile,
    input.isNeutered
  );
  const stressAddon = buildStressAddon(input.petName, profile, ageStage);
  const bondAddon = buildBondAddon(
    input.petName,
    profile,
    input.petGender
  );
  const careTipAddon = buildCareTipAddon(petType, ageStage, profile);

  const result = {
    petId: input.petId,
    petName: input.petName,
    coreType,
    summary: `${summaryIntro} ${summaryFlow} ${profileSummaryLine} ${summaryAdvice}`,
    personality: `${pickAvoidRecent(
      personalityPool,
      seed + 5,
      recent,
      input.petName
    )} ${coreTypeDesc} ${personalityAddon}`,
    emotionStyle: `${pickAvoidRecent(
      emotionStylePool,
      seed + 6,
      recent,
      input.petName
    )} ${emotionAddon}`,
    socialStyle: `${pickAvoidRecent(
      socialStylePool,
      seed + 7,
      recent,
      input.petName
    )} ${socialAddon}`,
    stressPoint: `${pickAvoidRecent(
      stressPointPool,
      seed + 8,
      recent,
      input.petName
    )} ${stressAddon}`,
    bondStyle: `${pickAvoidRecent(
      bondStylePool,
      seed + 9,
      recent,
      input.petName
    )} ${bondAddon}`,
    careTip: `${pickAvoidRecent(
      careTipPool,
      seed + 10,
      recent,
      input.petName
    )} ${careTipAddon}`,
  };

  saveRecentPremiumTexts(historyKey, [
    result.summary,
    result.personality,
    result.emotionStyle,
    result.socialStyle,
    result.stressPoint,
    result.bondStyle,
    result.careTip,
  ]);

  return result;
}