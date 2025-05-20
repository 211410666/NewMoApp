import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
} from "react-native";
import { supabaseClient } from "../lib/supabaseClinet";
import LoadingModal from "../components/LoadingModal";
import dayjs from 'dayjs';

export default function Analysis() {
    const [games, setGames] = useState([]);
    const [users, setUsers] = useState([]);
    const [loadingVisible, setLoadingVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [winMatrix, setWinMatrix] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const calcWinRate = (win, lose, tie) => {
        const total = win + lose + tie;
        if (total === 0) return "0%";
        const rate = (win / total) * 100;
        return `${rate.toFixed(1)}%`;
    };

    const fetchData = async () => {
        setLoadingVisible(true);

        const { data: usersData, error: usersError } = await supabaseClient
            .from("users")
            .select("*")
            .order("score", { ascending: false });

        const { data: gamesData, error: gamesError } = await supabaseClient
            .from("games")
            .select("*")
            .order("create_at", { ascending: false });

        if (usersError) console.error("Users fetch error:", usersError);
        if (gamesError) console.error("Games fetch error:", gamesError);

        if (usersData && gamesData) {
            // 初始化 winMatrix，只初始化以自己為 key，對其他玩家的統計
            const winMatrix = {};
            usersData.forEach(user => {
                winMatrix[user.id] = {};
                usersData.forEach(other => {
                    if (user.id !== other.id) {
                        winMatrix[user.id][other.id] = {
                            wins: 0,
                            losses: 0,
                            draws: 0,
                            winRate: "0.00",
                        };
                    }
                });
            });

            // 將 games 分組 (依 game_id 分組)
            const groupedGames = {};
            gamesData.forEach(game => {
                const key = `${game.game_id}`;
                if (!groupedGames[key]) groupedGames[key] = [];
                groupedGames[key].push(game);
            });

            // 以「自己為中心」計算勝負，自己分數 >0 就算贏，<0 算輸，=0 算平手
            for (const groupKey in groupedGames) {
                const players = groupedGames[groupKey];
                // 對每個玩家當中心計算勝負
                for (const centerPlayer of players) {
                    const centerScore = centerPlayer.score;
                    // 對手們
                    for (const opponent of players) {
                        if (centerPlayer.user_id === opponent.user_id) continue; // 跳過自己

                        if (centerScore > 0) {
                            winMatrix[centerPlayer.user_id][opponent.user_id].wins++;
                        } else if (centerScore < 0) {
                            winMatrix[centerPlayer.user_id][opponent.user_id].losses++;
                        } else {
                            winMatrix[centerPlayer.user_id][opponent.user_id].draws++;
                        }
                    }
                }
            }

            // 計算勝率（贏 / 總場數）
            for (const userA in winMatrix) {
                for (const userB in winMatrix[userA]) {
                    const record = winMatrix[userA][userB];
                    const total = record.wins + record.losses + record.draws;
                    if (total > 0) {
                        record.winRate = (record.wins / total).toFixed(2);
                    }
                }
            }

            // 各玩家統計資料（你的原始碼不變）
            const usersWithStats = usersData.map((user) => {
                const userGames = gamesData.filter((game) => game.user_id === user.id);

                const sortedGames = [...userGames].sort(
                    (a, b) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime()
                );

                let totalRounds = 0;
                let maxLosingStreak = 0;
                let currentLosingStreak = 0;
                let losingStart = null;
                let losingEnd = null;
                let maxLosingStreakStart = null;
                let maxLosingStreakEnd = null;

                let maxWinningStreak = 0;
                let currentWinningStreak = 0;
                let winningStart = null;
                let winningEnd = null;
                let maxWinningStreakStart = null;
                let maxWinningStreakEnd = null;

                for (let i = 0; i < sortedGames.length; i++) {
                    const game = sortedGames[i];
                    const date = game.create_at;
                    totalRounds = totalRounds + game.round;

                    if (game.score < 0) {
                        if (currentLosingStreak === 0) losingStart = date;
                        currentLosingStreak++;
                        losingEnd = date;
                        if (currentLosingStreak > maxLosingStreak) {
                            maxLosingStreak = currentLosingStreak;
                            maxLosingStreakStart = losingStart;
                            maxLosingStreakEnd = losingEnd;
                        }
                        currentWinningStreak = 0;
                        winningStart = null;
                    } else if (game.score > 0) {
                        if (currentWinningStreak === 0) winningStart = date;
                        currentWinningStreak++;
                        winningEnd = date;
                        if (currentWinningStreak > maxWinningStreak) {
                            maxWinningStreak = currentWinningStreak;
                            maxWinningStreakStart = winningStart;
                            maxWinningStreakEnd = winningEnd;
                        }
                        currentLosingStreak = 0;
                        losingStart = null;
                    } else {
                        currentLosingStreak = 0;
                        currentWinningStreak = 0;
                        losingStart = null;
                        winningStart = null;
                    }
                }

                return {
                    ...user,
                    maxLosingStreak,
                    maxLosingStreakStart,
                    maxLosingStreakEnd,
                    maxWinningStreak,
                    maxWinningStreakStart,
                    maxWinningStreakEnd,
                    totalRounds,
                };
            });

            console.log(winMatrix);
            setUsers(usersWithStats);
            setGames(gamesData);
            setWinMatrix(winMatrix);
        }

        setLoadingVisible(false);
    };





    const parseContinueStatus = (status) => {
        if (status > 0) return `+${status}`;
        if (status < 0) return `${status}`;
        return "0";
    };

    const getContinueColor = (status) => {
        if (status > 0) return "green";
        if (status < 0) return "red";
        return undefined; // 不改色
    };
    const getUserGames = (userId) => {
        // 先依 create_at 新到舊排序
        const sortedGames = games.slice().sort((a, b) => new Date(b.create_at) - new Date(a.create_at));
        // 篩選該使用者的遊戲
        return sortedGames.filter((g) => g.user_id === userId);
    };


    const openUserModal = (user) => {
        console.log(winMatrix)
        console.log(user);
        setSelectedUser(user);
        setModalVisible(true);
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setModalVisible(false);
    };

    const colFlex = {
        name: 2,
        score: 2,
        winlose: 2.7,
        continueStatus: 2,
        totalRounds: 1.5,
        winRate: 2,
    };

    return (
        <>
            <View style={{ flex: 1, alignItems: 'center', backgroundColor: '#47779a' }}>
                <LoadingModal visible={loadingVisible} />

                <FlatList
                    data={[...users].sort((a, b) => b.score - a.score)}
                    keyExtractor={(item) => item.id}
                    style={{ width: '100%' }}
                    ListHeaderComponent={
                        <>
                            {/* 表頭 */}
                            <View style={styles.tableHeader}>
                                <Text style={[styles.headerText, { flex: colFlex.name }]}>名稱</Text>
                                <Text style={[styles.headerText, { flex: colFlex.score }]}>總輸贏</Text>
                                <Text style={[styles.headerText, { flex: colFlex.continueStatus }]}>
                                    連勝/連敗
                                </Text>
                                <Text style={[styles.headerText, { flex: colFlex.winRate }]}>勝率</Text>
                            </View>
                        </>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.tableRow} onPress={() => openUserModal(item)}>
                            <Text style={[styles.cellText, { flex: colFlex.name }]}>{item.name}</Text>
                            <Text style={[styles.cellText, { flex: colFlex.score }]}>
                                {item.score > 0 ? "+" : ""}
                                {item.score}
                            </Text>
                            <Text
                                style={[
                                    styles.cellText,
                                    { flex: colFlex.continueStatus, color: getContinueColor(item.continue) },
                                ]}
                            >
                                {parseContinueStatus(item.continue)}
                            </Text>
                            <Text
                                style={[
                                    styles.cellText,
                                    { flex: colFlex.winRate },
                                    (item.wingames + item.losegames + item.tiegames) > 0 &&
                                        item.wingames / (item.wingames + item.losegames + item.tiegames) >= 0.5
                                        ? { color: "green" }
                                        : { color: "red" },
                                ]}
                            >
                                {calcWinRate(item.wingames, item.losegames, item.tiegames)}
                            </Text>
                        </TouchableOpacity>
                    )}
                    ListFooterComponent={
                        <>
                            {/* 單日輸錢排行榜 */}
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📉 單日輸錢排行榜</Text>
                                {games
                                    .sort((a, b) => a.score - b.score)
                                    .slice(0, 5)
                                    .map((game, index) => {
                                        const user = users.find((u) => u.id === game.user_id);
                                        const date = game.create_at.slice(0, 10);
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={game.game_id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={styles.nameText}>{user?.name || "未知玩家"}</Text>
                                                <Text style={styles.scoreText}>-${Math.abs(game.score)}</Text>
                                                <Text style={styles.dateText}>📅 {date}</Text>
                                            </View>
                                        );
                                    })}
                            </View>

                            {/* 單日贏錢排行榜 */}
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📈  單日贏錢排行榜</Text>
                                {games
                                    .sort((a, b) => b.score - a.score)
                                    .slice(0, 5)
                                    .map((game, index) => {
                                        const user = users.find((u) => u.id === game.user_id);
                                        const date = game.create_at.slice(0, 10);
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={game.game_id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={styles.nameText}>{user?.name || "未知玩家"}</Text>
                                                <Text style={[styles.scoreText, { color: 'green' }]}>${Math.abs(game.score)}</Text>
                                                <Text style={styles.dateText}>📅 {date}</Text>
                                            </View>
                                        );
                                    })}
                            </View>
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📉 平均單將輸錢排行榜</Text>
                                {games
                                    .sort((a, b) => (a.score / a.round) - (b.score / b.round))
                                    .slice(0, 5)
                                    .map((game, index) => {
                                        const user = users.find((u) => u.id === game.user_id);
                                        const date = game.create_at.slice(0, 10);
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={game.game_id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={styles.nameText}>{user?.name || "未知玩家"}</Text>
                                                <Text style={styles.scoreText}>-${Math.abs(game.score / game.round).toFixed(1)}</Text>
                                                <Text style={styles.dateText}>📅 {date}</Text>
                                            </View>
                                        );
                                    })}
                            </View>
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📈  平均單將贏錢排行榜</Text>
                                {games
                                    .sort((a, b) => (b.score / b.round) - (a.score / a.round))
                                    .slice(0, 5)
                                    .map((game, index) => {
                                        const user = users.find((u) => u.id === game.user_id);
                                        const date = game.create_at.slice(0, 10);
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={game.game_id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={styles.nameText}>{user?.name || "未知玩家"}</Text>
                                                <Text style={[styles.scoreText, { color: 'green' }]}>+${Math.abs(game.score / game.round).toFixed(1)}</Text>
                                                <Text style={styles.dateText}>📅 {date}</Text>
                                            </View>
                                        );
                                    })}
                            </View>
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📉 連續輸錢排行榜</Text>
                                {users
                                    .sort((a, b) => b.maxLosingStreak - a.maxLosingStreak)
                                    .slice(0, 5)
                                    .map((user, index) => {
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={user.id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={[styles.nameText, { textAlign: 'center' }]}>{user?.name || "未知玩家"}</Text>
                                                <Text style={[styles.scoreText, { textAlign: 'center' }]}>{user.maxLosingStreak}</Text>
                                                <Text style={[styles.dateText, { flex: 4 }]}>📅 {user.maxLosingStreakStart.slice(0, 10)} ~ {user.maxLosingStreakEnd.slice(5, 10)}</Text>
                                            </View>
                                        );
                                    })}
                            </View>
                            <View style={styles.lowestScoresSection}>
                                <Text style={styles.lowestScoresTitle}>📈  連續贏錢排行榜</Text>
                                {users
                                    .sort((a, b) => b.maxWinningStreak - a.maxWinningStreak)
                                    .slice(0, 5)
                                    .map((user, index) => {
                                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // 金銀銅
                                        const isTop3 = index < 3;
                                        return (
                                            <View
                                                key={user.id + index}
                                                style={[
                                                    styles.lowestScoreCard,
                                                    isTop3 && { borderLeftColor: medalColors[index], borderLeftWidth: 4 },
                                                ]}
                                            >
                                                <Text style={styles.rankText}>
                                                    {isTop3 ? ["🥇", "🥈", "🥉"][index] : `${index + 1}.`}
                                                </Text>
                                                <Text style={[styles.nameText, { textAlign: 'center' }]}>{user?.name || "未知玩家"}</Text>
                                                <Text style={[styles.scoreText, { textAlign: 'center', color: 'green' }]}>{user.maxWinningStreak}</Text>
                                                <Text style={[styles.dateText, { flex: 4 }]}>📅 {user.maxWinningStreakStart.slice(0, 10)} ~ {user.maxWinningStreakEnd.slice(5, 10)}</Text>
                                            </View>
                                        );
                                    })}
                            </View>

                            {/* Modal 放在這裡不影響列表滾動 */}
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={closeUserModal}
                            >
                                <TouchableWithoutFeedback onPress={closeUserModal}>
                                    <View style={styles.modalBackground}>
                                        <TouchableWithoutFeedback onPress={() => { }}>
                                            <View style={styles.modalContainer}>
                                                <ScrollView>
                                                    <Text style={styles.modalTitle}>
                                                        玩家詳情：{selectedUser?.name}
                                                    </Text>
                                                    <Text>
                                                        勝場: {selectedUser?.wingames}，敗場: {selectedUser?.losegames}，和局:{" "}
                                                        {selectedUser?.tiegames}
                                                    </Text>
                                                    <Text>
                                                        總場數: {selectedUser?.countgames}，總將數: {selectedUser?.totalRounds}
                                                    </Text>
                                                    {selectedUser && winMatrix[selectedUser.id] && (
                                                        <>
                                                            <Text style={{ marginTop: 10, fontWeight: "bold", fontSize: 18 }}>
                                                                對戰勝率
                                                            </Text>

                                                            {(() => {
                                                                // 找出勝率最高的對手 ID
                                                                const entries = Object.entries(winMatrix[selectedUser.id])
                                                                    .filter(([_, record]) => record.wins + record.losses + record.draws > 0);

                                                                const maxEntry = entries.reduce((max, curr) => {
                                                                    const currRate = parseFloat(curr[1].winRate);
                                                                    const maxRate = parseFloat(max[1].winRate);
                                                                    return currRate > maxRate ? curr : max;
                                                                });

                                                                const maxOpponentId = maxEntry?.[0];

                                                                return entries.map(([opponentId, record]) => {
                                                                    const opponent = users.find(u => u.id === opponentId);
                                                                    const winRateNum = parseFloat(record.winRate);

                                                                    return (
                                                                        <View
                                                                            key={opponentId}
                                                                            style={{
                                                                                backgroundColor: winRateNum >= 0.5 ? "#E8F5E9" : "#FFEBEE",
                                                                                marginVertical: 1,
                                                                                paddingVertical: 6,
                                                                                paddingHorizontal: 12,
                                                                                flexDirection: "row",
                                                                                justifyContent: "space-between",
                                                                                alignItems: "center",
                                                                            }}
                                                                        >
                                                                            <Text style={{ fontWeight: "600", fontSize: 14, color: "#1B5E20" }}>
                                                                                {opponent?.name}
                                                                                {opponentId === maxOpponentId && (
                                                                                    <Text style={{ fontSize: 14 }}>🐼</Text>
                                                                                )}
                                                                            </Text>

                                                                            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
                                                                                <Text style={{ color: "#388E3C", fontWeight: "600", fontSize: 13 }}>勝 {record.wins}</Text>
                                                                                <Text style={{ color: "#D32F2F", fontWeight: "600", fontSize: 13 }}>敗 {record.losses}</Text>
                                                                                <Text style={{ color: "#FBC02D", fontWeight: "600", fontSize: 13 }}>和 {record.draws}</Text>
                                                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>

                                                                                    <Text
                                                                                        style={{
                                                                                            fontWeight: "700",
                                                                                            fontSize: 14,
                                                                                            color: winRateNum >= 0.5 ? "#388E3C" : "#D32F2F",
                                                                                        }}
                                                                                    >
                                                                                        勝率 {record.winRate}
                                                                                    </Text>
                                                                                </View>
                                                                            </View>
                                                                        </View>
                                                                    );
                                                                });
                                                            })()}
                                                        </>
                                                    )}



                                                    <Text style={{ marginTop: 10, fontWeight: "bold" }}>
                                                        最近 10 場牌局
                                                    </Text>

                                                    {getUserGames(selectedUser?.id)
                                                        .slice(0, 10)
                                                        .map((game) => (
                                                            <View key={game.game_id + game.create_at} style={{
                                                                flexDirection: "row",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                paddingVertical: 4,
                                                                paddingHorizontal: 10,
                                                            }}>
                                                                <Text style={{ color: game.score > 0 ? 'green' : game.score < 0 ? 'red' : 'black' }}>
                                                                    輸贏: {game.score > 0 ? "+" : ""}{game.score}
                                                                </Text>
                                                                <Text>將數: {game.round}</Text>
                                                                <Text>
                                                                    時間: {game.create_at.slice(0, 10)}
                                                                </Text>
                                                            </View>
                                                        ))}

                                                    <TouchableOpacity style={styles.closeButton} onPress={closeUserModal}>
                                                        <Text style={{ color: "white", fontWeight: "bold" }}>關閉</Text>
                                                    </TouchableOpacity>
                                                </ScrollView>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                            </Modal>
                        </>
                    }
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e0f2ff",
        padding: 12,
        alignItems: "center", // 水平置中整個畫面內容
    },

    tableHeader: {

        flexDirection: "row",
        backgroundColor: "#b2dfdb",
        paddingVertical: 8,
        borderRadius: 8,
        marginBottom: 6,
        width: "90%",        // 固定寬度
        alignSelf: 'center',
        marginTop: 20,
    },

    headerText: {

        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        flex: 1,             // 每個欄位平均分配寬度
    },

    tableRow: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 4,
        paddingHorizontal: 6,
        width: "90%",        // 跟表頭同寬
        alignSelf: 'center',
    },

    cellText: {
        fontSize: 16,
        textAlign: "center",
        flex: 1,             // 同表頭欄位寬度對應
    },

    lowestScoresSection: {
        width: "90%",
        backgroundColor: "#fff3e0",
        padding: 10,
        borderRadius: 10,
        elevation: 2,
        marginTop: 20,
        alignSelf: 'center',
    },

    lowestScoresTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 6,
    },

    lowestScoreRow: {
        flexDirection: "row",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalContainer: {
        width: "85%",
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 10,
        maxHeight: "80%",
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },

    gameRow: {
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingBottom: 4,
    },

    closeButton: {
        marginTop: 20,
        backgroundColor: "#4caf50",
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: "center",
    },

    lowestScoreCard: {
        backgroundColor: "#fff",
        padding: 10,
        elevation: 2, // Android 陰影
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        flexDirection: "row",
        alignItems: "center",
    },

    rankText: {
        fontSize: 18,
        fontWeight: "bold",
        width: 30,
        textAlign: "center",
    },

    nameText: {
        flex: 2,
        fontSize: 16,
        color: "#2c3e50",
        textAlign: 'center'
    },

    scoreText: {
        flex: 2,
        fontSize: 16,
        color: "#e74c3c",
        fontWeight: "bold",
    },

    dateText: {
        flex: 2,
        fontSize: 14,
        color: "#7f8c8d",
    },
});
