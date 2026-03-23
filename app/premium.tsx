import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";

const PREMIUM_ACCESS_KEY = "mungnyang-premium-access";

export default function PremiumScreen() {
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

      Alert.alert("프리미엄 열림", "성격 분석과 작명 풀이가 열렸습니다.", [
        {
          text: "확인",
        },
      ]);
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

        <Text style={styles.heroTitle}>프리미엄 기능 열기 ✨</Text>
        <Text style={styles.heroSubtitle}>
          한 번만 열면 성격 분석과 작명 풀이를 모두 이용할 수 있어요.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>이용권 구성</Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>프리미엄 전체 이용권</Text>
          <Text style={styles.priceValue}>₩990</Text>
          <Text style={styles.priceSubText}>
            성격 분석과 작명 풀이를 추가 결제 없이 이용할 수 있어요
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
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>미리 보기</Text>

        <Pressable
          style={styles.previewCard}
          onPress={() => router.push("/(tabs)/personality")}
        >
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>✨ 타고난 성격 분석</Text>
            <Text style={styles.previewDesc}>
              우리 아이의 성향을 더 자세히 해석해드려요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>

        <Pressable
          style={styles.previewCard}
          onPress={() => router.push("/(tabs)/naming")}
        >
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>📝 작명 풀이 / 이름 추천</Text>
            <Text style={styles.previewDesc}>
              이름의 느낌과 어울리는 추천 이름을 볼 수 있어요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>
      </SectionCard>

      <View style={styles.buttonGroup}>
        <AppButton title="₩990으로 프리미엄 열기" onPress={handleUnlockPremium} />
        <AppButton
          title="홈으로 돌아가기"
          onPress={() => router.replace("/(tabs)")}
          variant="outline"
        />
      </View>

      <Text style={styles.footNote}>
        궁합 기능은 무료로 제공되며, 현재는 테스트용으로 프리미엄 상태만 저장됩니다.
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