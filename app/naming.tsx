import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

const CHOSEONG = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const JUNGSEONG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];

const JONGSEONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

function getPetVisual(petType: PetType, breed: string) {
  const lower = breed.toLowerCase();

  if (petType === "dog") {
    if (lower.includes("말티즈")) return "🐶";
    if (lower.includes("포메")) return "🐕";
    if (lower.includes("푸들")) return "🐩";
    if (lower.includes("시츄")) return "🐶";
    if (lower.includes("리트리버")) return "🦮";
    if (lower.includes("웰시")) return "🐕‍🦺";
    return "🐶";
  }

  if (petType === "cat") {
    if (lower.includes("코숏")) return "🐱";
    if (lower.includes("페르시안")) return "🐈";
    if (lower.includes("러시안")) return "🐈‍⬛";
    if (lower.includes("먼치킨")) return "🐱";
    if (lower.includes("스핑크스")) return "🐈";
    return "🐱";
  }

  return "🐾";
}

function calculateAge(birthDate: string) {
  const onlyNumbers = birthDate.replace(/\D/g, "");

  if (onlyNumbers.length !== 8) {
    return "나이 미확인";
  }

  const year = Number(onlyNumbers.slice(0, 4));
  const month = Number(onlyNumbers.slice(4, 6));
  const day = Number(onlyNumbers.slice(6, 8));

  const today = new Date();
  let age = today.getFullYear() - year;

  const hasNotHadBirthdayYet =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day);

  if (hasNotHadBirthdayYet) {
    age -= 1;
  }

  if (age < 0) {
    return "나이 미확인";
  }

  return `${age}살`;
}

function isHangulSyllable(char: string) {
  const code = char.charCodeAt(0);
  return code >= 0xac00 && code <= 0xd7a3;
}

function decomposeHangul(char: string) {
  if (!isHangulSyllable(char)) {
    return null;
  }

  const code = char.charCodeAt(0) - 0xac00;
  const choseongIndex = Math.floor(code / 588);
  const jungseongIndex = Math.floor((code % 588) / 28);
  const jongseongIndex = code % 28;

  return {
    choseong: CHOSEONG[choseongIndex],
    jungseong: JUNGSEONG[jungseongIndex],
    jongseong: JONGSEONG[jongseongIndex],
  };
}

function sanitizeName(name: string) {
  return name.replace(/\s+/g, "").trim();
}

function getNameSeed(name: string) {
  const clean = sanitizeName(name);
  return clean.split("").reduce((acc, ch, idx) => {
    return acc + ch.charCodeAt(0) * (idx + 1);
  }, 0);
}

function getLastSyllableInfo(name: string) {
  const clean = sanitizeName(name);
  const last = clean.charAt(clean.length - 1);
  return decomposeHangul(last);
}

function getFirstSyllableInfo(name: string) {
  const clean = sanitizeName(name);
  const first = clean.charAt(0);
  return decomposeHangul(first);
}

function getNameRhythmType(name: string) {
  const clean = sanitizeName(name);
  const length = clean.length;
  const last = getLastSyllableInfo(clean);

  if (length <= 2) {
    if (last?.jongseong) return "짧고 힘 있는 리듬";
    return "짧고 부드러운 리듬";
  }

  if (length === 3) {
    if (last?.jongseong) return "균형감 있는 또렷한 리듬";
    return "부드럽게 이어지는 안정적인 리듬";
  }

  return "개성이 강하게 살아나는 긴 리듬";
}

function getVowelMood(vowel?: string) {
  if (!vowel) {
    return {
      mood: "자유로운 이름 무드",
      desc: "한글 음절 분석이 어려운 이름이라 전체 인상과 발음의 흐름 중심으로 보는 편이 좋아요.",
    };
  }

  if (["ㅏ", "ㅑ", "ㅗ", "ㅛ"].includes(vowel)) {
    return {
      mood: "밝고 바깥으로 열리는 무드",
      desc: "소리가 앞으로 뻗는 느낌이 있어 명랑하고 생기 있는 인상을 만들기 쉬워요.",
    };
  }

  if (["ㅓ", "ㅕ", "ㅜ", "ㅠ", "ㅡ"].includes(vowel)) {
    return {
      mood: "차분하고 깊이감 있는 무드",
      desc: "소리가 너무 가볍지 않아 안정감과 묵직한 매력을 함께 주는 편이에요.",
    };
  }

  return {
    mood: "부드럽고 맑은 무드",
    desc: "전체 발음이 깨끗하고 섬세하게 들려서 귀엽고 정돈된 인상을 만들기 좋아요.",
  };
}

function getEndingMood(jong?: string) {
  if (!jong) {
    return {
      title: "열린 끝소리",
      desc: "끝이 열려 있어 부를 때 부드럽고 애정 표현이 자연스럽게 붙는 느낌이 강해요.",
      score: 18,
    };
  }

  if (["ㄴ", "ㅁ", "ㅇ"].includes(jong)) {
    return {
      title: "포근한 끝소리",
      desc: "끝소리가 둥글게 마무리되어 안정감 있고 정감 있는 인상을 줘요.",
      score: 16,
    };
  }

  return {
    title: "또렷한 끝소리",
    desc: "마무리가 분명해 존재감이 살아나고 이름이 귀에 남기 쉬운 편이에요.",
    score: 14,
  };
}

function getChoseongMood(choseong?: string) {
  if (!choseong) {
    return {
      title: "개성형 첫소리",
      desc: "첫인상보다 전체 발음 흐름으로 매력을 만드는 이름이에요.",
      score: 12,
    };
  }

  if (["ㅁ", "ㄴ", "ㅇ", "ㅎ"].includes(choseong)) {
    return {
      title: "부드러운 첫인상",
      desc: "이름을 처음 들었을 때 둥글고 편안한 느낌을 주기 쉬워요.",
      score: 17,
    };
  }

  if (["ㄱ", "ㄷ", "ㅂ", "ㅈ"].includes(choseong)) {
    return {
      title: "또렷한 첫인상",
      desc: "짧게 불러도 인상이 분명해서 기억에 남기 쉬운 이름이에요.",
      score: 18,
    };
  }

  return {
    title: "개성 있는 첫인상",
    desc: "첫소리 자체에 캐릭터가 살아 있어 이름의 존재감이 잘 드러나는 편이에요.",
    score: 15,
  };
}

function getLengthMood(length: number) {
  if (length <= 2) {
    return {
      title: "짧고 반응 좋은 길이",
      desc: "짧은 이름은 부르기 쉽고 일상에서 자주 쓰기 좋아 반응 유도에 유리해요.",
      score: 19,
    };
  }

  if (length === 3) {
    return {
      title: "가장 안정적인 길이",
      desc: "너무 짧지도 길지도 않아 부드러움과 개성을 함께 챙기기 좋은 길이예요.",
      score: 18,
    };
  }

  return {
    title: "개성 강조형 길이",
    desc: "길이가 있는 만큼 이름 자체의 분위기와 캐릭터가 강하게 살아나요.",
    score: 14,
  };
}

function getSpeciesBonus(petType: PetType, petGender: PetGender, lastVowel?: string) {
  if (petType === "dog") {
    if (["ㅏ", "ㅑ", "ㅗ", "ㅛ"].includes(lastVowel || "")) return 8;
    return petGender === "female" ? 7 : 6;
  }

  if (["ㅣ", "ㅔ", "ㅐ", "ㅟ"].includes(lastVowel || "")) return 8;
  return petGender === "female" ? 7 : 6;
}

function getNameScore(name: string, petType: PetType, petGender: PetGender) {
  const clean = sanitizeName(name);
  const first = getFirstSyllableInfo(clean);
  const last = getLastSyllableInfo(clean);

  const choseongMood = getChoseongMood(first?.choseong);
  const endingMood = getEndingMood(last?.jongseong);
  const lengthMood = getLengthMood(clean.length);
  const speciesBonus = getSpeciesBonus(petType, petGender, last?.jungseong);

  let score =
    choseongMood.score +
    endingMood.score +
    lengthMood.score +
    speciesBonus +
    20;

  if (score > 98) score = 98;
  if (score < 72) score = 72;

  return score;
}

function getScoreComment(score: number) {
  if (score >= 92) {
    return "이름의 발음, 리듬, 인상이 아주 잘 맞는 편이에요.";
  }
  if (score >= 86) {
    return "전체적으로 잘 어울리는 이름이고 일상에서 부르기 좋은 흐름이에요.";
  }
  if (score >= 80) {
    return "무난하게 잘 어울리는 이름이에요. 개성도 어느 정도 살아 있어요.";
  }
  return "독특한 매력이 있는 이름이에요. 발음보다 개성 쪽이 강한 편이에요.";
}

function getRecommendedNames(
  petType: PetType,
  petGender: PetGender,
  currentName: string
) {
  const seed = getNameSeed(currentName);
  const dogFemale = ["보리", "하니", "모모", "라떼", "나나", "코미", "구름", "사랑"];
  const dogMale = ["콩이", "두부", "호두", "단이", "루이", "보노", "토토", "몽이"];
  const catFemale = ["모카", "루나", "설이", "나비", "로지", "코코", "치즈", "하루"];
  const catMale = ["밤이", "토리", "레오", "밀로", "탄이", "유자", "모리", "네로"];

  const source =
    petType === "dog"
      ? petGender === "female"
        ? dogFemale
        : dogMale
      : petGender === "female"
      ? catFemale
      : catMale;

  const start = seed % source.length;
  const ordered = [...source.slice(start), ...source.slice(0, start)];

  return ordered.filter((name) => name !== currentName).slice(0, 6);
}

function getDetailedNameReading(name: string, petType: PetType, petGender: PetGender) {
  const clean = sanitizeName(name);
  const first = getFirstSyllableInfo(clean);
  const last = getLastSyllableInfo(clean);

  const rhythm = getNameRhythmType(clean);
  const vowelMood = getVowelMood(last?.jungseong);
  const endingMood = getEndingMood(last?.jongseong);
  const choseongMood = getChoseongMood(first?.choseong);
  const lengthMood = getLengthMood(clean.length);
  const score = getNameScore(clean, petType, petGender);

  const styleSummary =
    petType === "dog"
      ? petGender === "female"
        ? "사랑스럽고 부드러운 느낌이 잘 살아나는 이름 스타일"
        : "밝고 반응성이 좋은 느낌이 잘 살아나는 이름 스타일"
      : petGender === "female"
      ? "우아하고 섬세한 분위기가 잘 살아나는 이름 스타일"
      : "차분하고 존재감 있는 느낌이 잘 살아나는 이름 스타일";

  return {
    score,
    scoreComment: getScoreComment(score),
    rhythm,
    styleSummary,
    firstImpression: choseongMood,
    vowelMood,
    endingMood,
    lengthMood,
    analysisPoint: `${clean.charAt(0)}로 시작하고 ${clean.charAt(clean.length - 1)}로 끝나는 흐름이 이름의 개성과 기억도를 만들어주는 핵심이에요.`,
  };
}

export default function NamingScreen() {
  const params = useLocalSearchParams();

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male") as PetGender;
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");
  const isNeutered = String(params.isNeutered ?? "false") === "true";

  const petEmoji = getPetVisual(petType, breed);
  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";
  const petGenderLabel = petGender === "female" ? "여아" : "남아";
  const petAge = calculateAge(birthDate);
  const neuteredLabel = isNeutered ? "중성화 완료" : "중성화 미완료";

  const nameReading = getDetailedNameReading(petName, petType, petGender);
  const recommendedNames = getRecommendedNames(petType, petGender, petName);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>NAMING</Text>
        </View>

        <Text style={styles.heroTitle}>작명 풀이 / 이름 추천 📝</Text>
        <Text style={styles.heroSubtitle}>
          이름의 발음, 길이, 끝소리, 첫인상까지 반영해서 우리 아이 이름을 분석했어요.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.petName}>
          {petEmoji} {petName} ({petAge})
        </Text>
        <Text style={styles.petMeta}>
          {petTypeLabel} · {breed}
        </Text>
        <Text style={styles.subText}>
          성별: {petGenderLabel} · {neuteredLabel}
        </Text>
        <Text style={styles.subText}>생일: {birthDate}</Text>
        <Text style={styles.subText}>태어난 시간: {birthTime}</Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>현재 이름 종합 점수</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>이름 적합도</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreNumber}>{nameReading.score}</Text>
            <Text style={styles.scoreSuffix}>점</Text>
          </View>
          <Text style={styles.scoreComment}>{nameReading.scoreComment}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>현재 이름 풀이</Text>

        <View style={styles.mainNameCard}>
          <Text style={styles.mainNameLabel}>현재 이름</Text>
          <Text style={styles.mainNameValue}>{petName}</Text>
          <Text style={styles.mainNameDesc}>
            {petName}라는 이름은 전체적으로{" "}
            <Text style={styles.boldText}>{nameReading.styleSummary}</Text>에
            가깝고, {nameReading.rhythm}을 가진 이름이에요.
          </Text>
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.readingTitle}>첫인상</Text>
          <Text style={styles.readingDesc}>
            <Text style={styles.boldText}>{nameReading.firstImpression.title}</Text>
            {"\n"}
            {nameReading.firstImpression.desc}
          </Text>
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.readingTitle}>이름 무드</Text>
          <Text style={styles.readingDesc}>
            <Text style={styles.boldText}>{nameReading.vowelMood.mood}</Text>
            {"\n"}
            {nameReading.vowelMood.desc}
          </Text>
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.readingTitle}>끝소리 인상</Text>
          <Text style={styles.readingDesc}>
            <Text style={styles.boldText}>{nameReading.endingMood.title}</Text>
            {"\n"}
            {nameReading.endingMood.desc}
          </Text>
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.readingTitle}>길이와 리듬</Text>
          <Text style={styles.readingDesc}>
            <Text style={styles.boldText}>{nameReading.lengthMood.title}</Text>
            {"\n"}
            {nameReading.lengthMood.desc}
          </Text>
        </View>

        <View style={styles.readingCard}>
          <Text style={styles.readingTitle}>핵심 분석 포인트</Text>
          <Text style={styles.readingDesc}>{nameReading.analysisPoint}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>추천 이름 후보</Text>

        <View style={styles.guideCard}>
          <Text style={styles.guideText}>
            현재 이름의 분위기와 반려동물 타입을 바탕으로, 발음이 좋고 부르기 쉬운 이름 위주로 추천했어요.
          </Text>
        </View>

        <View style={styles.nameGrid}>
          {recommendedNames.map((name) => {
            const score = getNameScore(name, petType, petGender);
            return (
              <View key={name} style={styles.nameChip}>
                <Text style={styles.nameChipText}>{name}</Text>
                <Text style={styles.nameChipScore}>{score}점</Text>
              </View>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>이름 추천 기준</Text>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>부르기 쉬운 흐름</Text>
          <Text style={styles.reasonDesc}>
            실제로 좋은 이름은 예쁜 것뿐 아니라 보호자가 매일 불렀을 때 입에 잘 붙고 자연스럽게 나오는 이름이에요.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>첫인상과 기억도</Text>
          <Text style={styles.reasonDesc}>
            첫소리가 또렷하거나 부드러우면 이름의 캐릭터가 더 분명해지고, 기억에도 잘 남는 편이에요.
          </Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>끝소리 안정감</Text>
          <Text style={styles.reasonDesc}>
            끝소리가 열려 있거나 둥글게 마무리되면 애정 표현과 잘 어울리고, 또렷하게 끊기면 존재감이 강해져요.
          </Text>
        </View>
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton
          title="보호자와의 궁합 보기"
          onPress={() =>
            router.push({
              pathname: "/compatibility" as const,
              params: {
                petName,
                petType,
                petGender,
                breed,
                birthDate,
                birthTime,
                isNeutered: isNeutered ? "true" : "false",
              },
            })
          }
        />

        <AppButton
          title="결과 화면으로 돌아가기"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
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
  petName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  petMeta: {
    marginTop: 4,
    color: COLORS.subText,
  },
  subText: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  scoreCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scoreNumber: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 46,
  },
  scoreSuffix: {
    marginLeft: 4,
    marginBottom: 5,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  scoreComment: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 22,
    textAlign: "center",
  },
  mainNameCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 20,
    padding: 18,
  },
  mainNameLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  mainNameValue: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.text,
  },
  mainNameDesc: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "800",
    color: COLORS.text,
  },
  readingCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  readingTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  readingDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  guideCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 16,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  nameGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  nameChip: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: 88,
    alignItems: "center",
  },
  nameChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  nameChipScore: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "700",
  },
  reasonCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  reasonTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  reasonDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  buttonGroup: {
    gap: 10,
  },
});