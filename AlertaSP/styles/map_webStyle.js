import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
     container: {
          flexGrow: 1,
          justifyContent: "flex-start",
          alignItems: "center",
          padding: 24,
          backgroundColor: "#0d0000",
     },
     title: {
          fontSize: 26,
          fontWeight: "bold",
          color: "#ffd700",
          marginBottom: 12,
          textAlign: "center",
     },
     description: {
          color: "#fff",
          fontSize: 16,
          marginBottom: 20,
          textAlign: "center",
     },
     mapContainer: {
          width: "100%",
          height: 520,
          borderRadius: 16,
          overflow: "hidden",
          marginBottom: 20,
          borderWidth: 2,
          borderColor: "#ffd700",
     },
     mapFrame: {
          flex: 1,
          width: "100%",
          height: "100%",
          border: 0,
     },
     selectedAlert: {
          width: "100%",
          backgroundColor: "#202020",
          borderLeftWidth: 6,
          borderLeftColor: "#1e88e5",
          borderRadius: 10,
          padding: 14,
          marginBottom: 20,
     },
     selectedAlertTitle: {
          color: "#ffd700",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 6,
     },
     selectedAlertText: {
          color: "#fff",
          fontSize: 14,
          marginBottom: 6,
     },
     selectedAlertCoords: {
          color: "#bbb",
          fontSize: 12,
     },
     subtitle: {
          color: "#fff",
          fontSize: 18,
          marginBottom: 12,
          textAlign: "center",
     },
     loading: {
          color: "#fff",
          fontSize: 16,
          marginBottom: 20,
     },
     empty: {
          color: "#fff",
          fontSize: 16,
          marginBottom: 20,
     },
     alertCard: {
          width: "100%",
          backgroundColor: "#202020",
          borderRadius: 12,
          padding: 16,
          marginBottom: 14,
     },
     alertTitle: {
          color: "#ffd700",
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 8,
     },
     alertText: {
          color: "#fff",
          fontSize: 14,
          marginBottom: 4,
     },
     alertHint: {
          color: "#bbb",
          fontSize: 12,
          marginTop: 6,
     },
     button: {
          marginTop: 24,
          backgroundColor: "#ffd700",
          borderRadius: 10,
          paddingVertical: 12,
          paddingHorizontal: 24,
     },
     buttonText: {
          color: "#000",
          fontWeight: "bold",
          fontSize: 16,
     },
});

export default styles;
