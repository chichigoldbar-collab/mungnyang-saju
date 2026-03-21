import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";

type PetType = "dog" | "cat";

function calculateCompatibilityScore(
  birthDate: string,
  guardianBirthDate: string
) {
  const petNumbers = birthDate.replace(/\D/g, "");
  const guardianNumbers = guardianBirthDate.replace(/\D/g, "");

  if (petNumbers.length !== 8 || guardianNumbers.length !== 8) {
    return null;
  }

  const petSum = petNumbers.split("").reduce((sum, n) => sum + Number(n), 0);
  const guardianSum = guardianNumbers
    .split("")
    .reduce((sum, n) => sum + Number(n), 0);
  const diff = Math.abs(petSum - guardianSum);

  return Math.max(60, 100 - diff * 2);
}

function getCompatibilityText(score: number, petType: PetType) {
  if (score >= 90) {
    return {
      summary: "서로를 편안하게 만들어주는 찰떡 궁합이에요.",
      strengths: [
        "함께 있을 때 안정감이 높아요.",
        "일상 루틴이 잘 맞을 가능성이 커요.",
        "교감과 신뢰가 자연스럽게 쌓이기 쉬워요.",
      ],
      tips: [
        "좋아하는 놀이와 휴식 패턴을 꾸준히 유지해보세요.",
        "작은 리액션과 칭찬이 더 큰 애착으로 이어질 수 있어요.",
      ],
    };
  }

  if (score >= 75) {
    return {
      summary: "잘 맞는 편이지만 서로의 리듬을 맞추면 더 좋아져요.",
      strengths: [
        "기본적인 정서 궁합이 안정적인 편이에요.",
        "서로 익숙해질수록 편안함이 커질 수 있어요.",
        "생활 패턴을 맞추면 교감이 더 깊어질 수 있어요.",
      ],
      tips: [
        "산책, 놀이, 휴식 시간을 일정하게 가져보세요.",
        petType === "cat"
          ? "반응을 기다려주는 태도가 신뢰 형성에 도움이 돼요."
          : "명확한 리액션과 칭찬이 관계를 더 부드럽게 만들어요.",
      ],
    };
  }

  return {
    summary: "조금 다른 리듬이 있지만 이해할수록 더 좋아질 수 있어요.",
    strengths: [
      "서로 다른 매력을 보완해줄 가능성이 있어요.",
      "시간이 쌓일수록 관계가 안정될 수 있어요.",
      "한쪽이 서두르지 않으면 신뢰가 점점 깊어질 수 있어요.",
    ],
    tips: [
      "반응을 강요하지 말고 편안한 루틴을 먼저 만들어보세요.",
      "좋아하는 간식, 장난감, 휴식 포인트를 기록해보면 도움이 돼요.",
    ],
  };
}

export default function CompatibilityScreen() {
  const params = useLocalSearchParams();

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog") as PetType;
  const petGender = String(params.petGender ?? "male");
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");
  const isNeutered = String(params.isNeutered ?? "false");

  const petEmoji = petType === "cat" ? "🐱" : "🐶";
  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";

  const [guardianBirthDate, setGuardianBirthDate] = useState("");
  const [score, setScore] = useState<number | null>(null);

  const compatibility =
    score !== null ? getCompatibilityText(score, petType) : null;

  const handleCheckCompatibility = () => {
    const result = calculateCompatibilityScore(birthDate, guardianBirthDate);
    setScore(result);
  };

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
        <Text style={styles.title}>보호자와의 궁합 💞</Text>
        <Text style={styles.subtitle}>
          생년월일을 바탕으로 서로의 리듬과 잘 맞는 포인트를 정리했어요.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileEmoji}>{petEmoji}</Text>
        <Text style={styles.profileTitle}>{petName}와 보호자의 궁합</Text>
        <Text style={styles.profileMeta}>
          {petTypeLabel} · {breed}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>보호자 생년월일 입력</Text>
        <TextInput
          value={guardianBirthDate}
          onChangeText={setGuardianBirthDate}
          placeholder="예: 1995.08.21 또는 19950821"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="number-pad"
        />

        <Pressable style={styles.checkButton} onPress={handleCheckCompatibility}>
          <Text style={styles.checkButtonText}>궁합 보기</Text>
        </Pressable>
      </View>

      {score === null ? (
        <View style={styles.card}>
          <Text style={styles.helperText}>
            보호자 생년월일을 입력하면 {petName}와의 궁합을 확인할 수 있어요.
          </Text>
        </View>
      ) : compatibility ? (
        <>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>궁합 점수</Text>
            <Text style={styles.scoreText}>{score}점</Text>
            <Text style={styles.scoreSummary}>{compatibility.summary}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>잘 맞는 포인트</Text>
            {compatibility.strengths.map((item, index) => (
              <Text key={index} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>관계 팁</Text>
            {compatibility.tips.map((item, index) => (
              <Text key={index} style={styles.bullet}>
                • {item}
              </Text>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.helperText}>
            생년월일 형식을 다시 확인해주세요.
          </Text>
        </View>
      )}

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
              birthDate,
              birthTime,
              isNeutered,
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
    fontSize: 22,
    fontWeight: "800",
    color: "#2E2A27",
    textAlign: "center",
  },
  profileMeta: {
    marginTop: 8,
    color: "#7A6F66",
    fontSize: 14,
    textAlign: "center",
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
  input: {
    backgroundColor: "#F7F2ED",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#2E2A27",
  },
  checkButton: {
    marginTop: 12,
    backgroundColor: "#2E2A27",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  helperText: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
  },
  scoreCard: {
    backgroundColor: "#FFE9D6",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8C5A3C",
  },
  scoreText: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "800",
    color: "#2E2A27",
  },
  scoreSummary: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2A27",
    textAlign: "center",
    lineHeight: 24,
  },
  bullet: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
    marginBottom: 8,
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