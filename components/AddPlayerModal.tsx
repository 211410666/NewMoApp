import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import Common_styles from "../styles/common_style";

interface User {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  users: User[];
  onSelectUsers: (selectedUsers: User[]) => void;
}

export default function AddPlayerModal({ visible, onClose, users, onSelectUsers }: Props) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) {
      setSelectedUserIds([]);
    }
  }, [visible]);

  const toggleSelectUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  const confirmSelection = () => {
    const selectedUsers = users.filter((u) => selectedUserIds.includes(u.id));
    onSelectUsers(selectedUsers);
    onClose();
  };

  // 將 users 拆成多欄，這裡示範一行 3 個
  const chunkSize = 3;
  const rows: User[][] = [];
  for (let i = 0; i < users.length; i += chunkSize) {
    rows.push(users.slice(i, i + chunkSize));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={Common_styles.modalOverlay}>
        <View style={[Common_styles.modalContent, { marginTop: 50, maxHeight: "80%" }]}>
          <Text style={Common_styles.modalTitle}>新增玩家</Text>

          <View style={{ flex: 7, justifyContent: "flex-start", alignItems: "center", marginTop: 20 }}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={Common_styles.row}>
                {row.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        Common_styles.cell,
                        {
                          borderColor: isSelected ? "#FF7F00" : "#ccc",
                          backgroundColor: isSelected ? "#FF7F00" : "transparent",
                        },
                      ]}
                      onPress={() => toggleSelectUser(user.id)}
                    >
                      <Text style={[Common_styles.cellText, { color: isSelected ? "white" : "black" }]}>
                        {user.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {/* 補齊空白格子（如果該列不足3個） */}
                {row.length < chunkSize &&
                  Array(chunkSize - row.length)
                    .fill(null)
                    .map((_, i) => <View key={"empty-" + i} style={Common_styles.cell} />)}
              </View>
            ))}
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
            <TouchableOpacity onPress={onClose} style={Common_styles.button}>
              <Text style={Common_styles.buttonText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmSelection} style={[Common_styles.button, { backgroundColor: "#FF7F00" }]}>
              <Text style={[Common_styles.buttonText, { color: "white" }]}>確定</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
