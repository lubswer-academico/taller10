import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="person-outline" size={28} color="#ffffff" />
          </View>
          <Text style={styles.title}>Bienvenido</Text>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#888888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => login({ email, password })}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" style={styles.link}>
          ¿No tienes cuenta? Regístrate
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  card: {
    backgroundColor: "#f8f9fb",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eceef2",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111111",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e3e8",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: "#111111",
  },
  button: {
    backgroundColor: "#111111",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#ffffff", fontWeight: "600", fontSize: 16 },
  error: { color: "red", marginBottom: 12, textAlign: "center" },
  link: {
    marginTop: 16,
    textAlign: "center",
    color: "#000000",
    fontWeight: "500",
  },
});
