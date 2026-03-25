import actionPool from "../data/fortune/actions.json";
import appetitePool from "../data/fortune/appetite.json";
import cautionPool from "../data/fortune/caution.json";
import healthPool from "../data/fortune/health.json";
import luckyColorPool from "../data/fortune/lucky-colors.json";
import luckyItemPool from "../data/fortune/lucky-items.json";
import moodPool from "../data/fortune/mood.json";
import summaryAdvicePool from "../data/fortune/summary-advice.json";
import summaryFlowPool from "../data/fortune/summary-flow.json";
import summaryIntroPool from "../data/fortune/summary-intro.json";

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function replacePetName(text: string, petName: string) {
  return text.split("{petName}").join(petName);
}

function pickAvoidRecent(
  items: string[],
  seed: number,
  recentValues: string[],
  petName?: string
) {
  const normalizedRecent = new Set(recentValues);
  const rotated = [...items].sort((a, b) => {
    const aScore = hashString(`${a}|${seed}`);
    const bScore = hashString(`${b}|${seed}`);
    return aScore - bScore;
  });

  const candidate =
    rotated.find((item) => {
      const value = petName ? replacePetName(item, petName) : item;
      return !normalizedRecent.has(value);
    }) ?? rotated[0];

  return petName ? replacePetName(candidate, petName) : candidate;
}

function buildDetailedSummary(
  petName: string,
  seed: number,
  recentSummaries: string[]
) {
  const intro = pickAvoidRecent(summaryIntroPool, seed, recentSummaries, petName);
  const flow = pickAvoidRecent(summaryFlowPool, seed + 1, recentSummaries, petName);
  const advice = pickAvoidRecent(summaryAdvicePool, seed + 2, recentSummaries, petName);

  return `${intro} ${flow} ${advice}`;
}

type GenerateFortuneInput = {
  petId: string;
  petName: string;
  petType: string;
  petGender: string;
  isNeutered: boolean;
  breed: string;
  birthDate: string;
  birthTime: string;
  dateKey: string;
  recentHistory?: Array<{
    summary: string;
    health: string;
    appetite: string;
    mood: string;
    caution: string;
    luckyColor: string;
    luckyItem: string;
    recommendedAction: string;
  }>;
};

export function generateFortune(input: GenerateFortuneInput) {
  const seed = hashString(
    `${input.petId}|${input.petName}|${input.petType}|${input.petGender}|${input.isNeutered}|${input.breed}|${input.birthDate}|${input.birthTime}|${input.dateKey}`
  );

  const recentHistory = input.recentHistory ?? [];

  const recentSummaries = recentHistory.map((item) => item.summary);
  const recentHealth = recentHistory.map((item) => item.health);
  const recentAppetite = recentHistory.map((item) => item.appetite);
  const recentMood = recentHistory.map((item) => item.mood);
  const recentCaution = recentHistory.map((item) => item.caution);
  const recentLuckyColor = recentHistory.map((item) => item.luckyColor);
  const recentLuckyItem = recentHistory.map((item) => item.luckyItem);
  const recentAction = recentHistory.map((item) => item.recommendedAction);

  return {
    petId: input.petId,
    dateKey: input.dateKey,
    petName: input.petName,
    petType: input.petType,
    petGender: input.petGender,
    isNeutered: input.isNeutered,
    breed: input.breed,
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    summary: buildDetailedSummary(input.petName, seed, recentSummaries),
    health: pickAvoidRecent(healthPool, seed + 3, recentHealth),
    appetite: pickAvoidRecent(appetitePool, seed + 4, recentAppetite),
    mood: pickAvoidRecent(moodPool, seed + 5, recentMood),
    caution: pickAvoidRecent(cautionPool, seed + 6, recentCaution),
    luckyColor: pickAvoidRecent(luckyColorPool, seed + 7, recentLuckyColor),
    luckyItem: pickAvoidRecent(luckyItemPool, seed + 8, recentLuckyItem),
    recommendedAction: pickAvoidRecent(actionPool, seed + 9, recentAction),
  };
}