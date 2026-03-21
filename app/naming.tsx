import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type PetType = "dog" | "cat";

function getNameMeaning(name: string, petType: PetType) {
  const lastChar = name.charAt(name.length - 1) || "이";

  const base =
    petType === "cat"
      ? "부드럽고 예민한 분위기"
      : "밝고 친근한 분위기";

  const endingMap: Record<string, string> = {
    이: "정감 있고 오래 불러도 질리지 않는 이름이에요.",
    리: "가볍고 귀엽게 불리는 리듬감이 강한 이름이에요.",
    루: "부드럽고 세련된 이미지가 느껴지는 이름이에요.",
    나: "다정하고 포근한 무드가 살아 있는 이름이에요.",
    코: "짧고 또렷해서 반응을 끌어내기 좋은 이름이에요.",
    비: "맑고 사랑스러운 인상을 주는 이름이에요.",
  };

  return {
    summary: `${name}는 ${base}에 잘 어울리는 이름이에요.`,
    detail:
      endingMap[lastChar] ??
      "짧고 기억하기 쉬워서 보호자와 반려동물 모두 익숙해지기 좋은 이름이에요.",
  };
}

function getRecommendedNames(petType: PetType, petGender: string) {
  if (petType === "cat" && petGender === "female") {
    return ["나비", "루나", "모모", "보리", "소이"];
  }
  if (petType === "cat" && petGender === "male") {
    return ["탄이", "호두", "루이", "토토", "단추"];
  }
  if (petType === "dog" && petGender === "female") {
    return ["코코", "보리", "하리", "두부", "사랑"];
  }
  return ["초코", "몽이", "호두", "루이", "탄이"];
}

export default function NamingScreen() {
  const params = useLocalSearchParams();

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male");
  const breed = String(params.breed ?? "품종 미입력");

  const petEmoji = petType === "cat" ? "🐱" : "🐶";
  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";
  const petGenderLabel = petGender === "female" ? "여아" : "남아";

  const meaning = getNameMeaning(petName, petType);
  const recommendedNames = getRecommendedNames(petType, petGender);

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
        <Text style={styles.title}>작명 풀이 / 이름 추천 ✍️</Text>
        <Text style={styles.subtitle}>
          현재 이름의 분위기와 잘 어울리는 추천 이름을 정리했어요.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileEmoji}>{petEmoji}</Text>
        <Text style={styles.profileTitle}>{petName}</Text>
        <Text style={styles.profileMeta}>
          {petTypeLabel} · {breed} · {petGenderLabel}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>현재 이름 풀이</Text>
        <Text style={styles.summaryText}>{meaning.summary}</Text>
        <Text style={styles.detailText}>{meaning.detail}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>이 이름의 느낌</Text>
        <Text style={styles.bullet}>• 부르기 쉽고 반응 유도가 편한 이름</Text>
        <Text style={styles.bullet}>• 보호자가 애정을 담아 부르기 좋은 리듬</Text>
        <Text style={styles.bullet}>• 일상 대화나 SNS에서도 귀엽게 보이는 이름</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>추천 이름</Text>
        <View style={styles.nameWrap}>
          {recommendedNames.map((name) => (
            <View key={name} style={styles.nameChip}>
              <Text style={styles.nameChipText}>{name}</Text>
            </View>
          ))}
        </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
  },
  profileEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2E2A27",
  },
  profileMeta: {
    marginTop: 8,
    color: "#7A6F66",
    fontSize: 14,
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
  detailText: {
    marginTop: 10,
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
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
  bullet: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
    marginBottom: 8,
  },
  nameWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  nameChip: {
    backgroundColor: "#F7F2ED",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  nameChipText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2A27",
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