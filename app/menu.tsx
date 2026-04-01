import Constants from "expo-constants";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function MenuScreen() {
  const appVersion =
    Constants.expoConfig?.version ??
    Constants.manifest2?.extra?.expoClient?.version ??
    "1.0.0";

  return (
    <View style={styles.container}>
      {/* 뒤로가기 */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>← 뒤로</Text>
      </Pressable>

      {/* 앱 정보 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>앱 정보</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>앱 버전</Text>
          <Text style={styles.value}>v{appVersion}</Text>
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.menuList}>
        <Pressable style={styles.menuItem} onPress={() => router.push("/terms")}>
          <Text style={styles.menuText}>이용약관</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>

        <Pressable
          style={styles.menuItem}
          onPress={() => router.push("/privacy")}
        >
          <Text style={styles.menuText}>개인정보처리방침</Text>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  backButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
  },

  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333333",
  },

  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    padding: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
    color: "#111111",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 14,
    color: "#666666",
  },

  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },

  menuList: {
    marginTop: 20,
    backgroundColor: "#F7F7F7",
    borderRadius: 16,
    overflow: "hidden",
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  menuText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111111",
  },

  menuArrow: {
    fontSize: 18,
    color: "#999999",
  },
});