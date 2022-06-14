import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: 16,
        marginTop:50,
    },
    header: {
        fontSize: 18,
    },
    deviceInfo: {
        backgroundColor: "#42aaf5",
        flexDirection: "row",
        padding: 8,
        paddingHorizontal: 12,
        margin: 8,
        alignItems: "center",
        justifyContent: "space-between",
    },
    deviceInfoText: {
        color: "white",
        alignContent: "center",
        marginRight: 16,
    },
    connectButton: {
        borderRadius: 30,
    },
});

export default styles;