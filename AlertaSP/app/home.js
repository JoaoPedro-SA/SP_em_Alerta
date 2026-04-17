import { useRouter } from "expo-router";
import { Text, StyleSheet, TouchableOpacity, View, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
    const router = useRouter();
    const [news, setNews] = useState([]);

    async function fetchNews() {
        try {
            const res = await axios.get("http://SEU_IP:5000/news");
            setNews(res.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchNews();
    }, []);

    function getColor(nivel) {
        if (nivel === "vermelho") return "#e74c3c";
        if (nivel === "amarelo") return "#f1c40f";
        return "#2ecc71";
    }

    const destaque = news.find(n => n.nivel === "vermelho") || news[0];
    const recentes = news.slice(0, 3);

    return (
        <LinearGradient
            colors={["#0d0000", "#2b0000", "#5a3a00"]}
            style={styles.container}
        > 
            <Text style={styles.title}>🚨 SP em Alerta</Text>

            {/* 🔴 Destaque */}
            {destaque && (
                <View style={[styles.highlight, { backgroundColor: getColor(destaque.nivel) }]}>
                    <Text style={styles.highlightTitle}>{destaque.titulo}</Text>
                    <Text>{destaque.descricao}</Text>
                </View>
            )}

            {/* 📰 Lista rápida */}
            <FlatList
                data={recentes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={[styles.card, { borderLeftColor: getColor(item.nivel) }]}>
                        <Text style={styles.cardTitle}>{item.titulo}</Text>
                        <Text style={styles.cardInfo}>{item.regiao}</Text>
                    </View>
                )}
            />

            {/* 🗺️ Botão mapa */}
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push("/map")}
            >
                <Text>Abrir mapa</Text>
            </TouchableOpacity>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    title: {
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