import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const Colors = {
  ButtonDf: "#fff",
  Button: "#a6c6ed",
  SubmitButton: "#4a7aba",
  Box: "#b4e0f3",
  secondary: "#f59e0b",
  background: "#e0f2ff",
  Text: "#4a7aba",
  Text_1: "#333333",
  Text_2: "#666666",
  light: "rgba(255, 255, 255, 0.3)",
  light_1: "rgba(255, 255, 255, 0.5)",
  light_2: "rgba(255, 255, 255, 0.8)",
  dark: "rgba(80, 110, 255, 0.3)",
  BoxBackground: "#819ac8",
};

const Common_styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(145, 150, 160, 1.00)",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTabButton: {
    backgroundColor: Colors.Button,
  },
  tabText: {
    fontSize: 16,
    color: "rgba(130, 130, 130, 1)",
  },
  activeTabText: {
    fontWeight: "bold",
    color: Colors.Text, //下方Tab文字
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.Text_1,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.Box,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.Text_1,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: Colors.SubmitButton,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row", // 讓子元件橫向排列
    justifyContent: "flex-start",
  },

  cell: {
    width: 80, // 固定寬度
    height: 60, // 高度和寬度一樣，變正方形
    margin: 6,
    backgroundColor: "#b2dfdb", // 你可以調整氣泡顏色
    borderRadius: 20, // 明顯的圓角，但不是圓形
    justifyContent: "center",
    alignItems: "center",
    // 陰影 (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // 陰影 (Android)
    elevation: 3,
  },

  cellText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#004d40",
    textAlign: "center",
    paddingHorizontal: 6,
  },
  gameIdText: {
    fontSize: 16,
    color: "#888888", // 淺灰色
    marginBottom: 5,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#88cc88",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    marginTop:20,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  tableHeader: {
    fontWeight: "700",
    fontSize: 19,
    color: "rgb(7, 14, 53)", // 比 submitBtn 深的綠色
    textAlign:'center',
  },
  tableCell: {
    fontSize: 17,
    color: "rgb(7, 14, 53)",
    textAlign:'center',
  },
  textInput: {
    height: 36,
    borderWidth: 1,
    borderColor: "rgb(52, 68, 159)",
    borderRadius: 3,
    paddingHorizontal: 8,
    fontSize: 17,
    color: "rgb(7, 14, 53)",
    backgroundColor: "#fff",
    width:'100%'
  },
});

export default Common_styles;
