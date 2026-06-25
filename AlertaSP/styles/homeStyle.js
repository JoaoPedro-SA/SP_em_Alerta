import { StyleSheet } from "react-native";

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 12,
    },

    listContent: {
        paddingBottom: 96,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    header: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 12,
    },

    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        flex: 1,
    },

    logoutButton: {
        backgroundColor: "#1c1c1e",
        borderWidth: 1,
        borderColor: "#FFD700",
        borderRadius: 10,
        paddingVertical: 9,
        paddingHorizontal: 14,
    },

    logoutButtonText: {
        color: "#FFD700",
        fontWeight: "bold",
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

    highlightHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },

    highlightLogo: {
        width: 34,
        height: 34,
        borderRadius: 8,
        backgroundColor: "#FFF",
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
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },

    cardImage: {
        width: 84,
        height: 84,
        borderRadius: 8,
        backgroundColor: "#DDD",
    },

    cardContent: {
        flex: 1,
        minWidth: 0,
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

    fixedMapButton: {
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 60,
        backgroundColor: "#FFD700",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },

    buttonText: {
        fontWeight: "bold",
    },
});

export default styles
