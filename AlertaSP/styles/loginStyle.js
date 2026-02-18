import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
    color: "#fff",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: "#000000",
    fontSize: 18,
    
  },
  button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 20,
  },
  link: {
    textAlign: "center",
    marginTop: 15,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 21,
  },
});

export default styles;