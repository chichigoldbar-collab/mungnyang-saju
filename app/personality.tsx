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

function getElementMood(petType: PetType, petGender: PetGender, isNeutered: boolean) {
  if (petType === "dog") {
    if (petGender === "female") {
      return isNeutered
        ? {
            element: "토(土)",
            title: "부드럽고 안정적인 흙의 기운",
            desc: "편안한 루틴과 익숙한 공간에서 마음이 가장 잘 열리는 타입이에요. 다정함과 섬세함이 함께 살아나는 편이에요.",
            color: "#F4E2A1",
          }
        : {
            element: "화(火)",
            title: "애정 표현이 강한 불의 기운",
            desc: "사랑받고 싶은 마음과 감정 표현이 풍부한 타입이에요. 반응을 잘 받아주면 더 밝고 따뜻하게 빛나요.",
            color: "#FFD2C7",
          };
    }

    return isNeutered
      ? {
          element: "금(金)",
          title: "균형감 있는 금의 기운",
          desc: "에너지가 있어도 자기 리듬을 어느 정도 지킬 줄 아는 편이에요. 규칙과 루틴이 잘 맞는 타입이에요.",
          color: "#EAEAEA",
        }
      : {
          element: "목(木)",
          title: "쑥쑥 뻗는 나무의 기운",
          desc: "호기심과 활동성이 강하고, 새로운 자극에 민감하게 반응해요. 재미있는 것에 마음이 빨리 움직이는 타입이에요.",
          color: "#D8F0D2",
        };
  }

  if (petGender === "female") {
    return isNeutered
      ? {
          element: "수(水)",
          title: "차분하고 깊은 물의 기운",
          desc: "감정이 섬세하고 분위기를 많이 읽는 타입이에요. 조용하고 편안한 환경에서 가장 안정감을 느껴요.",
          color: "#D9EAFE",
        }
      : {
          element: "금(金)",
          title: "예민하지만 우아한 금의 기운",
          desc: "좋고 싫음이 분명하고 취향이 뚜렷한 타입이에요. 자기만의 기준이 있고 그걸 존중받을 때 더 다정해져요.",
          color: "#F0F0F0",
        };
  }

  return isNeutered
    ? {
        element: "토(土)",
        title: "조용히 중심을 잡는 흙의 기운",
        desc: "자기 자리를 중요하게 생각하고 안정적인 흐름을 좋아해요. 낯선 환경보다 익숙한 공간에서 훨씬 편안해요.",
        color: "#F4E2A1",
      }
    : {
        element: "수(水)",
        title: "관찰력이 좋은 물의 기운",
        desc: "겉으로는 무심해 보여도 주변 분위기를 세심하게 읽는 타입이에요. 거리를 지키며 애정을 표현하는 편이에요.",
        color: "#D9EAFE",
      };
}

function getPersonalityTraits(
  petType: PetType,
  petGender: PetGender,
  isNeutered: boolean
) {
  if (petType === "dog") {
    if (petGender === "female") {
      return [
        {
          title: "애정 반응형",
          desc: "관심과 반응을 잘 받으면 기분이 빠르게 살아나는 타입이에요. 집사의 말투와 표정에 민감하게 반응할 수 있어요.",
        },
        {
          title: "섬세한 기분파",
          desc: "분위기가 편안하면 다정하고 사랑스럽지만, 어수선한 상황에서는 예민함이 먼저 올라올 수 있어요.",
        },
        {
          title: isNeutered ? "안정 추구형" : "애교 폭발형",
          desc: isNeutered
            ? "자기 루틴과 익숙한 공간을 지킬 때 훨씬 편안해져요. 과한 자극보다 예측 가능한 흐름이 잘 맞아요."
            : "좋아하는 사람 앞에서 감정 표현이 커지는 편이에요. 귀엽게 다가오고 싶어 하는 마음이 강할 수 있어요.",
        },
      ];
    }

    return [
      {
        title: "에너지 주도형",
        desc: "몸보다 마음이 먼저 움직이는 타입이에요. 재밌는 자극을 보면 빠르게 반응하고 존재감을 드러내요.",
      },
      {
        title: "리액션 민감형",
        desc: "집사의 칭찬, 웃음, 반응에 크게 힘을 얻어요. 함께 놀아줄수록 더 밝고 적극적으로 변할 수 있어요.",
      },
      {
        title: isNeutered ? "균형 활동형" : "직진 본능형",
        desc: isNeutered
          ? "에너지는 있지만 자기 리듬을 어느 정도 조절할 수 있어요. 짧고 집중도 높은 놀이가 잘 맞아요."
          : "신나면 브레이크보다 직진이 먼저 나올 수 있어요. 흥분 조절을 도와주면 훨씬 안정적으로 빛나요.",
      },
    ];
  }

  if (petGender === "female") {
    return [
      {
        title: "취향 분명형",
        desc: "좋아하는 것과 싫어하는 것이 확실한 타입이에요. 마음에 드는 사람과 공간에는 부드럽게 마음을 열어요.",
      },
      {
        title: "분위기 감지형",
        desc: "시끄러움, 낯선 냄새, 갑작스러운 접촉 같은 변화를 크게 느낄 수 있어요. 조용한 안정감이 중요해요.",
      },
      {
        title: isNeutered ? "차분 애착형" : "섬세 우아형",
        desc: isNeutered
          ? "겉으로는 조용하지만 신뢰가 생기면 은근하게 곁을 지키는 타입이에요."
          : "자기만의 기준이 분명하고, 존중받을 때 더 부드럽고 다정한 매력을 보여줘요.",
      },
    ];
  }

  return [
    {
      title: "관찰 중심형",
      desc: "먼저 나서기보다 상황을 충분히 살핀 뒤 반응하는 타입이에요. 주변 흐름을 조용히 읽고 있어요.",
    },
    {
      title: "거리 조절형",
      desc: "좋아하는 사람에게도 무조건 들이대기보다는 스스로 정한 거리 안에서 다가가고 싶어 해요.",
    },
    {
      title: isNeutered ? "안정 페이스형" : "은근 애정형",
      desc: isNeutered
        ? "자기 자리를 지키고 조용한 흐름 속에서 편안함을 느껴요. 루틴이 무너지지 않을수록 안정적이에요."
        : "겉으로는 무심해 보여도 마음이 열리면 은근한 애정 표현이 나와요. 조용한 교감이 잘 맞아요.",
    },
  ];
}

function getCareTips(
  petType: PetType,
  petGender: PetGender,
  isNeutered: boolean
) {
  const commonTip1 =
    petType === "dog"
      ? "산책이나 놀이를 길게 하기보다, 오늘 컨디션에 맞는 적당한 길이로 조절해 주세요."
      : "억지로 반응을 끌어내기보다 먼저 다가올 수 있는 여유를 주는 게 더 좋아요.";

  const commonTip2 =
    petGender === "female"
      ? "예민한 신호가 보이면 바로 쉬는 흐름으로 전환해 주세요. 섬세하게 읽어주는 보호자와 잘 맞아요."
      : "칭찬이나 조용한 반응처럼 분명하지만 부담 없는 교감이 관계를 더 편안하게 만들어줘요.";

  const commonTip3 = isNeutered
    ? "안정감 있는 루틴, 익숙한 공간, 예측 가능한 흐름이 오늘의 성격을 가장 잘 살려줘요."
    : "감정과 에너지가 빠르게 올라올 수 있으니, 흥분이 길게 이어지지 않도록 쉬는 타이밍을 꼭 주세요.";

  return [commonTip1, commonTip2, commonTip3];
}

export default function PersonalityScreen() {
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

  const elementMood = getElementMood(petType, petGender, isNeutered);
  const traits = getPersonalityTraits(petType, petGender, isNeutered);
  const careTips = getCareTips(petType, petGender, isNeutered);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>PERSONALITY</Text>
        </View>

        <Text style={styles.heroTitle}>타고난 성격 분석 ✨</Text>
        <Text style={styles.heroSubtitle}>
          우리 아이의 기본 성향과 보호자가 알아두면 좋은 관계 팁을 정리했어요.
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
        <Text style={styles.sectionTitle}>오행 무드</Text>

        <View style={[styles.elementCard, { backgroundColor: elementMood.color }]}>
          <Text style={styles.elementLabel}>{elementMood.element}</Text>
          <Text style={styles.elementTitle}>{elementMood.title}</Text>
          <Text style={styles.elementDesc}>{elementMood.desc}</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>핵심 성향 3가지</Text>

        {traits.map((trait, index) => (
          <View key={index} style={styles.traitCard}>
            <Text style={styles.traitTitle}>{trait.title}</Text>
            <Text style={styles.traitDesc}>{trait.desc}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>보호자 가이드</Text>

        {careTips.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Text style={styles.tipIndex}>{index + 1}</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton
          title="작명 풀이 / 이름 추천 보기"
          onPress={() =>
            router.push({
              pathname: "/naming" as const,
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
  elementCard: {
    borderRadius: 20,
    padding: 18,
  },
  elementLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 8,
  },
  elementTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  elementDesc: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.subText,
    lineHeight: 22,
  },
  traitCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
  },
  traitTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  traitDesc: {
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