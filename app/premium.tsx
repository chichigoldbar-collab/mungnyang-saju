import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

export default function PremiumScreen() {
  const params = useLocalSearchParams();

  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog");
  const petGender = String(params.petGender ?? "male");
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");
  const isNeutered = String(params.isNeutered ?? "false");

  const petTypeLabel = petType === "cat" ? "고양이" : "강아지";
  const petGenderLabel = petGender === "female" ? "여아" : "남아";
  const petEmoji = petType === "cat" ? "🐱" : "🐶";

  const goBackToResult = () => {
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
    });
  };

  const handlePurchaseAllAccess = () => {
    Alert.alert(
      "결제 연동 전",
      "현재는 실제 인앱결제가 아직 연결되지 않았습니다. 다음 단계에서 Google Play 결제를 붙일 예정입니다."
    );
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

        <Text style={styles.title}>프리미엄 전체 잠금 해제 👑</Text>
        <Text style={styles.subtitle}>
          복잡하게 나누지 않고, 한 번에 모든 프리미엄 기능을 열 수 있어요.
        </Text>

        <View style={styles.heroPriceWrap}>
          <Text style={styles.heroPriceLabel}>출시 기념 가격</Text>
          <Text style={styles.heroPrice}>₩990</Text>
          <Text style={styles.heroPriceSub}>
            성격 분석 · 작명 풀이 · 보호자 궁합 전체 오픈
          </Text>
        </View>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileEmoji}>{petEmoji}</Text>
        <Text style={styles.profileTitle}>{petName}</Text>
        <Text style={styles.profileMeta}>
          {petTypeLabel} · {breed} · {petGenderLabel}
        </Text>
        <Text style={styles.profileSubMeta}>
          생일 {birthDate} · {birthTime}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>이 상품으로 열리는 기능</Text>
        <Text style={styles.summaryText}>
          한 번만 열면 결과 화면의 프리미엄 분석을 전부 바로 볼 수 있어요.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>포함 기능</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>✨</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>타고난 성격 분석</Text>
            <Text style={styles.featureDesc}>
              대표 성향 3가지, 보호자 팁, 오행 무드를 더 깊게 볼 수 있어요.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>✍️</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>작명 풀이 / 이름 추천</Text>
            <Text style={styles.featureDesc}>
              현재 이름의 분위기와 어울리는 추천 이름 후보를 확인할 수 있어요.
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureEmoji}>💞</Text>
          <View style={styles.featureTextWrap}>
            <Text style={styles.featureTitle}>보호자와의 궁합</Text>
            <Text style={styles.featureDesc}>
              생년월일 기준으로 궁합 점수와 관계 팁을 볼 수 있어요.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>이런 분께 잘 맞아요</Text>
        <Text style={styles.bullet}>• 우리 아이 이야기를 더 길고 풍부하게 보고 싶은 보호자</Text>
        <Text style={styles.bullet}>• 단순 오늘 운세보다 성격/이름/궁합까지 보고 싶은 분</Text>
        <Text style={styles.bullet}>• 인스타 공유용으로도 더 재미있는 콘텐츠를 원하는 분</Text>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>프리미엄 전체 상품</Text>
        <Text style={styles.priceTitle}>전체 잠금 해제</Text>
        <Text style={styles.priceValue}>₩990</Text>
        <Text style={styles.priceDescription}>
          한 번만 결제하면 모든 프리미엄 기능을 사용할 수 있는 구조로 기획했어요.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={handlePurchaseAllAccess}
        >
          <Text style={styles.primaryButtonText}>₩990으로 전체 잠금 해제</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.secondaryButton}
        onPress={goBackToResult}
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
  heroPriceWrap: {
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    padding: 16,
  },
  heroPriceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#F2C7A5",
  },
  heroPrice: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroPriceSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
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
    fontSize: 14,
    color: "#6F645C",
    textAlign: "center",
  },
  profileSubMeta: {
    marginTop: 6,
    fontSize: 13,
    color: "#8B8178",
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
    fontSize: 18,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 28,
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
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  featureEmoji: {
    fontSize: 22,
    marginRight: 10,
    marginTop: 1,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5F5752",
  },
  bullet: {
    fontSize: 15,
    color: "#4D4641",
    lineHeight: 24,
    marginBottom: 8,
  },
  priceCard: {
    backgroundColor: "#FFE9D6",
    borderRadius: 22,
    padding: 18,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8B8178",
  },
  priceTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#2E2A27",
  },
  priceValue: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "800",
    color: "#8C5A3C",
  },
  priceDescription: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: "#4D4641",
  },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#2E2A27",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E6D9CF",
  },
  secondaryButtonText: {
    color: "#2E2A27",
    fontSize: 15,
    fontWeight: "800",
  },
});