import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,
        headerTintColor: "#000000",
        headerTitleStyle: { fontWeight: "bold", color: "#000000" },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Salas de Chat",
          headerRight: () => (
            <TouchableOpacity
              onPress={logout}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#000000",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 8,
                gap: 6,
              }}
            >
              <Ionicons name="log-out-outline" size={16} color="#ffffff" />
              <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600" }}>
                Salir
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="chat/[roomId]" options={{ title: "Chat" }} />
    </Stack>
  );
}
