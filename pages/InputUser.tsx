import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView,Dimensions  } from "react-native";
import Common_styles from "../styles/common_style";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import LoadingModal from "../components/LoadingModal";
import { supabaseClient } from "../lib/supabaseClinet";

export default function InputUser() {
    const [playerName, setPlayerName] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [existingPlayers, setExistingPlayers] = useState<string[]>([]);
    const screenWidth = Dimensions.get('window').width;

    const fetchPlayers = async () => {
        const { data, error } = await supabaseClient
            .from("users")
            .select("name")
            .order("name", { ascending: true });

        if (!error && data) {
            // data 是陣列，每筆有 .name 屬性
            setExistingPlayers(data.map((item) => item.name));
        }
    };

    useEffect(() => {
        fetchPlayers();
    }, []);
    const handleSubmit = async () => {
        const trimmedName = playerName.trim();

        if (!trimmedName) {
            setMessage("玩家姓名不可為空白");
            setErrorVisible(true);
            return;
        }

        setLoadingVisible(true);

        try {
            // 檢查是否已存在
            const { data, error } = await supabaseClient
                .from("users")
                .select("name")
                .eq("name", trimmedName)
                .limit(1)
                .single();

            if (error && error.code !== "PGRST116") {
                setMessage("資料庫連線失敗! 請聯繫管理員");
                setErrorVisible(true);
                return
            }

            if (data) {
                setLoadingVisible(false);
                setMessage("玩家名稱已存在! 請重新輸入");
                setErrorVisible(true);
                return;
            }

            // 不存在，新增資料
            const { error: insertError } = await supabaseClient
                .from("users")
                .insert({ name: trimmedName });

            setLoadingVisible(false);

            if (insertError) {
                setMessage("新增玩家失敗，請稍後再試");
                setErrorVisible(true);
                return;
            }

            setMessage("新增玩家成功！");
            setSuccessVisible(true);
            setPlayerName("");

        } catch (err) {
            setLoadingVisible(false);
            setMessage("發生錯誤，請稍後再試");
            setErrorVisible(true);
        }
        fetchPlayers();
    };
    const renderPlayerItem = ({ item }: { item: string }) => (
        <View style={Common_styles.cell}>
            <Text style={Common_styles.cellText}>{item}</Text>
        </View>
    );
    const chunkArray = (arr: string[], chunkSize: number) => {
        const result = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            result.push(arr.slice(i, i + chunkSize));
        }
        return result;
    };

    const playersInRows = chunkArray(existingPlayers, 3);


    return (
        <View style={[Common_styles.container]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}>
                {/* 上方區塊 30%，垂直置中 */}
                <View style={{ justifyContent: "center", alignItems: "center" ,width:screenWidth }}>
                    <Text style={Common_styles.title}>新增玩家</Text>

                    <TextInput
                        placeholder="請輸入玩家姓名"
                        placeholderTextColor={"#666666"}
                        value={playerName}
                        onChangeText={setPlayerName}
                        style={Common_styles.input}
                    />

                    <TouchableOpacity onPress={handleSubmit} style={Common_styles.submitBtn}>
                        <Text style={Common_styles.submitBtnText}>送出</Text>
                    </TouchableOpacity>
                </View>

                {/* 下方區塊 70%，靠上對齊，並加上 marginTop 做間隔 */}
                <View style={{ flex: 7, justifyContent: "flex-start", alignItems: "center", marginTop: 50 }}>
                    <Text style={Common_styles.title}>已存在於資料庫的玩家</Text>

                    {playersInRows.map((row, rowIndex) => (
                        <View key={rowIndex} style={Common_styles.row}>
                            {row.map((player, colIndex) => (
                                <View key={colIndex} style={Common_styles.cell}>
                                    <Text style={Common_styles.cellText}>{player}</Text>
                                </View>
                            ))}
                            {row.length < 3 &&
                                Array(3 - row.length)
                                    .fill(null)
                                    .map((_, i) => <View key={"empty-" + i} style={Common_styles.cell} />)}
                        </View>
                    ))}
                </View>
            </ScrollView>

            <ErrorModal
                visible={errorVisible}
                message={message}
                onClose={() => setErrorVisible(false)}
            />
            <SuccessModal
                visible={successVisible}
                message={message}
                onClose={() => setSuccessVisible(false)}
            />
            <LoadingModal visible={loadingVisible} />
        </View>
    );


}
