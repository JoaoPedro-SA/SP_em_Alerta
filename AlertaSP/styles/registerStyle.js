import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container:{
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
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 19
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
  backButton:{
    position: "absolute",
    top:  50,
    left: 20
  },
  buttonLogin:{
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText:{
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 21,
  }

});
export default styles;