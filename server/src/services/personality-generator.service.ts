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
  const seed = hashString(
    [
      input.petId,
      input.petName,
      input.petType,
      input.petGender,
      input.isNeutered ? "1" : "0",
      input.breed,
      input.birthDate,
      input.birthTime,
    ].join("|")
  );

  const historyKey = `personality|${input.petId}`;
  const recent = getRecentPremiumTexts(historyKey, 8);

  const coreType = pickAvoidRecent(coreTypePool, seed, recent);
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

  const result = {
    petId: input.petId,
    petName: input.petName,
    coreType,
    summary: `${summaryIntro} ${summaryFlow} ${summaryAdvice}`,
    personality: `${pickAvoidRecent(
      personalityPool,
      seed + 5,
      recent,
      input.petName
    )} ${coreTypeDesc}`,
    emotionStyle: pickAvoidRecent(
      emotionStylePool,
      seed + 6,
      recent,
      input.petName
    ),
    socialStyle: pickAvoidRecent(
      socialStylePool,
      seed + 7,
      recent,
      input.petName
    ),
    stressPoint: pickAvoidRecent(
      stressPointPool,
      seed + 8,
      recent,
      input.petName
    ),
    bondStyle: pickAvoidRecent(
      bondStylePool,
      seed + 9,
      recent,
      input.petName
    ),
    careTip: pickAvoidRecent(careTipPool, seed + 10, recent, input.petName),
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