import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { supabaseClient } from "../lib/supabaseClinet";
import LoadingModal from "../components/LoadingModal";
export default function History() {
    const [groupedGames, setGroupedGames] = useState([]);
    const [loadingVisible, setLoadingVisible] = useState(false);
    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        setLoadingVisible(true);
        const { data, error } = await supabaseClient
            .from("games")
            .select("game_id, score, create_at, round, users(name)")
            .order("create_at", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            setLoadingVisible(false);
            return;
        }

        if (data) {
            const grouped = Object.values(
                data.reduce((acc, row) => {
                    const name = row.users?.name ?? "未知玩家";
                    if (!acc[row.game_id]) {
                        acc[row.game_id] = {
                            game_id: row.game_id,
                            create_at: row.create_at,
                            round: row.round,
                            players: [],
                        };
                    }
                    acc[row.game_id].players.push({ name, score: row.score });
                    return acc;
                }, {} as Record<string, any>)
            );

            setGroupedGames(grouped);
        }
        setLoadingVisible(false);
    };

    return (
        <ScrollView style={styles.container}>
            {groupedGames.map((group, index) => (
                <View key={index} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.date}>
                            {group.create_at.slice(0, 10)}
                        </Text>
                        <Text style={styles.round}>{group.round} 將</Text>
                    </View>
                    <View style={styles.cardBody}>
                        {group.players.map((p, i) => (
                            <View key={i} style={styles.row}>
                                <Text style={styles.name}>{p.name}</Text>
                                <Text
                                    style={[
                                        styles.score,
                                        { color: p.score > 0 ? 'green' : p.score < 0 ? 'red' : 'gray' }
                                    ]}
                                >
                                    {p.score > 0 ? `+${p.score}` : p.score}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
            
            <LoadingModal visible={loadingVisible} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 30,
        backgroundColor: '#e0f2ff'
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#444", // 深灰色邊框
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#6289af", // 深藍底
        padding: 8,
        borderBottomWidth: 1,
        borderColor: "#444", // 底線邊框
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    date: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
    },
    round: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 18,
    },
    cardBody: {

    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderColor: "#ccc",
    },
    name: {
        fontSize: 16,
        padding: 10,
    },
    score: {
        fontSize: 16,
        fontWeight: "bold",
        padding: 10,
    },
});
