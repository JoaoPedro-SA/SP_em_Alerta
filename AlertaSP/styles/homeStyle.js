import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 12,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 20,
    },

    sectionTitle: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },

    highlight: {
        backgroundColor: "#1c1c1e",
        borderWidth: 2,
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },

    highlightImage: {
        width: "100%",
        height: 220,
        borderRadius: 10,
        marginBottom: 12,
    },

    highlightLevel: {
        color: "#FFF",
        fontWeight: "bold",
        marginBottom: 6,
    },

    highlightTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFF",
        marginBottom: 8,
    },

    highlightText: {
        color: "#DDD",
        lineHeight: 20,
    },

    highlightInfo: {
        color: "#999",
        marginTop: 10,
    },

    card: {
        backgroundColor: "#FFF",
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 6,
        borderRadius: 10,
    },

    image: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 10,
    },

    cardTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 5,
    },

    cardDescription: {
        color: "#333",
        lineHeight: 20,
    },

    cardInfo: {
        color: "#666",
        marginTop: 10,
        fontSize: 12,
    },

    button: {
        backgroundColor: "#FFD700",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
    },

    buttonText: {
        fontWeight: "bold",
    },
});

export default styles
