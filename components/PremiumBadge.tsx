import { StyleSheet, Text, View } from "react-native";

type Props = {
  label?: string;
};

export default function PremiumBadge({ label = "PREMIUM" }: Props) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>👑 {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4D6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F2D18B",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8A5A00",
  },
});