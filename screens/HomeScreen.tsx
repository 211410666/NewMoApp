import React, { useState } from "react";
import { supabaseClient } from "../lib/supabaseClinet";
import { View, Text, TouchableOpacity } from "react-native";
import Analysis from "../pages/Analysis";
import History from "../pages/History";
import InputGame from "../pages/InputGame";
import InputUser from "../pages/InputUser";
import common_styles from '../styles/common_style'
const tabs = [
    { name: '牌局輸入' },
    { name: '數據統計' },
    { name: '歷史紀錄' },
    { name: '新增玩家' },
]

export default function HomeScreen() {
    const [activeTab, setActiveTab] = useState('牌局輸入')

    const renderContent = () => {
        switch (activeTab) {
            case '牌局輸入': return <InputGame />
            case '數據統計': return <Analysis />
            case '歷史紀錄': return <History />
            case '新增玩家': return <InputUser />
        }
    }
    return (
        <View style={{ flex: 1 }}>
            <View style={common_styles.toolbar}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab.name}
                        style={[
                            common_styles.tabButton,
                            activeTab === tab.name && common_styles.activeTabButton,
                        ]}
                        onPress={() => setActiveTab(tab.name)}
                    >
                        <Text
                            style={[
                                common_styles.tabText,
                                activeTab === tab.name && common_styles.activeTabText,
                            ]}
                        >
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{ flex: 1 }}>{renderContent()}</View>
        </View>
    );
}

