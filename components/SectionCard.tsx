import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../constants/colors";

type Props = {
  children: ReactNode;
};

export default function SectionCard({ children }: Props) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
  },
});