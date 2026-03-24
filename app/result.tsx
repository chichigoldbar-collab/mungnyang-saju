import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from "react-native";
import { captureRef } from "react-native-view-shot";

import AppButton from "../components/AppButton";
import SectionCard from "../components/SectionCard";
import { COLORS } from "../constants/colors";

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const captureViewRef = useRef<View>(null);

  const petId = String(params.petId ?? "");
  const petName = String(params.petName ?? "코코");
  const petType = String(params.petType ?? "dog");
  const petGender = String(params.petGender ?? "male");
  const isNeutered = String(params.isNeutered ?? "false");
  const breed = String(params.breed ?? "품종 미입력");
  const birthDate = String(params.birthDate ?? "생일 미입력");
  const birthTime = String(params.birthTime ?? "시간 모름");

  const summary = String(
    params.summary ?? `${petName}의 오늘 운세가 생성되었어요.`
  );
  const health = String(params.health ?? "건강운 분석 완료");
  const appetite = String(params.appetite ?? "식욕운 분석 완료");
  const mood = String(params.mood ?? "기분운 분석 완료");
  const caution = String(params.caution ?? "주의 포인트 분석 완료");
  const luckyColor = String(params.luckyColor ?? "크림 베이지");
  const luckyItem = String(params.luckyItem ?? "폭신한 담요");
  const recommendedAction = String(
    params.recommendedAction ?? "오늘은 짧고 기분 좋은 놀이를 해보세요."
  );

  const shareText = `[${petName}의 오늘 운세]
${summary}

💛 기분운: ${mood}
🍖 식욕운: ${appetite}
🩺 건강운: ${health}
⚠️ 주의 포인트: ${caution}
🎨 행운 컬러: ${luckyColor}
🎁 행운 아이템: ${luckyItem}

추천 행동
${recommendedAction}`;

  const captureResultImage = async () => {
    if (!captureViewRef.current) {
      throw new Error("capture view ref not found");
    }

    const uri = await captureRef(captureViewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });

    return uri;
  };

  const handleTextShare = async () => {
    try {
      await Share.share({ message: shareText });
    } catch (error) {
      console.error("문구 공유 실패", error);
    }
  };

  const handleSaveImage = async () => {
    try {
      if (Platform.OS === "web") {
        Alert.alert("안내", "웹에서는 이미지 저장 기능이 제한될 수 있어요.");
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync(true, ["photo"]);

      if (!permission.granted) {
        Alert.alert("권한 필요", "이미지를 저장하려면 사진 권한이 필요해요.");
        return;
      }

      const uri = await captureResultImage();

      const asset = await MediaLibrary.createAssetAsync(uri);

      try {
        await MediaLibrary.createAlbumAsync("Pictures", asset, false);
      } catch {
        // 앨범이 이미 있거나 생성 실패해도 asset 자체는 저장됨
      }

      Alert.alert("저장 완료", "운세 이미지를 사진첩에 저장했어요.");
    } catch (error) {
      console.error("이미지 저장 실패", error);
      Alert.alert("실패", "이미지를 저장하지 못했어요.");
    }
  };

  const handleImageShare = async () => {
    try {
      if (Platform.OS === "web") {
        await handleTextShare();
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        await handleTextShare();
        return;
      }

      const uri = await captureResultImage();
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("이미지 공유 실패", error);
      await handleTextShare();
    }
  };

  const goToPersonality = () => {
    router.push({
      pathname: "/(tabs)/personality",
      params: {
        petId,
        petName,
        petType,
        petGender,
        isNeutered,
        breed,
        birthDate,
        birthTime,
      },
    });
  };

  const goToNaming = () => {
    router.push({
      pathname: "/(tabs)/naming",
      params: {
        petId,
        petName,
        petType,
        petGender,
        isNeutered,
        breed,
        birthDate,
        birthTime,
      },
    });
  };

  const goToCompatibility = () => {
    router.push("/(tabs)/compatibility");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View ref={captureViewRef} collapsable={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🐾 오늘의 운세</Text>
          <Text style={styles.headerSub}>
            {petName}의 오늘 흐름을 확인해보세요
          </Text>
        </View>

        <SectionCard>
          <View style={styles.todayFortuneCard}>
            <View style={styles.todayTopRow}>
              <View>
                <Text style={styles.todayLabel}>TODAY FORTUNE</Text>
                <Text style={styles.petName}>{petName}</Text>
              </View>

              <View style={styles.petBadge}>
                <Text style={styles.petBadgeText}>
                  {petType === "cat" ? "🐱 고양이" : "🐶 강아지"}
                </Text>
              </View>
            </View>

            <Text style={styles.todaySummary}>{summary}</Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>오늘의 상세 운세</Text>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>💛 기분운</Text>
            <Text style={styles.statDesc}>{mood}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>🍖 식욕운</Text>
            <Text style={styles.statDesc}>{appetite}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>🩺 건강운</Text>
            <Text style={styles.statDesc}>{health}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>⚠️ 주의 포인트</Text>
            <Text style={styles.statDesc}>{caution}</Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>행운 포인트</Text>

          <View style={styles.luckyWrap}>
            <View style={styles.luckyPill}>
              <Text style={styles.luckyPillLabel}>행운 컬러</Text>
              <Text style={styles.luckyPillValue}>{luckyColor}</Text>
            </View>

            <View style={styles.luckyPill}>
              <Text style={styles.luckyPillLabel}>행운 아이템</Text>
              <Text style={styles.luckyPillValue}>{luckyItem}</Text>
            </View>
          </View>

          <View style={styles.recommendBox}>
            <Text style={styles.recommendTitle}>추천 행동</Text>
            <Text style={styles.recommendDesc}>{recommendedAction}</Text>
          </View>
        </SectionCard>
      </View>

      <SectionCard>
        <Text style={styles.sectionTitle}>저장 / 공유</Text>

        <View style={styles.actionGroup}>
          <AppButton title="이미지 저장" onPress={handleSaveImage} />
          <AppButton
            title="이미지 공유하기"
            onPress={handleImageShare}
            variant="secondary"
          />
          <AppButton
            title="문구 공유하기"
            onPress={handleTextShare}
            variant="outline"
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>추가 분석</Text>

        <Pressable style={styles.linkCard} onPress={goToPersonality}>
          <Text style={styles.linkCardTitle}>🔥 성격 분석</Text>
          <Text style={styles.linkCardDesc}>
            타고난 성향과 행동 패턴을 분석해요
          </Text>
        </Pressable>

        <Pressable style={styles.linkCard} onPress={goToNaming}>
          <Text style={styles.linkCardTitle}>✍️ 이름 풀이</Text>
          <Text style={styles.linkCardDesc}>이름에 담긴 기운을 분석해요</Text>
        </Pressable>

        <Pressable style={styles.linkCard} onPress={goToCompatibility}>
          <Text style={styles.linkCardTitle}>💞 보호자 궁합</Text>
          <Text style={styles.linkCardDesc}>
            보호자와의 관계 흐름을 분석해요
          </Text>
        </Pressable>
      </SectionCard>

      <AppButton
        title="홈으로 돌아가기"
        onPress={() => router.replace("/(tabs)")}
      />
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
    paddingBottom: 44,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.text,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subText,
  },
  todayFortuneCard: {
    backgroundColor: "#FFF5EB",
    borderRadius: 20,
    padding: 18,
  },
  todayTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.secondary,
    letterSpacing: 0.6,
  },
  petName: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  petBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  petBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.text,
  },
  todaySummary: {
    marginTop: 16,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: "#F7F2ED",
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  statTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  statDesc: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.subText,
  },
  luckyWrap: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  luckyPill: {
    flex: 1,
    backgroundColor: "#F7F2ED",
    borderRadius: 16,
    padding: 14,
  },
  luckyPillLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.muted,
  },
  luckyPillValue: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  recommendBox: {
    marginTop: 12,
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: 14,
  },
  recommendTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  recommendDesc: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.subText,
  },
  actionGroup: {
    gap: 10,
  },
  linkCard: {
    marginTop: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F7F2ED",
  },
  linkCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  linkCardDesc: {
    marginTop: 4,
    fontSize: 13,
    color: COLORS.subText,
  },
});