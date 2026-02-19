import { useRouter } from "expo-router";
import {  Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
    const router = useRouter();

    return (
        <LinearGradient
        colors={["#0d0000", "#2b0000", "#5a3a00"]}
        style={styles.container}
        > 
            <Text style={styles.title}>Tela HOME</Text>
            <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/map")}>
                <Text>Abrir mapa</Text>
            </TouchableOpacity>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title:{
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF'
    },
     button: {
    backgroundColor: "#FFD700",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    }
})