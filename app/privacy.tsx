import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>개인정보처리방침</Text>

      <Text style={styles.text}>
        멍냥사주 앱은 이용자의 개인정보를 소중하게 생각합니다.
        {"\n\n"}
        1. 수집 정보
        {"\n"}
        본 앱은 회원가입 기능 없이 이용 가능하며, 이용자가 입력한 반려동물 정보는 앱 기능 제공을 위해
        기기 내 저장소에 저장될 수 있습니다.
        {"\n\n"}
        2. 광고 및 외부 서비스
        {"\n"}
        본 앱은 Google AdMob 등의 광고 서비스를 사용할 수 있으며, 이 과정에서 광고 식별자 등 일부 정보가
        자동 수집될 수 있습니다.
        {"\n\n"}
        3. 이용 목적
        {"\n"}
        수집 또는 저장된 정보는 서비스 제공, 기능 개선, 광고 제공을 위해 사용됩니다.
        {"\n\n"}
        4. 제3자 제공
        {"\n"}
        법령에 따른 경우를 제외하고, 이용자의 정보를 임의로 판매하거나 외부에 제공하지 않습니다.
        {"\n\n"}
        5. 문의
        {"\n"}
        개인정보 관련 문의는 추후 제공되는 연락처를 통해 접수할 수 있습니다.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
    color: "#111111",
  },
  text: {
    fontSize: 14,
    lineHeight: 24,
    color: "#333333",
  },
});