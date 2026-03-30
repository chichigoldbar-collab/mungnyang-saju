import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import {
  isPremiumUser,
  resetPremiumAccess,
  setPremiumAccess,
} from "../utils/premiumAccess";

export default function PremiumScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPremiumState = useCallback(async () => {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPremiumState();
    }, [loadPremiumState])
  );

  const handleUnlockPremium = async () => {
    try {
      setIsSubmitting(true);

      await setPremiumAccess();
      setIsPremium(true);

      Alert.alert(
        "프리미엄 열림",
        "프리미엄이 적용되었습니다.\n이제 성격 분석, 작명 풀이, 모든 광고 제거 혜택을 이용할 수 있어요.",
        [{ text: "확인" }]
      );
    } catch (error) {
      console.error("프리미엄 상태 저장 실패", error);
      Alert.alert("오류", "프리미엄 상태를 저장하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPremiumForTest = async () => {
    try {
      setIsSubmitting(true);
      await resetPremiumAccess();
      setIsPremium(false);

      Alert.alert(
        "테스트 초기화",
        "프리미엄 상태가 해제되었습니다.\n광고가 다시 표시됩니다.",
        [{ text: "확인" }]
      );
    } catch (error) {
      console.error("프리미엄 초기화 실패", error);
      Alert.alert("오류", "프리미엄 상태를 초기화하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
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
          한 번만 열면 성격 분석과 작명 풀이를 모두 이용할 수 있고,
          무료운세/이름추천/궁합의 광고도 모두 사라져 더 편하게 사용할 수 있어요.
        </Text>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>이용권 구성</Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>프리미엄 전체 이용권</Text>
          <Text style={styles.priceValue}>₩990</Text>
          <Text style={styles.priceSubText}>
            성격 분석, 작명 풀이, 광고 제거까지 한 번에 이용할 수 있어요
          </Text>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>✨</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>타고난 성격 분석</Text>
              <Text style={styles.featureDesc}>
                성향, 관계 흐름, 돌봄 팁까지 더 자세히 해석해드려요
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>📝</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>작명 풀이</Text>
              <Text style={styles.featureDesc}>
                현재 이름의 인상과 이름이 가진 분위기를 자세히 볼 수 있어요
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureEmoji}>🚫</Text>
            <View style={styles.featureTextWrap}>
              <Text style={styles.featureTitle}>모든 광고 제거</Text>
              <Text style={styles.featureDesc}>
                무료운세, 이름추천, 궁합 분석 전면 광고와 하단 배너 광고가 모두 사라집니다
              </Text>
            </View>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>현재 상태</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>프리미엄 상태</Text>
          <Text
            style={[
              styles.statusValue,
              isPremium ? styles.statusValueOn : styles.statusValueOff,
            ]}
          >
            {isPremium ? "이용 중" : "미이용"}
          </Text>
          <Text style={styles.statusDesc}>
            {isPremium
              ? "프리미엄이 적용되어 성격 분석, 작명 풀이, 광고 제거 혜택을 이용할 수 있어요."
              : "지금은 무료 상태예요. 프리미엄을 열면 광고 제거 혜택도 함께 적용됩니다."}
          </Text>
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
            <Text style={styles.previewTitle}>📝 작명 풀이</Text>
            <Text style={styles.previewDesc}>
              이름의 느낌과 어울리는 추천 이름을 볼 수 있어요
            </Text>
          </View>
          <Text style={styles.previewBadge}>OPEN</Text>
        </Pressable>
      </SectionCard>

      <View style={styles.buttonGroup}>
        {!isPremium && (
          <AppButton
            title={isSubmitting ? "적용 중..." : "₩990으로 프리미엄 열기"}
            onPress={handleUnlockPremium}
          />
        )}

        <AppButton
          title={isSubmitting ? "초기화 중..." : "테스트용 프리미엄 해제"}
          onPress={handleResetPremiumForTest}
          variant="outline"
        />

        <AppButton
          title="홈으로 돌아가기"
          onPress={() => router.replace("/(tabs)")}
          variant="outline"
        />
      </View>

      <Text style={styles.footNote}>
        궁합 기능은 무료로 제공되며, 현재는 테스트용으로 프리미엄 상태만 저장됩니다.
        {"\n"}
        프리미엄을 열면 성격 분석, 작명 풀이, 광고 제거 혜택이 함께 적용됩니다.
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
    paddingBottom: 120,
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
  statusCard: {
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 16,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.muted,
  },
  statusValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
  },
  statusValueOn: {
    color: "#2F7D32",
  },
  statusValueOff: {
    color: COLORS.secondary,
  },
  statusDesc: {
    marginTop: 8,
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