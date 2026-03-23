import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: "#9A8F86",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="register"
        options={{
          title: "등록",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "기록",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "무료운세",
          tabBarLabel: "무료운세",
          tabBarIcon: () => <Text style={styles.centerEmoji}>🐶</Text>,
          tabBarButton: (props) => {
            const { children, onPress, accessibilityState } = props;
            const focused = accessibilityState?.selected;

            return (
              <Pressable onPress={onPress} style={styles.centerButtonWrap}>
                <View
                  style={[
                    styles.centerButton,
                    focused && styles.centerButtonFocused,
                  ]}
                >
                  {children}
                </View>
              </Pressable>
            );
          },
        }}
      />

      <Tabs.Screen
        name="compatibility"
        options={{
          title: "궁합",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="premium"
        options={{
          title: "프리미엄",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="loading"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="result"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="personality"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="naming"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "#FFFDFB",
    borderTopColor: "#EADFD6",
    borderTopWidth: 1,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  centerButtonWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
  },
  centerButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.accent,
    borderWidth: 4,
    borderColor: "#FFFDFB",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centerButtonFocused: {
    backgroundColor: "#F0B98D",
  },
  centerEmoji: {
    fontSize: 26,
  },
});