import cautionPool from "../data/compatibility/caution.json";
import chemistryPool from "../data/compatibility/chemistry.json";
import strengthPool from "../data/compatibility/strength.json";
import summaryAdvicePool from "../data/compatibility/summary-advice.json";
import summaryFlowPool from "../data/compatibility/summary-flow.json";
import summaryIntroPool from "../data/compatibility/summary-intro.json";
import tipPool from "../data/compatibility/tip.json";

type CompatibilityHistoryItem = {
  summary: string;
  chemistry: string;
  strength: string;
  caution: string;
  tip: string;
};

const compatibilityHistoryMap = new Map<string, CompatibilityHistoryItem[]>();

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

function getScore(seed: number) {
  return 60 + (seed % 41);
}

function getGrade(score: number) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  return "C";
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

function buildDetailedSummary(
  petName: string,
  seed: number,
  recentSummaries: string[]
) {
  const intro = pickAvoidRecent(summaryIntroPool, seed, recentSummaries, petName);
  const flow = pickAvoidRecent(summaryFlowPool, seed + 1, recentSummaries, petName);
  const advice = pickAvoidRecent(
    summaryAdvicePool,
    seed + 2,
    recentSummaries,
    petName
  );

  return `${intro} ${flow} ${advice}`;
}

function getHistoryKey(input: {
  petName: string;
  petType: string;
  ownerName: string;
  ownerBirthDate: string;
}) {
  return `${input.petName}|${input.petType}|${input.ownerName}|${input.ownerBirthDate}`;
}

export function generateCompatibility(input: {
  petName: string;
  petType: string;
  ownerName: string;
  ownerBirthDate: string;
}) {
  const dateKey = new Date().toISOString().slice(0, 10);

  const seed = hashString(
    `${input.petName}|${input.petType}|${input.ownerName}|${input.ownerBirthDate}|${dateKey}`
  );

  const score = getScore(seed);
  const grade = getGrade(score);

  const historyKey = getHistoryKey(input);
  const recentHistory = compatibilityHistoryMap.get(historyKey) ?? [];

  const recentSummaries = recentHistory.map((item) => item.summary);
  const recentChemistry = recentHistory.map((item) => item.chemistry);
  const recentStrength = recentHistory.map((item) => item.strength);
  const recentCaution = recentHistory.map((item) => item.caution);
  const recentTip = recentHistory.map((item) => item.tip);

  const summary = buildDetailedSummary(input.petName, seed, recentSummaries);
  const chemistry = pickAvoidRecent(
    chemistryPool,
    seed + 3,
    recentChemistry,
    input.petName
  );
  const strength = pickAvoidRecent(strengthPool, seed + 4, recentStrength);
  const caution = pickAvoidRecent(cautionPool, seed + 5, recentCaution);
  const tip = pickAvoidRecent(tipPool, seed + 6, recentTip);

  const result = {
    score,
    grade,
    summary,
    chemistry,
    strength,
    caution,
    tip,
  };

  const nextHistory = [...recentHistory, result].slice(-7);
  compatibilityHistoryMap.set(historyKey, nextHistory);

  return result;
}