import { Room } from "@features/chat/domain/entities/Message";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function getRoomInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}

export default function RoomsScreen() {
  const { rooms, isLoading, createRoom, isCreating, createError } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  };

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={styles.roomItem}
      activeOpacity={0.75}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatarBox}>
        <Text style={styles.avatarText}>{getRoomInitials(item.name)}</Text>
      </View>
      <Text style={styles.roomName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.roomDate}>{item.createdAt.toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          rooms.length === 0 && { flexGrow: 1 },
        ]}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.empty}>No hay salas aún. ¡Crea una!</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Nueva sala</Text>
            {createError && <Text style={styles.dialogError}>{createError}</Text>}
            <TextInput
              style={styles.dialogInput}
              placeholder="Nombre de la sala"
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
            />
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, isCreating && { opacity: 0.6 }]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.createText}>Crear</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  separator: { height: 12 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { color: "#999", fontSize: 16 },
  roomItem: {
    backgroundColor: "#f8f9fb",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceef2",
    flexDirection: "row",
    alignItems: "center",
  },
  roomName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
    marginHorizontal: 12,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    includeFontPadding: false,
  },
  roomDate: { fontSize: 11, color: "#888888" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    backgroundColor: "#000000",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: "#fff", fontSize: 28, lineHeight: 32 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  dialogTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  dialogError: { color: "red", fontSize: 13, marginBottom: 8 },
  dialogInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  dialogActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  cancelBtn: { padding: 10 },
  cancelText: { color: "#666", fontSize: 15 },
  createBtn: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});

