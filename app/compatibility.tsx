import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

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

function getCompatibilityData(
  petType: PetType,
  petGender: PetGender,
  isNeutered: boolean
) {
  if (petType === "dog") {
    if (petGender === "female") {
      return {
        score: 91,
        title: "다정한 애착형 궁합",
        summary:
          "서로의 반응을 잘 읽고 감정 교류가 빠르게 만들어지는 조합이에요. 사랑받는 느낌을 주는 보호자와 특히 잘 맞아요.",
        strengths: [
          "보호자의 말투와 분위기에 잘 반응하며 정서적 교감이 빨라요.",
          "칭찬, 쓰다듬기, 눈맞춤 같은 작은 애정 표현이 관계를 크게 키워줘요.",
          "익숙한 루틴 안에서 보호자와 함께하는 시간을 특히 좋아할 가능성이 커요.",
        ],
        cautions: [
          "예민한 날에는 과한 장난이나 반복된 반응 요구가 부담이 될 수 있어요.",
          "분위기가 어수선하면 애교보다 예민함이 먼저 올라올 수 있어요.",
        ],
        tips: isNeutered
          ? [
              "편안한 루틴을 유지해주면 신뢰감이 더 깊어져요.",
              "짧고 부드러운 교감이 오래 가는 안정감을 만들어줘요.",
            ]
          : [
              "사랑스럽다고 계속 몰아붙이기보다 반응의 템포를 맞춰주세요.",
              "기분이 좋을 때 놀아주고, 피곤한 신호가 보이면 바로 쉬게 해주세요.",
            ],
      };
    }

    return {
      score: 88,
      title: "에너지 교류형 궁합",
      summary:
        "함께 반응하고 움직일수록 가까워지는 조합이에요. 리액션이 분명한 보호자와 특히 잘 맞는 흐름이에요.",
      strengths: [
        "칭찬, 놀이, 산책 같은 활동성 있는 교감에서 관계가 빠르게 깊어질 수 있어요.",
        "보호자의 반응이 좋을수록 자신감과 애정 표현이 함께 살아날 수 있어요.",
        "함께 무언가를 하는 시간이 많을수록 신뢰가 잘 쌓여요.",
      ],
      cautions: [
        "흥분이 너무 길어지면 집중이 흐트러지거나 예민해질 수 있어요.",
        "재미있는 상황이 많을수록 쉬는 타이밍도 함께 챙겨줘야 해요.",
      ],
      tips: isNeutered
        ? [
            "짧고 규칙적인 놀이가 관계를 안정적으로 만들어줘요.",
            "보호자가 리듬을 잡아주면 훨씬 편안한 관계가 돼요.",
          ]
        : [
            "신났을 때 브레이크 역할을 해주는 보호자일수록 궁합이 좋아요.",
            "놀아줄 때와 쉬게 할 때의 기준을 분명하게 주면 더 안정돼요.",
          ],
    };
  }

  if (petGender === "female") {
    return {
      score: 90,
      title: "섬세한 신뢰형 궁합",
      summary:
        "강한 자극보다 조용한 안정감 속에서 관계가 깊어지는 조합이에요. 배려형 보호자와 특히 잘 맞아요.",
      strengths: [
        "억지로 다가오기보다 기다려주는 보호자에게 마음을 더 잘 열어요.",
        "관계가 깊어질수록 은근하고 조용한 애정 표현이 많아질 수 있어요.",
        "편안한 공간과 예측 가능한 루틴 속에서 신뢰가 단단해져요.",
      ],
      cautions: [
        "갑작스러운 터치, 큰 소리, 과한 관심은 스트레스로 느껴질 수 있어요.",
        "불편함이 생기면 감정을 바로 표현하지 않고 거리부터 둘 수 있어요.",
      ],
      tips: isNeutered
        ? [
            "조용히 곁에 있어주는 방식이 큰 안정감을 줘요.",
            "자기만의 공간과 쉬는 시간을 존중해주면 관계가 더 편안해져요.",
          ]
        : [
            "먼저 다가오길 기다려주는 태도가 중요해요.",
            "좋아하는 것과 싫어하는 것을 빨리 읽어주는 보호자와 잘 맞아요.",
          ],
    };
  }

  return {
    score: 86,
    title: "거리 존중형 궁합",
    summary:
      "천천히 가까워질수록 더 오래 가는 관계예요. 적당한 거리와 선택권을 존중해주는 보호자와 잘 맞아요.",
    strengths: [
      "조용한 동행, 안정적인 존재감, 무리 없는 교감에서 신뢰가 잘 생겨요.",
      "보호자가 감정을 크게 흔들지 않을수록 마음을 편하게 열 수 있어요.",
      "자기 페이스를 존중받는 관계에서 은근한 애정 표현이 살아나요.",
    ],
    cautions: [
      "과한 접촉이나 반복된 관심 요구는 피로하게 느껴질 수 있어요.",
      "불편한 환경에서는 관계보다 회피가 먼저 나올 수 있어요.",
    ],
    tips: isNeutered
      ? [
          "익숙한 시간대, 익숙한 자리, 익숙한 방식이 가장 잘 맞아요.",
          "조용히 함께 있어주는 시간이 관계를 안정적으로 만들어줘요.",
        ]
      : [
          "눈치 빠르게 다가가기보다 반응을 보고 천천히 교감해 주세요.",
          "스스로 다가오는 순간을 놓치지 않고 받아주는 게 중요해요.",
        ],
  };
}

export default function CompatibilityScreen() {
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

  const compatibility = getCompatibilityData(petType, petGender, isNeutered);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>COMPATIBILITY</Text>
        </View>

        <Text style={styles.heroTitle}>보호자와의 궁합 💞</Text>
        <Text style={styles.heroSubtitle}>
          우리 아이가 보호자와 어떤 방식으로 가장 편안하고 잘 맞는지 정리했어요.
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
        <Text style={styles.sectionTitle}>궁합 점수</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreNumber}>{compatibility.score}</Text>
          <Text style={styles.scoreSuffix}>점</Text>
        </View>

        <Text style={styles.compatibilityTitle}>{compatibility.title}</Text>
        <Text style={styles.compatibilitySummary}>
          {compatibility.summary}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>잘 맞는 포인트</Text>

        {compatibility.strengths.map((item, index) => (
          <View key={index} style={styles.infoCard}>
            <Text style={styles.infoTitle}>강점 {index + 1}</Text>
            <Text style={styles.infoDesc}>{item}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>조심하면 좋은 포인트</Text>

        {compatibility.cautions.map((item, index) => (
          <View key={index} style={styles.cautionCard}>
            <Text style={styles.cautionTitle}>주의 {index + 1}</Text>
            <Text style={styles.cautionDesc}>{item}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>관계 팁</Text>

        {compatibility.tips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipIndex}>{index + 1}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton
          title="결과 화면으로 돌아가기"
          onPress={() => router.back()}
          variant="outline"
        />
        <AppButton
          title="홈으로 돌아가기"
          onPress={() => router.replace("/home")}
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
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: COLORS.accentSoft,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 52,
  },
  scoreSuffix: {
    marginLeft: 4,
    marginBottom: 6,
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  compatibilityTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },
  compatibilitySummary: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  infoDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  cautionCard: {
    backgroundColor: "#FFF3F0",
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  cautionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#A0523D",
  },
  cautionDesc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  tipIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.text,
    overflow: "hidden",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.subText,
  },
  buttonGroup: {
    gap: 10,
  },
});