import { StyleSheet, Platform } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#fff",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 14,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,

    // melhora no web (focus visual)
    ...(Platform.OS === "web" && {
      outlineStyle: "none",
    }),
  },

  button: {
    backgroundColor: "#FFD700",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,

    // leve sombra no web
    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 18,
  },

  backButton: {
    position: "absolute",
    top: 20,
    left: 10,
    zIndex: 10,
  },

  buttonLogin: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,

    ...(Platform.OS === "web" && {
      cursor: "pointer",
    }),
  },

  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;