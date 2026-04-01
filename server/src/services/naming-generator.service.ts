import firstImpressionPool from "../data/naming/first-impression.json";
import hiddenCharmPool from "../data/naming/hidden-charm.json";
import luckyPointPool from "../data/naming/lucky-point.json";
import nameEnergyDescPool from "../data/naming/name-energy-desc.json";
import nameEnergyPool from "../data/naming/name-energy.json";
import namingTipPool from "../data/naming/naming-tip.json";
import relationshipFlowPool from "../data/naming/relationship-flow.json";
import summaryAdvicePool from "../data/naming/summary-advice.json";
import summaryFlowPool from "../data/naming/summary-flow.json";
import summaryIntroPool from "../data/naming/summary-intro.json";
import {
  getRecentPremiumTexts,
  saveRecentPremiumTexts,
} from "./premium-history.service";

type PetType = "dog" | "cat";
type AgeStage = "baby" | "young" | "adult" | "senior";

type NamePatternProfile = {
  length: number;
  repeatedTone: boolean;
  softTone: boolean;
  strongTone: boolean;
  endsSoft: boolean;
  brightVowel: boolean;
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

function normalizeName(name: string) {
  return name.trim();
}

function countNameLength(name: string) {
  return [...name].length;
}

function hasRepeatedTone(name: string) {
  const chars = [...name];
  if (chars.length < 2) return false;

  if (chars.length === 2 && chars[0] === chars[1]) return true;
  if (chars.length >= 2 && chars[0] === chars[chars.length - 1]) return true;

  return /(.)\1/.test(name);
}

function hasSoftTone(name: string) {
  return /[ㄴㄹㅁㅇㅎㅜㅠㅗㅛㅓㅕㅏㅑ모노루로미나하]/.test(name);
}

function hasStrongTone(name: string) {
  return /[ㄲㄸㅃㅆㅉㅋㅌㅍㅊ까따빠싸짜차카타파]/.test(name);
}

function endsWithSoftTone(name: string) {
  const lastChar = [...name].pop() ?? "";
  return /[아야오요우유이모노루리미나]/.test(lastChar);
}

function hasBrightVowel(name: string) {
  return /[아야오요우유]/.test(name);
}

function analyzeNamePattern(name: string): NamePatternProfile {
  const normalized = normalizeName(name);

  return {
    length: countNameLength(normalized),
    repeatedTone: hasRepeatedTone(normalized),
    softTone: hasSoftTone(normalized),
    strongTone: hasStrongTone(normalized),
    endsSoft: endsWithSoftTone(normalized),
    brightVowel: hasBrightVowel(normalized),
  };
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

function buildNameEnergyFromPattern(
  petName: string,
  pattern: NamePatternProfile
) {
  if (pattern.repeatedTone && pattern.length <= 2) {
    return `${petName}는 리듬감이 살아 있는 교감형 이름`;
  }

  if (pattern.softTone && pattern.endsSoft) {
    return `${petName}는 부드럽고 편안한 인상을 주는 이름`;
  }

  if (pattern.strongTone) {
    return `${petName}는 또렷하고 존재감이 선명한 이름`;
  }

  if (pattern.brightVowel) {
    return `${petName}는 밝고 반응성이 좋은 느낌을 주는 이름`;
  }

  return `${petName}는 균형감 있고 안정적인 느낌의 이름`;
}

function buildPatternSummaryLine(
  petName: string,
  petType: PetType,
  ageStageLabel: string,
  pattern: NamePatternProfile
) {
  const speciesText = petType === "cat" ? "고양이" : "강아지";

  const rhythmText = pattern.repeatedTone
    ? "반복감 있는 음 구조가 있어서"
    : pattern.softTone
    ? "부드러운 발음 흐름이 살아 있어서"
    : pattern.strongTone
    ? "짧고 또렷한 소리감이 남아서"
    : "무난한 리듬과 안정적인 구조를 가져서";

  const lengthText =
    pattern.length <= 2
      ? "부를 때 반응 연결이 빠른 편이고"
      : "부를수록 이름의 인상이 천천히 깊어지는 편이고";

  return `${petName}라는 이름은 ${speciesText}에게 붙였을 때 ${rhythmText} ${lengthText} ${ageStageLabel} 시기의 호흡과도 잘 연결될 가능성이 있어요.`;
}

function buildFirstImpressionAddon(
  pattern: NamePatternProfile,
  petGender: string
) {
  const lines: string[] = [];

  if (pattern.softTone) {
    lines.push("이름에서 느껴지는 결이 부드러워 처음 들었을 때 친근한 인상을 주기 쉬워요.");
  } else if (pattern.strongTone) {
    lines.push("짧게 불러도 소리가 또렷하게 남아 존재감이 있는 첫인상을 만들 수 있어요.");
  } else {
    lines.push("과하지 않으면서도 편안하게 기억되는 첫인상을 만드는 이름이에요.");
  }

  if (petGender === "female") {
    lines.push("전체적으로 다정하고 섬세한 분위기로 읽히기 쉬운 흐름이 있어요.");
  } else {
    lines.push("부를 때 반응의 선이 분명하게 느껴질 가능성이 있어요.");
  }

  return lines.join(" ");
}

function buildHiddenCharmAddon(
  petName: string,
  pattern: NamePatternProfile,
  ageStage: AgeStage
) {
  const lines: string[] = [];

  if (pattern.repeatedTone) {
    lines.push(
      `${petName}는 반복되는 소리 덕분에 애칭처럼 자연스럽게 스며드는 매력이 있어요.`
    );
  }

  if (pattern.endsSoft) {
    lines.push("끝음이 부드러워 가까운 관계일수록 따뜻한 인상이 더 살아날 수 있어요.");
  }

  if (ageStage === "baby") {
    lines.push("어린 시기에는 이런 리듬감이 보호자와의 교감 형성에도 꽤 긍정적으로 작용할 수 있어요.");
  } else if (ageStage === "adult") {
    lines.push("시간이 지나도 질리지 않고 안정적으로 어울리는 힘이 있는 이름에 가까워요.");
  }

  return lines.join(" ");
}

function buildRelationshipAddon(
  petType: PetType,
  pattern: NamePatternProfile
) {
  const lines: string[] = [];

  if (petType === "cat") {
    lines.push(
      "고양이처럼 스스로 관계 템포를 정하는 아이에게도 과하게 밀지 않는 이름의 결이 중요해요."
    );
  } else {
    lines.push(
      "강아지처럼 이름 반응과 교감 리듬이 중요한 아이에게는 부르기 쉬운 소리감이 특히 중요해요."
    );
  }

  if (pattern.length <= 2) {
    lines.push("짧은 이름일수록 일상 호출에서 반응 타이밍을 맞추기 쉬운 장점이 있어요.");
  } else {
    lines.push("조금 더 긴 이름은 부르는 방식에 따라 인상의 온도를 다양하게 만들 수 있어요.");
  }

  return lines.join(" ");
}

function buildLuckyPointAddon(pattern: NamePatternProfile) {
  const lines: string[] = [];

  if (pattern.repeatedTone) {
    lines.push("반복음 덕분에 교감과 애칭 확장이 자연스럽다는 점이 가장 큰 장점이에요.");
  } else if (pattern.softTone) {
    lines.push("부드러운 발음 덕분에 가까운 관계 안에서 편안함을 주기 쉬운 이름이에요.");
  } else if (pattern.strongTone) {
    lines.push("짧고 선명한 소리 덕분에 존재감과 호출감이 분명한 편이에요.");
  } else {
    lines.push("균형감 있는 구조라 오래 불러도 부담이 적고 자연스럽게 스며드는 편이에요.");
  }

  if (pattern.brightVowel) {
    lines.push("밝은 모음이 살아 있어 전체 분위기를 산뜻하게 끌어올리는 장점도 있어요.");
  }

  return lines.join(" ");
}

function buildNamingTipAddon(
  petType: PetType,
  ageStage: AgeStage,
  pattern: NamePatternProfile
) {
  const lines: string[] = [];

  if (petType === "cat") {
    lines.push(
      "고양이는 이름을 부르는 톤의 편안함을 중요하게 느끼는 경우가 많아, 낮고 부드러운 리듬으로 반복해주는 것이 좋아요."
    );
  } else {
    lines.push(
      "강아지는 이름과 보호자의 반응을 함께 기억하는 편이라, 같은 톤으로 일관되게 불러주는 것이 좋아요."
    );
  }

  if (ageStage === "baby") {
    lines.push("어린 시기에는 애칭을 자주 바꾸기보다 한 가지 리듬을 꾸준히 익히게 해주는 편이 좋아요.");
  } else if (ageStage === "senior") {
    lines.push("시니어 시기에는 급한 호출보다 익숙하고 편안한 톤으로 이름을 불러주는 것이 안정감에 도움이 될 수 있어요.");
  } else {
    lines.push("좋은 경험이나 칭찬과 함께 이름을 연결해주면 반응의 질이 더 좋아질 수 있어요.");
  }

  if (pattern.repeatedTone) {
    lines.push("반복음 이름은 애칭으로 자연스럽게 확장되기 쉬워 활용도가 높은 편이에요.");
  } else if (pattern.endsSoft) {
    lines.push("끝음이 부드러워 가까운 상황에서 다정한 애칭으로 응용해도 어색하지 않아요.");
  }

  return lines.join(" ");
}

export function generateNamingAnalysis(input: {
  petName: string;
  petType: string;
  petGender: string;
  birthDate: string;
}) {
  const petType = (input.petType === "cat" ? "cat" : "dog") as PetType;
  const petName = normalizeName(input.petName);
  const pattern = analyzeNamePattern(petName);
  const ageMonths = getAgeMonths(input.birthDate);
  const ageStage = getAgeStage(ageMonths);
  const ageStageLabel = getAgeStageLabel(ageStage, petType);

  const seed = hashString(
    [
      petName,
      petType,
      input.petGender,
      input.birthDate,
      pattern.length,
      pattern.repeatedTone ? "1" : "0",
      pattern.softTone ? "1" : "0",
      pattern.strongTone ? "1" : "0",
      pattern.endsSoft ? "1" : "0",
      pattern.brightVowel ? "1" : "0",
      ageStage,
    ].join("|")
  );

  const historyKey = `naming|${petName}|${petType}|${input.petGender}`;
  const recent = getRecentPremiumTexts(historyKey, 8);

  const baseNameEnergyPool = Array.from(
    new Set([buildNameEnergyFromPattern(petName, pattern), ...nameEnergyPool])
  );

  const nameEnergy = pickAvoidRecent(
    baseNameEnergyPool,
    seed,
    recent,
    petName
  );
  const nameEnergyDesc = pickAvoidRecent(nameEnergyDescPool, seed + 1, recent);
  const summaryIntro = pickAvoidRecent(
    summaryIntroPool,
    seed + 2,
    recent,
    petName
  );
  const summaryFlow = pickAvoidRecent(
    summaryFlowPool,
    seed + 3,
    recent,
    petName
  );
  const summaryAdvice = pickAvoidRecent(
    summaryAdvicePool,
    seed + 4,
    recent,
    petName
  );

  const patternSummaryLine = buildPatternSummaryLine(
    petName,
    petType,
    ageStageLabel,
    pattern
  );

  const firstImpressionAddon = buildFirstImpressionAddon(
    pattern,
    input.petGender
  );
  const hiddenCharmAddon = buildHiddenCharmAddon(
    petName,
    pattern,
    ageStage
  );
  const relationshipAddon = buildRelationshipAddon(petType, pattern);
  const luckyPointAddon = buildLuckyPointAddon(pattern);
  const namingTipAddon = buildNamingTipAddon(petType, ageStage, pattern);

  const result = {
    petName,
    nameEnergy,
    summary: `${summaryIntro} ${summaryFlow} ${patternSummaryLine} ${summaryAdvice}`,
    firstImpression: `${pickAvoidRecent(
      firstImpressionPool,
      seed + 5,
      recent,
      petName
    )} ${nameEnergyDesc} ${firstImpressionAddon}`,
    hiddenCharm: `${pickAvoidRecent(
      hiddenCharmPool,
      seed + 6,
      recent,
      petName
    )} ${hiddenCharmAddon}`,
    relationshipFlow: `${pickAvoidRecent(
      relationshipFlowPool,
      seed + 7,
      recent,
      petName
    )} ${relationshipAddon}`,
    luckyPoint: `${pickAvoidRecent(
      luckyPointPool,
      seed + 8,
      recent,
      petName
    )} ${luckyPointAddon}`,
    namingTip: `${pickAvoidRecent(
      namingTipPool,
      seed + 9,
      recent,
      petName
    )} ${namingTipAddon}`,
  };

  saveRecentPremiumTexts(historyKey, [
    result.summary,
    result.firstImpression,
    result.hiddenCharm,
    result.relationshipFlow,
    result.luckyPoint,
    result.namingTip,
  ]);

  return result;
}