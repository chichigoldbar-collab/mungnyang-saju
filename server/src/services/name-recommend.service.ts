import { NameCandidate, NameKind, NameStyle } from "../types/names";
import { getRecentNames, saveRecentNames } from "./name-history.service";

// 기본 데이터
import animationData from "../data/names/animation.json";
import artData from "../data/names/art.json";
import koreanCultureData from "../data/names/korean-culture.json";
import literatureData from "../data/names/literature.json";
import meaningData from "../data/names/meaning.json";
import mythData from "../data/names/myth.json";
import natureData from "../data/names/nature.json";

// 확장 데이터
import animationExtraData from "../data/names/animation-extra.json";
import artExtraData from "../data/names/art-extra.json";
import koreanCultureExtraData from "../data/names/korean-culture-extra.json";
import literatureExtraData from "../data/names/literature-extra.json";
import meaningExtraData from "../data/names/meaning-extra.json";
import mythExtraData from "../data/names/myth-extra.json";
import natureExtraData from "../data/names/nature-extra.json";

// 캐스팅
const animationDataset = animationData as NameCandidate[];
const artDataset = artData as NameCandidate[];
const mythDataset = mythData as NameCandidate[];
const meaningDataset = meaningData as NameCandidate[];
const koreanCultureDataset = koreanCultureData as NameCandidate[];
const literatureDataset = literatureData as NameCandidate[];
const natureDataset = natureData as NameCandidate[];

const animationExtraDataset = animationExtraData as NameCandidate[];
const artExtraDataset = artExtraData as NameCandidate[];
const mythExtraDataset = mythExtraData as NameCandidate[];
const meaningExtraDataset = meaningExtraData as NameCandidate[];
const koreanCultureExtraDataset = koreanCultureExtraData as NameCandidate[];
const literatureExtraDataset = literatureExtraData as NameCandidate[];
const natureExtraDataset = natureExtraData as NameCandidate[];

// 중복 제거
function uniqueById(items: NameCandidate[]) {
  const map = new Map<string, NameCandidate>();
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

// kind별 데이터 구성
function getNameDataByKind(kind: NameKind): NameCandidate[] {
  switch (kind) {
    case "animation":
      return uniqueById([
        ...animationDataset,
        ...animationExtraDataset,
        ...literatureDataset,
        ...literatureExtraDataset,
      ]);

    case "art":
      return uniqueById([...artDataset, ...artExtraDataset]);

    case "myth":
      return uniqueById([
        ...mythDataset,
        ...mythExtraDataset,
        ...koreanCultureDataset,
        ...koreanCultureExtraDataset,
      ]);

    case "meaning":
      return uniqueById([
        ...meaningDataset,
        ...meaningExtraDataset,
        ...natureDataset,
        ...natureExtraDataset,
        ...koreanCultureDataset,
        ...koreanCultureExtraDataset,
      ]);

    default:
      return [];
  }
}

// 필터링
function filterCandidates(
  items: NameCandidate[],
  petType: string,
  gender: string,
  style: NameStyle
) {
  return items.filter((item) => {
    const typeMatch =
      item.petTypes.includes("all") || item.petTypes.includes(petType as any);

    const genderMatch =
      item.genders.includes("all") || item.genders.includes(gender as any);

    const styleMatch = item.moodTags.includes(style);

    return typeMatch && genderMatch && styleMatch;
  });
}

// 셔플
function shuffle<T>(array: T[]) {
  return [...array].sort(() => Math.random() - 0.5);
}

// 핵심 함수
export async function getRecommendedNames(params: {
  petType: string;
  gender: string;
  kind: NameKind;
  style: NameStyle;
  limit: number;
}) {
  const { petType, gender, kind, style, limit } = params;

  // 1. 전체 데이터 가져오기
  const dataset = getNameDataByKind(kind);

  // 2. 필터링
  let filtered = filterCandidates(dataset, petType, gender, style);

  // 3. fallback (데이터 부족 시 스타일 무시)
  if (filtered.length < limit) {
    filtered = dataset.filter((item) => {
      const typeMatch =
        item.petTypes.includes("all") ||
        item.petTypes.includes(petType as any);

      const genderMatch =
        item.genders.includes("all") ||
        item.genders.includes(gender as any);

      return typeMatch && genderMatch;
    });
  }

  // 4. 최근 추천 회피
  const historyKey = `${kind}_${style}_${petType}_${gender}`;
  const recent = await getRecentNames(historyKey);

  let candidates = filtered.filter(
    (item) => !recent.includes(item.name)
  );

  // 5. 그래도 부족하면 전체 허용
  if (candidates.length < limit) {
    candidates = filtered;
  }

  // 6. 랜덤 섞기
  const shuffled = shuffle(candidates);

  // 7. limit만큼 선택
  const selected = shuffled.slice(0, limit);

  // 8. 히스토리 저장
  await saveRecentNames(
    historyKey,
    selected.map((item) => item.name)
  );

  // 9. 클라이언트용 변환
  return selected.map((item) => ({
    name: item.name,
    source: item.source,
    meaning: item.meaning,
    story: item.story,
    tags: item.moodTags,
  }));
}