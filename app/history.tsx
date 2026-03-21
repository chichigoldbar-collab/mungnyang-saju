import { ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const FORTUNE_HISTORY_KEY = "mungnyang-fortune-history";

type FortuneHistoryItem = {
  id: string;
  createdAt: string;
  petName: string;
  petType: string;
  petGender: string;
  breed: string;
  age: string;
  summary: string;
  health: string;
  appetite: string;
  mood: string;
  caution: string;
  luckyColor: string;
  luckyItem: string;
  recommendedAction: string;
};

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

function getPetEmoji(petType: string) {
  return petType === "cat" ? "🐱" : "🐶";
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<FortuneHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const saved = await AsyncStorage.getItem(FORTUNE_HISTORY_KEY);

        if (!saved) {
          setHistory([]);
          return;
        }

        const parsed = JSON.parse(saved);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error("운세 기록 불러오기 실패", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>HISTORY</Text>
        </View>
        <Text style={styles.title}>운세 기록 📚</Text>
        <Text style={styles.subtitle}>
          이전에 확인한 우리 아이 운세를 날짜별로 모아볼 수 있어요.
        </Text>
      </View>

      {loading ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>운세 기록을 불러오는 중...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.emptyText}>아직 저장된 운세 기록이 없어요.</Text>
          <Text style={styles.emptySubText}>
            홈에서 반려동물을 등록하고 운세를 보면 자동으로 기록됩니다.
          </Text>
        </View>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <View style={styles.historyTopRow}>
              <Text style={styles.historyName}>
                {getPetEmoji(item.petType)} {item.petName}
              </Text>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
            </View>

            <Text style={styles.metaText}>
              {item.petType === "cat" ? "고양이" : "강아지"} · {item.breed} ·{" "}
              {item.petGender === "female" ? "여아" : "남아"} · {item.age}
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>오늘 한줄 운세</Text>
              <Text style={styles.summaryText}>{item.summary}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>💪 건강운</Text>
              <Text style={styles.bodyText}>{item.health}</Text>

              <Text style={styles.sectionTitle}>🍖 식욕운</Text>
              <Text style={styles.bodyText}>{item.appetite}</Text>

              <Text style={styles.sectionTitle}>😊 기분운</Text>
              <Text style={styles.bodyText}>{item.mood}</Text>

              <Text style={styles.sectionTitle}>⚠️ 주의</Text>
              <Text style={styles.bodyText}>{item.caution}</Text>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>행운 컬러</Text>
                <Text style={styles.miniValue}>{item.luckyColor}</Text>
              </View>

              <View style={styles.miniCard}>
                <Text style={styles.miniLabel}>행운 아이템</Text>
                <Text style={styles.miniValue}>{item.luckyItem}</Text>
              </View>
            </View>

            <View style={styles.actionCard}>
              <Text style={styles.miniLabel}>오늘의 추천 행동</Text>
              <Text style={styles.bodyText}>{item.recommendedAction}</Text>
            </View>
          </View>
        ))
      )}
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2A27",
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#7A6F66",
    lineHeight: 22,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
  },
  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  historyName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E2A27",
    flex: 1,
  },
  dateBadge: {
    backgroundColor: "#FFF0E4",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8C5A3C",
  },
  metaText: {
    marginTop: 8,
    fontSize: 13,
    color: "#7A6F66",
  },
  summaryBox: {
    marginTop: 14,
    backgroundColor: "#FFE9D6",
    borderRadius: 18,
    padding: 14,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#8C5A3C",
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 24,
  },
  infoCard: {
    marginTop: 14,
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 14,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "800",
    color: "#2E2A27",
  },
  bodyText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 22,
    color: "#4D4641",
  },
  bottomRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  miniCard: {
    flex: 1,
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 14,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#8B8178",
    marginBottom: 6,
  },
  miniValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#2E2A27",
    lineHeight: 22,
  },
  actionCard: {
    marginTop: 14,
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 14,
  },
});