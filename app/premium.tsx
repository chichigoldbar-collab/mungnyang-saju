import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import type { PetGender, PetType } from "../types";

const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

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

export default function PremiumScreen() {
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

  const goToPersonality = () => {
    router.replace({
      pathname: "/personality" as const,
      params: {
        petName,
        petType,
        petGender,
        breed,
        birthDate,
        birthTime,
        isNeutered: isNeutered ? "true" : "false",
      },
    });
  };

  const goToNaming = () => {
    router.replace({
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
    });
  };

  const goToCompatibility = () => {
    router.replace({
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
    });
  };

  const handleUnlockPremium = async () => {
    try {
      await AsyncStorage.setItem(
        PREMIUM_ACCESS_KEY,
        JSON.stringify({
          allAccess: true,
          unlockedAt: new Date().toISOString(),
          productId: "all-access-990",
        })
      );

      Alert.alert(
        "프리미엄 열림",
        "모든 프리미엄 기능이 열렸습니다.",
        [
          {
            text: "성격 분석 보기",
            onPress: goToPersonality,
          },
          {
            text: "닫기",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("프리미엄 상태 저장 실패", error);
      Alert.alert("오류", "프리미엄 상태를 저장하지 못했습니다.");
    }
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

        <Text style={styles.heroTitle}>모든 프리미엄 기능 열기 ✨</Text>
        <Text style={styles.heroSubtitle}>
          한 번만 열면 성격 분석, 작명 풀이, 보호자 궁합까지 전부 이용할 수 있어요.
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
        <Text style={styles.sectionTitle}>이용권 구성</Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>전체 프리미엄 이용권</Text>
          <Text style={styles.priceValue}>₩990</Text>
          <Text style={styles.priceSubText}>
            어떤 기능을 눌러도 추가 결제 없이 모두 사용
          </Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>✨</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>타고난 성격 분석</Text>
              <Text style={styles.featureDesc}>
                성향 3가지, 관계 팁, 오행 무드 해석
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📝</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>작명 풀이 / 이름 추천</Text>
              <Text style={styles.featureDesc}>
                현재 이름의 인상과 새로운 추천 이름 제공
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>💞</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>보호자와의 궁합</Text>
              <Text style={styles.featureDesc}>
                궁합 점수, 잘 맞는 포인트, 관계 팁 확인
              </Text>
            </View>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>미리 보기</Text>

        <Pressable style={styles.previewCard} onPress={goToPersonality}>
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>✨ 타고난 성격 분석</Text>
            <Text style={styles.previewDesc}>
              우리 아이의 성향을 더 자세히 해석해드려요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>

        <Pressable style={styles.previewCard} onPress={goToNaming}>
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>📝 작명 풀이 / 이름 추천</Text>
            <Text style={styles.previewDesc}>
              이름의 느낌과 어울리는 추천 이름을 볼 수 있어요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>

        <Pressable style={styles.previewCard} onPress={goToCompatibility}>
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>💞 보호자와의 궁합</Text>
            <Text style={styles.previewDesc}>
              관계 흐름과 잘 맞는 포인트를 알려드려요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton title="₩990으로 전체 열기" onPress={handleUnlockPremium} />
        <AppButton
          title="결과 화면으로 돌아가기"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>

      <Text style={styles.footNote}>
        현재는 테스트용으로 프리미엄 상태만 저장됩니다.
      </Text>
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
  priceCard: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 20,
    padding: 18,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.text,
  },
  priceSubText: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 20,
  },
  featureList: {
    marginTop: 14,
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
  },
  featureEmoji: {
    fontSize: 22,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  featureDesc: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 20,
  },
  previewCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  previewLeft: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  previewDesc: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.subText,
    lineHeight: 19,
  },
  previewBadge: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
    backgroundColor: COLORS.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  buttonGroup: {
    gap: 10,
  },
  footNote: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: "center",
    lineHeight: 18,
  },
});