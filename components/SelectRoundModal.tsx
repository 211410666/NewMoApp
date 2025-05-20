import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import Common_styles from "../styles/common_style";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelectRound: (round: number) => void; // 新增選擇回呼
}

export default function SelectRoundModal({ visible, onClose, onSelectRound }: Props) {
    // 產生 1~15 的數字陣列，並分成三欄的二維陣列 (5列)
    const rounds = Array.from({ length: 15 }, (_, i) => i + 1);
    const roundsInRows: number[][] = [];
    for (let i = 0; i < rounds.length; i += 3) {
        roundsInRows.push(rounds.slice(i, i + 3));
    }

    const handlePress = (num: number) => {
        onSelectRound(num);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={Common_styles.modalOverlay}>
                <View style={[Common_styles.modalContent, { marginTop: 50 }]}>
                    <Text style={Common_styles.modalTitle}>選擇將數</Text>

                    <View style={{ flex: 7, justifyContent: "flex-start", alignItems: "center", marginTop: 20 }}>
                        {roundsInRows.map((row, rowIndex) => (
                            <View key={rowIndex} style={Common_styles.row}>
                                {row.map((num, colIndex) => (
                                    <TouchableOpacity
                                        key={colIndex}
                                        style={Common_styles.cell}
                                        onPress={() => handlePress(num)}
                                    >
                                        <Text style={Common_styles.cellText}>{num}</Text>
                                    </TouchableOpacity>
                                ))}
                                {/* 補齊空白格子（如果該列不足3個） */}
                                {row.length < 3 &&
                                    Array(3 - row.length)
                                        .fill(null)
                                        .map((_, i) => <View key={"empty-" + i} style={Common_styles.cell} />)}
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity onPress={onClose} style={Common_styles.button}>
                        <Text style={Common_styles.buttonText}>關閉</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
