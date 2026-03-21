import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type PetType = "dog" | "cat";
type PetGender = "male" | "female";

type PersonalityData = {
  summary: string;
  traits: string[];
  tips: string[];
  element: {
    title: string;
    description: string;
  };
};

function getCharacterBadge(petType: PetType, petGender: PetGender) {
  if (petType === "cat") {
    return petGender === "female"
      ? {
          emoji: "🐱",
          title: "섬세한 관찰자",
          subtitle: "조용하지만 자기 취향이 분명한 타입",
          bg: "#F7D9E3",
        }
      : {
          emoji: "🐱",
          title: "무심한 듯 다정한 타입",
          subtitle: "혼자만의 시간과 관심을 둘 다 챙기는 타입",
          bg: "#E7E1FF",
        };
  }

  return petGender === "female"
    ? {
        emoji: "🐶",
        title: "사랑받고 싶은 애교형",
        subtitle: "표현이 풍부하고 반응이 빠른 타입",
        bg: "#FFE4D6",
      }
    : {
        emoji: "🐶",
        title: "에너지 넘치는 활동형",
        subtitle: "좋아하는 사람에게 열정이 큰 타입",
        bg: "#DDF3E4",
      };
}

function getPersonalityData(
  petType: PetType,
  petGender: PetGender,
  petName: string,
  isNeutered: boolean
): PersonalityData {
  if (petType === "cat" && petGender === "female") {
    return {
      summary: `${petName}는 섬세하고 취향이 분명한 매력형이에요. 좋아하는 건 확실히 좋아하고, 싫은 것도 분명하게 표현하는 편이에요.`,
      traits: [
        "낯선 환경에서는 바로 반응하기보다 조용히 살펴보는 편이에요.",
        "마음이 열리면 은근하고 깊은 애정을 보여줄 수 있어요.",
        "자기 기준이 분명해서 컨디션이나 기분 변화가 표정과 반응에 잘 드러나요.",
      ],
      tips: [
        "억지로 친해지려 하기보다 먼저 다가올 시간을 주는 게 좋아요.",
        "익숙한 장난감, 익숙한 자리처럼 루틴을 만들어주면 안정감을 느껴요.",
      ],
      element: {
        title: "수(水)와 금(金)의 기운이 도는 아이",
        description: isNeutered
          ? "섬세함과 예민함이 있으면서도 비교적 안정적인 반응을 보일 가능성이 커요. 조용한 환경에서 편안함이 잘 올라오는 편이에요."
          : "감각이 예민하고 변화에 민감한 편이에요. 오늘 컨디션이나 분위기에 따라 반응 차이가 더 또렷할 수 있어요.",
      },
    };
  }

  if (petType === "cat" && petGender === "male") {
    return {
      summary: `${petName}는 무심해 보여도 속으로는 주변을 꼼꼼히 체크하는 타입이에요. 혼자 있는 시간도 즐기지만 좋아하는 사람은 분명히 챙겨요.`,
      traits: [
        "관심이 생기면 조용히 다가와 존재감을 드러내는 편이에요.",
        "자극이 과하면 거리를 두고, 편안하면 금방 다시 자기 페이스를 찾는 타입이에요.",
        "겉보기보다 애정 표현이 깊고, 마음을 주면 오래 기억하는 편이에요.",
      ],
      tips: [
        "시끄러운 분위기보다 차분한 공간에서 더 편안해할 수 있어요.",
        "원할 때 곁에 있을 수 있게 선택권을 주면 신뢰가 더 빨리 쌓여요.",
      ],
      element: {
        title: "수(水)의 기운이 강한 아이",
        description: isNeutered
          ? "관찰력과 섬세함이 있으면서 비교적 차분하게 반응할 가능성이 높아요. 익숙한 사람과 공간에서 안정감이 크게 올라와요."
          : "예민한 감각과 자기 주도성이 함께 있는 편이에요. 컨디션에 따라 거리감과 애정 표현의 차이가 더 크게 느껴질 수 있어요.",
      },
    };
  }

  if (petType === "dog" && petGender === "female") {
    return {
      summary: `${petName}는 애교와 섬세함이 함께 있는 사랑둥이 타입이에요. 관심받는 걸 좋아하지만 기분과 취향도 분명한 편이에요.`,
      traits: [
        "좋아하는 사람에게는 반응이 크고 애정 표현도 풍부한 편이에요.",
        "기분이 좋으면 표정, 몸짓, 리액션이 훨씬 더 또렷해져요.",
        "낯선 분위기에서는 살짝 예민해질 수 있지만 익숙해지면 금방 편해져요.",
      ],
      tips: [
        "칭찬과 부드러운 반응이 자신감을 크게 올려줄 수 있어요.",
        "과한 자극보다는 편안한 놀이와 안정된 루틴이 잘 맞아요.",
      ],
      element: {
        title: "화(火)와 토(土)의 기운이 따뜻한 아이",
        description: isNeutered
          ? "표현력은 좋지만 비교적 차분한 균형감도 함께 있을 가능성이 있어요. 익숙한 보호자와 함께 있을 때 안정과 애정이 잘 올라와요."
          : "감정 표현이 풍부하고 반응이 빠른 편이에요. 기분 변화와 흥분 포인트가 빨리 올라올 수 있어 차분한 마무리가 중요해요.",
      },
    };
  }

  return {
    summary: `${petName}는 에너지가 바깥으로 잘 드러나는 활동형이에요. 사람과 상호작용하는 걸 좋아하고, 신나면 존재감이 확 살아나는 편이에요.`,
    traits: [
      "좋아하는 사람과 놀이나 산책에 대한 집중력이 높은 편이에요.",
      "흥분이 빠르게 올라오지만 그만큼 기분 좋은 에너지도 확실하게 보여줘요.",
      "새로운 자극이나 냄새, 장난감에 대한 호기심이 큰 편이에요.",
    ],
    tips: [
      "짧고 자주 노는 시간이 스트레스 해소에 잘 맞아요.",
      "신났을 때 흥분을 천천히 가라앉히는 루틴을 만들어주면 좋아요.",
    ],
    element: {
      title: "화(火)의 기운이 밝게 도는 아이",
      description: isNeutered
        ? "활동성과 표현력이 있으면서도 비교적 안정감을 함께 보일 수 있어요. 에너지를 잘 쓰고 나면 금방 편안한 상태로 돌아오기 쉬워요."
        : "열정적이고 반응이 빠른 편이에요. 신나면 속도가 붙기 쉬워서 에너지 조절과 휴식 타이밍이 중요해요.",
    },
  };
}

export default function PersonalityScreen() {
  const params = useLocalSearchParams();

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const breed = String(params.breed ?? "품종 미입력");
  const petGender = String(params.petGender ?? "male") as PetGender;
  const isNeutered = String(params.isNeutered ?? "false") === "true";

  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";
  const petGenderLabel = petGender === "female" ? "여아" : "남아";

  const badge = getCharacterBadge(petType, petGender);
  const personality = getPersonalityData(
    petType,
    petGender,
    petName,
    isNeutered
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>PREMIUM</Text>
        </View>
        <Text style={styles.title}>타고난 성격 분석 ✨</Text>
        <Text style={styles.subtitle}>
          우리 아이의 기본 성향과 보호자 팁을 한눈에 정리했어요.
        </Text>
      </View>

      <View style={[styles.profileCard, { backgroundColor: badge.bg }]}>
        <Text style={styles.profileEmoji}>{badge.emoji}</Text>
        <Text style={styles.profileTitle}>{badge.title}</Text>
        <Text style={styles.profileSubtitle}>{badge.subtitle}</Text>
        <Text style={styles.profileMeta}>
          {petName} · {petTypeLabel} · {breed} · {petGenderLabel}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>한 줄 요약</Text>
        <Text style={styles.summaryText}>{personality.summary}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>대표 성향 3가지</Text>
        {personality.traits.map((trait, index) => (
          <Text key={index} style={styles.bulletText}>
            • {trait}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>보호자 팁</Text>
        {personality.tips.map((tip, index) => (
          <Text key={index} style={styles.bulletText}>
            • {tip}
          </Text>
        ))}
      </View>

      <View style={styles.elementCard}>
        <Text style={styles.elementTitle}>{personality.element.title}</Text>
        <Text style={styles.elementText}>{personality.element.description}</Text>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={() =>
          router.push({
            pathname: "/result" as const,
            params: {
              petName,
              petType,
              petGender,
              breed,
              birthDate: String(params.birthDate ?? "생일 미입력"),
              birthTime: String(params.birthTime ?? "시간 모름"),
              isNeutered: String(params.isNeutered ?? "false"),
            },
          })
        }
      >
        <Text style={styles.secondaryButtonText}>결과 화면으로 돌아가기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFF9F3",
  },
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 44,
  },
  heroCard: {
    backgroundColor: "#2E2A27",
    borderRadius: 26,
    padding: 22,
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE9D6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2E2A27",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#F5ECE5",
  },
  profileCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2E2A27",
  },
  profileSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#5F5752",
    textAlign: "center",
  },
  profileMeta: {
    marginTop: 10,
    fontSize: 14,
    color: "#6F645C",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#FFE9D6",
    borderRadius: 22,
    padding: 18,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8C5A3C",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
    marginBottom: 8,
  },
  elementCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 22,
    padding: 18,
  },
  elementTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 8,
  },
  elementText: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
  },
  secondaryButton: {
    backgroundColor: "#2E2A27",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});