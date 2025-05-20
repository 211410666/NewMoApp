import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type ErrorModalProps = {
  visible: boolean;
  message: string;
  onClose: () => void;
};

export default function ErrorModal({ visible, message, onClose }: ErrorModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>錯誤</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Text style={styles.btnText}>關閉</Text>
          </TouchableOpacity>
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
    width: 280,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "red" },
  message: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  btn: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  btnText: { color: "white", fontWeight: "bold" },
});
