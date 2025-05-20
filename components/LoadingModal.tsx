import React from "react";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";

type LoadingModalProps = {
  visible: boolean;
  message?: string;
};

export default function LoadingModal({ visible, message = "資料讀取中..." }: LoadingModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000080",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 160,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: "#007AFF",
  },
});
