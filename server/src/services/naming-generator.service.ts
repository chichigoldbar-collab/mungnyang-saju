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

export function generateNamingAnalysis(input: {
  petName: string;
  petType: string;
  petGender: string;
  birthDate: string;
}) {
  const seed = hashString(
    [input.petName, input.petType, input.petGender, input.birthDate].join("|")
  );

  const historyKey = `naming|${input.petName}|${input.petType}|${input.petGender}`;
  const recent = getRecentPremiumTexts(historyKey, 8);

  const nameEnergy = pickAvoidRecent(
    nameEnergyPool,
    seed,
    recent,
    input.petName
  );
  const nameEnergyDesc = pickAvoidRecent(nameEnergyDescPool, seed + 1, recent);
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
    petName: input.petName,
    nameEnergy,
    summary: `${summaryIntro} ${summaryFlow} ${summaryAdvice}`,
    firstImpression: `${pickAvoidRecent(
      firstImpressionPool,
      seed + 5,
      recent,
      input.petName
    )} ${nameEnergyDesc}`,
    hiddenCharm: pickAvoidRecent(
      hiddenCharmPool,
      seed + 6,
      recent,
      input.petName
    ),
    relationshipFlow: pickAvoidRecent(
      relationshipFlowPool,
      seed + 7,
      recent,
      input.petName
    ),
    luckyPoint: pickAvoidRecent(
      luckyPointPool,
      seed + 8,
      recent,
      input.petName
    ),
    namingTip: pickAvoidRecent(
      namingTipPool,
      seed + 9,
      recent,
      input.petName
    ),
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