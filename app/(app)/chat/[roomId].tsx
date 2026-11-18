import { useAuthStore } from "@features/auth/presentation/store/authStore";
import { Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, sendError } = useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  useEffect(() => {
    if (sendError) {
      Alert.alert("Error al enviar", sendError);
    }
  }, [sendError]);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tu galería para enviar imágenes.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed && !selectedImageUri) return;

    sendMessage(trimmed, selectedImageUri ?? undefined);
    setInput("");
    setSelectedImageUri(null);
  }, [input, selectedImageUri, sendMessage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
          {!isOwn && <Text style={styles.author}>{item.authorUsername}</Text>}

          {item.imageUrl && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPreviewImageUrl(item.imageUrl!)}
              style={styles.imageWrapper}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.messageImage}
                contentFit="cover"
                transition={200}
              />
              {item.isPending && (
                <View style={styles.pendingOverlay}>
                  <ActivityIndicator color="#fff" size="small" />
                </View>
              )}
            </TouchableOpacity>
          )}

          {!!item.content && (
            <Text style={[styles.text, isOwn && styles.textOwn]}>
              {item.content}
            </Text>
          )}

          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {item.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  const canSend = !!input.trim() || !!selectedImageUri;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMsg}
        contentContainerStyle={{ padding: 12 }}
      />

      {selectedImageUri && (
        <View style={styles.previewBar}>
          <Image
            source={{ uri: selectedImageUri }}
            style={styles.previewThumb}
            contentFit="cover"
          />
          <Text style={styles.previewLabel}>Imagen lista para enviar</Text>
          <TouchableOpacity
            onPress={() => setSelectedImageUri(null)}
            style={styles.removePreviewBtn}
          >
            <Text style={styles.removePreviewText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
          <Ionicons name="camera-outline" size={24} color="#111111" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons name="send" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={!!previewImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImageUrl(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewImageUrl(null)}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {previewImageUrl && (
            <Image
              source={{ uri: previewImageUrl }}
              style={styles.fullImage}
              contentFit="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  row: { flexDirection: "row", marginVertical: 4 },
  rowOwn: { justifyContent: "flex-end" },
  bubble: { maxWidth: "78%", borderRadius: 14, padding: 10 },
  own: { backgroundColor: "#111111" },
  other: { backgroundColor: "#f8f9fb", borderWidth: 1, borderColor: "#eceef2" },
  author: { fontSize: 11, fontWeight: "600", color: "#555", marginBottom: 4 },
  imageWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 4,
    position: "relative",
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 8,
    backgroundColor: "#e5e5e5",
  },
  pendingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { fontSize: 15, color: "#000" },
  textOwn: { color: "#fff" },
  time: { fontSize: 10, color: "#aaa", marginTop: 4, alignSelf: "flex-end" },
  timeOwn: { color: "rgba(255,255,255,0.75)" },
  previewBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  previewThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
  },
  previewLabel: { flex: 1, fontSize: 13, color: "#555" },
  removePreviewBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  removePreviewText: { fontSize: 14, color: "#333", fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#111111",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  fullImage: { width: "100%", height: "80%" },
});
