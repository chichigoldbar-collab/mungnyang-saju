import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>이용약관</Text>

      <Text style={styles.text}>
        제1조 (목적)
        {"\n"}
        본 약관은 멍냥사주 앱(이하 "서비스")의 이용과 관련하여 서비스 제공자와 이용자 간의 권리,
        의무 및 책임사항을 규정함을 목적으로 합니다.
        {"\n\n"}
        제2조 (서비스 내용)
        {"\n"}
        본 서비스는 반려동물 운세, 이름 추천, 궁합 분석 등 콘텐츠를 제공합니다.
        {"\n\n"}
        제3조 (이용자의 책임)
        {"\n"}
        이용자는 본 서비스를 참고용으로 이용해야 하며, 제공되는 결과를 절대적 판단 기준으로
        사용해서는 안 됩니다.
        {"\n\n"}
        제4조 (유료 서비스)
        {"\n"}
        서비스 내 일부 기능은 프리미엄 결제를 통해 제공될 수 있습니다.
        {"\n\n"}
        제5조 (면책)
        {"\n"}
        서비스에서 제공하는 정보는 मनोर मनोर용 및 참고용이며, 서비스 제공자는 그 결과에 대한
        직접적 또는 간접적 책임을 지지 않습니다.
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