import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { v4 as uuidv4 } from "uuid";
import Common_styles from "../styles/common_style";
import AddPlayerModal from "../components/AddPlayerModal";
import SelectRoundModal from "../components/SelectRoundModal";
import LoadingModal from "../components/LoadingModal";
import ErrorModal from "../components/ErrorModal";
import SuccessModal from "../components/SuccessModal";
import { supabaseClient } from "../lib/supabaseClinet";

export default function InputGame() {
    const [gameId, setGameId] = useState("");
    const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
    const [showSelectRoundModal, setShowSelectRoundModal] = useState(false);
    const [errorVisible, setErrorVisible] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [games, setGames] = useState<any[]>([]);
    const [selectRounds, setSelectRounds] = useState(0);
    const [selectUsers, setSelectUsers] = useState<{ id: string; name: string; score: string }[]>([]);

    // 產生並檢查不重複的 gameId
    const generateUniqueGameId = async () => {
        setLoadingVisible(true);
        let newId = "";
        let exists = true;

        while (exists) {
            newId = uuidv4();
            const { data, error } = await supabaseClient
                .from("games")
                .select("game_id")
                .eq("game_id", newId)
                .limit(1);

            if (error) {
                console.error("Error checking game_id:", error);
                exists = false; // 避免死循環
            } else if (data && data.length === 0) {
                exists = false;
            }
        }

        setGameId(newId);
        setLoadingVisible(false);
    };

    // 抓取 users 和 games 資料
    const fetchData = async () => {
        setLoadingVisible(true);
        try {
            const { data: usersData, error: usersError } = await supabaseClient.from("users").select("*");
            const { data: gamesData, error: gamesError } = await supabaseClient.from("games").select("*");

            if (usersError || gamesError) {
                console.error("Fetch error:", usersError || gamesError);
            } else {
                setUsers(usersData || []);
                setGames(gamesData || []);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        } finally {
            setLoadingVisible(false);
        }
    };

    useEffect(() => {
        fetchData().then(() => {
            generateUniqueGameId();
        });
    }, []);

    // 當選擇玩家時，把選擇的 users 加入 selectUsers 並初始化 score 為空字串
    const handleSelectUsers = (selectedUsers: any[]) => {
        const initialized = selectedUsers.map((u) => ({
            id: u.id,
            name: u.name,
            score: "",
        }));
        setSelectUsers(initialized);
    };

    // 輸入輸贏分數的處理
    const onScoreChange = (id: string, value: string) => {
        // 只允許輸入正負整數，空字串也允許
        if (value === "" || /^-?\d*$/.test(value)) {
            setSelectUsers((prev) =>
                prev.map((user) => (user.id === id ? { ...user, score: value } : user))
            );
        }
    };
    const handleSubmit = async () => {
        const now = new Date();
        const taipeiTime = now.toLocaleString("sv-SE", {
            timeZone: "Asia/Taipei",
            hour12: false,
        }).replace(" ", "T") + "+08:00";


        if (selectRounds === 0) {
            setMessage("尚未選擇將數");
            setErrorVisible(true);
            return;
        }

        // 檢查輸入分數是否合法且不空白
        for (const user of selectUsers) {
            if (user.score === "" || !/^-?\d+$/.test(user.score)) {
                setMessage(`玩家 ${user.name} 的輸贏分數輸入不合法，請輸入非空的整數`);
                setErrorVisible(true);
                return;
            }
        }

        // 總分檢查
        const totalScore = selectUsers.reduce((sum, user) => sum + parseInt(user.score, 10), 0);
        if (totalScore + selectRounds * 100 !== 0) {
            setMessage(
                `目前書總和為 ${totalScore + selectRounds * 100}`
            );
            setErrorVisible(true);
            return;
        }

        setLoadingVisible(true);
        try {
            // 1. Insert 多筆資料到 games 表
            for (const user of selectUsers) {
                const { error } = await supabaseClient.from("games").insert([
                    {
                        game_id: gameId,
                        user_id: user.id,
                        score: parseInt(user.score, 10),
                        round: selectRounds,
                    },
                ]);
                if (error) {
                    throw error;
                }
            }

            // 2. 逐一更新 users 表
            for (const user of selectUsers) {
                // 先抓出該 user 目前的紀錄
                const { data: userData, error: fetchError } = await supabaseClient
                    .from("users")
                    .select("*")
                    .eq("id", user.id)
                    .single();

                if (fetchError) throw fetchError;

                // 對現有欄位做運算
                const oldScore = userData.score || 0;
                const oldWinGames = userData.wingames || 0;
                const oldLoseGames = userData.losegames || 0;
                const oldTieGames = userData.tiegames || 0;
                const oldCountGame = userData.countgames || 0;
                const oldRound = userData.round || 0;
                const oldContinue = userData.continue || 0;

                const scoreChange = parseInt(user.score, 10);
                const newScore = oldScore + scoreChange;
                const newCountGame = oldCountGame + 1;
                const newRound = oldRound + selectRounds;

                let newWinGames = oldWinGames;
                let newLoseGames = oldLoseGames;
                let newTieGames = oldTieGames;
                let newContinue = oldContinue;

                // 計算輸贏局數
                if (scoreChange > 0) newWinGames++;
                else if (scoreChange < 0) newLoseGames++;
                else newTieGames++;

                // 計算連勝/連敗 (continue)
                if (scoreChange > 0) {
                    newContinue = oldContinue >= 0 ? oldContinue + 1 : 1;
                } else if (scoreChange < 0) {
                    newContinue = oldContinue > 0 ? -1 : oldContinue - 1;
                } else {
                    newContinue = 0;
                }

                // 更新 users 表
                const { error: updateError } = await supabaseClient
                    .from("users")
                    .update({
                        score: newScore,
                        wingames: newWinGames,
                        losegames: newLoseGames,
                        tiegames: newTieGames,
                        countgames: newCountGame,
                        round: newRound,
                        continue: newContinue,
                        updated_at: taipeiTime,
                    })
                    .eq("id", user.id);

                if (updateError) {
                    throw updateError;
                }
            }

            setMessage("資料送出成功");
            setSelectUsers([]);
            setSelectRounds(0);
            generateUniqueGameId();
            setSuccessVisible(true);
        } catch (error) {
            console.error(error);
            setMessage("資料送出失敗，請稍後再試");
            setErrorVisible(true);
        } finally {
            setLoadingVisible(false);
        }
    };

    return (
        <View style={Common_styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 30, flexGrow: 1 }}>
                <Text style={[Common_styles.title, { marginBottom: 0 }]}>牌局ID</Text>
                <Text style={Common_styles.gameIdText}>{gameId}</Text>

                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginTop: 20,
                        gap: 30,
                    }}
                >
                    <TouchableOpacity
                        style={[Common_styles.submitBtn, { width: "45%" }]}
                        onPress={() => setShowAddPlayerModal(true)}
                    >
                        <Text style={Common_styles.submitBtnText}>新增玩家</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[Common_styles.submitBtn, { width: "45%" }]}
                        onPress={() => setShowSelectRoundModal(true)}
                    >
                        <Text style={Common_styles.submitBtnText}>
                            {selectRounds !== 0 ? `將數: ${selectRounds}` : "選擇將數"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 如果 selectUsers 有東西，渲染表格 */}
                {selectUsers.length > 0 && (
                    <View style={{ marginTop: 30 }}>
                        {/* 表頭 */}
                        <View style={[Common_styles.row, { marginBottom: 8 }]}>
                            <Text style={[Common_styles.tableHeader, { flex: 1 }]}>姓名</Text>
                            <Text style={[Common_styles.tableHeader, { flex: 2 }]}>輸贏</Text>
                        </View>

                        {/* 表格內容 */}
                        {selectUsers.map((user) => (
                            <View key={user.id} style={[Common_styles.row, { marginBottom: 10 }]}>
                                {/* 先用一個包裹的 View 讓 flex:1 + 置中 */}
                                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={Common_styles.tableCell}>{user.name}</Text>
                                </View>

                                <TextInput
                                    style={[Common_styles.textInput, { flex: 2 }]}
                                    value={user.score}
                                    onChangeText={(text) => onScoreChange(user.id, text)}
                                    placeholder=""
                                    placeholderTextColor="#9ccc65"
                                />
                            </View>
                        ))}
                        <View style={{ flex: 1, alignItems: "center", marginTop: 30, }}>
                            <TouchableOpacity
                                style={[Common_styles.submitBtn, { width: "45%" }]}
                                onPress={handleSubmit}
                            >
                                <Text style={Common_styles.submitBtnText}>
                                    送出
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


            </ScrollView>

            {/* Modals */}
            <AddPlayerModal
                visible={showAddPlayerModal}
                onClose={() => setShowAddPlayerModal(false)}
                users={users}
                onSelectUsers={handleSelectUsers} // 用這個函式處理選擇玩家
            />
            <SelectRoundModal
                visible={showSelectRoundModal}
                onClose={() => setShowSelectRoundModal(false)}
                onSelectRound={(num) => {
                    setSelectRounds(num);
                }}
            />
            <LoadingModal visible={loadingVisible} />
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
        </View>
    );
}
