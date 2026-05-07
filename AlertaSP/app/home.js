import { useRouter } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/homeStyle";

export default function Home() {

    const router = useRouter();

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchNews() {
        try {

            const res = await axios.get(
                "http://172.18.40.6:5001/news"
            );

            setNews(res.data);

        } catch (err) {
            console.log("Erro ao buscar notícias:", err);
        } finally {
            setLoading(false);
        }

    useEffect(() => {
        fetchNews();
    }, []);

    function getColor(nivel) {

        if (nivel === "vermelho") {
            return "#ff3b30";
        }

        if (nivel === "amarelo") {
            return "#ffd60a";
        }

        return "#34c759";
    }

    const destaque =
        news.find(n => n.nivel === "vermelho") || news[0];

    // remove destaque da lista
    const feedNoticias =
        news.filter(n => n.id !== destaque?.id);

    if (loading) {
        return (
            <LinearGradient
                colors={["#0d0000", "#2b0000", "#5a3a00"]}
                style={styles.loadingContainer}
            >
                <ActivityIndicator
                    size="large"
                    color="#FFF"
                />
            </LinearGradient>
        );
    }

    return (

        <LinearGradient
            colors={["#0d0000", "#2b0000", "#5a3a00"]}
            style={styles.container}
        >

            <FlatList

                data={feedNoticias}

                keyExtractor={(item) =>
                    item.id.toString()
                }

                showsVerticalScrollIndicator={false}

                ListHeaderComponent={
                    <>
                        <Text style={styles.title}>
                            🚨 SP em Alerta
                        </Text>

                        {/* 🔴 Destaque */}
                        {destaque && (

                            <View
                                style={[
                                    styles.highlight,
                                    {
                                        borderColor:
                                            getColor(destaque.nivel)
                                    }
                                ]}
                            >

                                {destaque.imagem && (
                                    <Image
                                        source={{
                                            uri: destaque.imagem
                                        }}
                                        style={styles.highlightImage}
                                    />
                                )}

                                <Text style={styles.highlightLevel}>
                                    ALERTA {destaque.nivel.toUpperCase()}
                                </Text>

                                <Text style={styles.highlightTitle}>
                                    {destaque.titulo}
                                </Text>

                                <Text style={styles.highlightText}>
                                    {destaque.descricao}
                                </Text>

                                <Text style={styles.highlightInfo}>
                                    {destaque.regiao}
                                </Text>

                            </View>
                        )}

                        <Text style={styles.sectionTitle}>
                            Últimas Atualizações
                        </Text>
                    </>
                }

                renderItem={({ item }) => (

                    <View
                        style={[
                            styles.card,
                            {
                                borderLeftColor:
                                    getColor(item.nivel)
                            }
                        ]}
                    >

                        {item.imagem && (
                            <Image
                                source={{
                                    uri: item.imagem
                                }}
                                style={styles.image}
                            />
                        )}

                        <Text style={styles.cardTitle}>
                            {item.titulo}
                        </Text>

                        <Text style={styles.cardDescription}>
                            {item.descricao}
                        </Text>

                        <Text style={styles.cardInfo}>
                            {item.regiao} • {item.nivel}
                        </Text>

                    </View>
                )}

                ListFooterComponent={
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => router.push("/map")}
                    >
                        <Text style={styles.buttonText}>
                            Abrir mapa
                        </Text>
                    </TouchableOpacity>
                }
            />

        </LinearGradient>
    );
}
}
