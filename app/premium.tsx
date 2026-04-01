import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";
import {
  disablePremiumAccessForTest,
  enablePremiumAccess,
  getPremiumEntitlements,
  type PremiumEntitlements,
} from "../utils/premiumAccess";

const defaultEntitlements: PremiumEntitlements = {
  allAccess: false,
  removeAds: false,
  premiumPersonality: false,
  premiumNaming: false,
};

export default function PremiumScreen() {
  const [entitlements, setEntitlements] =
    useState<PremiumEntitlements>(defaultEntitlements);
  const [isLoading, setIsLoading] = useState(true);

  const loadPremiumState = useCallback(async () => {
    try {
      setIsLoading(true);
      const value = await getPremiumEntitlements();
      setEntitlements(value);
    } catch (error) {
      console.error("프리미엄 상태 불러오기 실패", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPremiumState();
    }, [loadPremiumState])
  );

  const handleUnlockPremium = async () => {
    try {
      await enablePremiumAccess();
      await loadPremiumState();

      Alert.alert(
        "프리미엄 열림",
        "광고 제거, 성격 분석, 작명 풀이가 모두 적용되었습니다.",
        [{ text: "확인" }]
      );
    } catch (error) {
      console.error("프리미엄 상태 저장 실패", error);
      Alert.alert("오류", "프리미엄 상태를 저장하지 못했습니다.");
    }
  };

  const handleDisablePremiumForTest = async () => {
    try {
      await disablePremiumAccessForTest();
      await loadPremiumState();

      Alert.alert("테스트 초기화", "프리미엄 상태가 해제되었습니다.", [
        { text: "확인" },
      ]);
    } catch (error) {
      console.error("프리미엄 해제 실패", error);
      Alert.alert("오류", "프리미엄 상태를 해제하지 못했습니다.");
    }
  };

  const isUnlocked = entitlements.allAccess;

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

        <Text style={styles.heroTitle}>프리미엄 혜택 열기 ✨</Text>
        <Text style={styles.heroSubtitle}>
          광고 제거, 성격 분석, 작명 풀이를 한 번에 이용할 수 있어요.
        </Text>

        <View
          style={[
            styles.statusPill,
            isUnlocked ? styles.statusPillOn : styles.statusPillOff,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              isUnlocked ? styles.statusPillTextOn : styles.statusPillTextOff,
            ]}
          >
            {isUnlocked ? "프리미엄 이용 중" : "프리미엄 미이용"}
          </Text>
        </View>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>이용권 구성</Text>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>프리미엄 전체 이용권</Text>
          <Text style={styles.priceValue}>₩990</Text>
          <Text style={styles.priceSubText}>
            광고 제거, 성격 분석, 작명 풀이를 추가 결제 없이 이용할 수 있어요.
          </Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>현재 적용된 혜택</Text>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureEmoji}>🚫</Text>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>광고 제거</Text>
                <Text style={styles.featureDesc}>
                  하단 배너광고와 전면광고가 사라집니다
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureStatus,
                entitlements.removeAds
                  ? styles.featureStatusOn
                  : styles.featureStatusOff,
              ]}
            >
              <Text
                style={[
                  styles.featureStatusText,
                  entitlements.removeAds
                    ? styles.featureStatusTextOn
                    : styles.featureStatusTextOff,
                ]}
              >
                {entitlements.removeAds ? "적용됨" : "잠금"}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureEmoji}>🔥</Text>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>성격 분석</Text>
                <Text style={styles.featureDesc}>
                  타고난 성향, 관계 팁, 행동 흐름을 더 깊게 볼 수 있어요
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureStatus,
                entitlements.premiumPersonality
                  ? styles.featureStatusOn
                  : styles.featureStatusOff,
              ]}
            >
              <Text
                style={[
                  styles.featureStatusText,
                  entitlements.premiumPersonality
                    ? styles.featureStatusTextOn
                    : styles.featureStatusTextOff,
                ]}
              >
                {entitlements.premiumPersonality ? "열림" : "잠금"}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureLeft}>
              <Text style={styles.featureEmoji}>✍️</Text>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>작명 풀이</Text>
                <Text style={styles.featureDesc}>
                  현재 이름 해석과 어울리는 추천 이름을 볼 수 있어요
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.featureStatus,
                entitlements.premiumNaming
                  ? styles.featureStatusOn
                  : styles.featureStatusOff,
              ]}
            >
              <Text
                style={[
                  styles.featureStatusText,
                  entitlements.premiumNaming
                    ? styles.featureStatusTextOn
                    : styles.featureStatusTextOff,
                ]}
              >
                {entitlements.premiumNaming ? "열림" : "잠금"}
              </Text>
            </View>
          </View>
        </View>

        {entitlements.unlockedAt ? (
          <Text style={styles.unlockMeta}>
            이용 시작일 · {new Date(entitlements.unlockedAt).toLocaleDateString()}
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>미리 보기</Text>

        <Pressable
          style={styles.previewCard}
          onPress={() => router.push("/(tabs)/personality")}
        >
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>🔥 타고난 성격 분석</Text>
            <Text style={styles.previewDesc}>
              아이의 성향, 행동 패턴, 교감 팁을 더 자세히 확인할 수 있어요
            </Text>
          </View>
          <Text style={styles.previewBadge}>
            {entitlements.premiumPersonality ? "OPEN" : "LOCK"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.previewCard}
          onPress={() => router.push("/(tabs)/naming")}
        >
          <View style={styles.previewLeft}>
            <Text style={styles.previewTitle}>✍️ 작명 풀이</Text>
            <Text style={styles.previewDesc}>
              이름의 느낌과 어울리는 추천 이름까지 볼 수 있어요
            </Text>
          </View>
          <Text style={styles.previewBadge}>
            {entitlements.premiumNaming ? "OPEN" : "LOCK"}
          </Text>
        </Pressable>
      </SectionCard>

      <View style={styles.buttonGroup}>
       <AppButton
  title={isUnlocked ? "프리미엄 이용 중" : "₩990으로 프리미엄 열기"}
  onPress={handleUnlockPremium}
  variant={isUnlocked ? "secondary" : "primary"}
/>

        <AppButton
          title="홈으로 돌아가기"
          onPress={() => router.replace("/(tabs)")}
          variant="outline"
        />

        <AppButton
          title="테스트용 프리미엄 해제"
          onPress={handleDisablePremiumForTest}
          variant="outline"
        />
      </View>

      <Text style={styles.footNote}>
        궁합 기능은 무료로 제공되며, 현재는 테스트용으로 프리미엄 상태를 저장합니다.
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
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 14,
  },
  statusPillOn: {
    backgroundColor: "#FFF4D9",
  },
  statusPillOff: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "800",
  },
  statusPillTextOn: {
    color: "#8A5B00",
  },
  statusPillTextOff: {
    color: "#FFFFFF",
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
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.bg,
    borderRadius: 18,
    padding: 14,
  },
  featureLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    alignItems: "flex-start",
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
  featureStatus: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featureStatusOn: {
    backgroundColor: "#EEF8EE",
  },
  featureStatusOff: {
    backgroundColor: "#F3ECE6",
  },
  featureStatusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  featureStatusTextOn: {
    color: "#2F7D32",
  },
  featureStatusTextOff: {
    color: "#8A6F63",
  },
  unlockMeta: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.muted,
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
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  buttonGroup: {
    gap: 10,
  },
  footNote: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
  },
});