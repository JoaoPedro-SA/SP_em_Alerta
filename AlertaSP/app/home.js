import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import AppBackground from "../components/AppBackground";
import api from "./src/services/api";
import styles from "../styles/homeStyle";

const FALLBACK_NEWS = [
  {
    id: "teste-home",
    titulo: "Alerta de teste",
    descricao: "Noticia local de teste para a Home nao ficar carregando se a API nao responder.",
    regiao: "Sao Paulo",
    nivel: "amarelo",
  },
];

export default function Home() {
  const router = useRouter();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const res = await api.get("/news");
      const data = Array.isArray(res.data) ? res.data : [];
      setNews(data.length > 0 ? data : FALLBACK_NEWS);
    } catch (err) {
      console.log("Erro ao buscar noticias:", err);
      setNews(FALLBACK_NEWS);
    } finally {
      setLoading(false);
    }
  }

  function getColor(nivel) {
    if (nivel === "vermelho") {
      return "#ff3b30";
    }

    if (nivel === "amarelo") {
      return "#ffd60a";
    }

    return "#34c759";
  }

  const destaque = news.find((item) => item.nivel === "vermelho") || news[0];
  const feedNoticias = news.filter((item) => item.id !== destaque?.id);

  if (loading) {
    return (
      <AppBackground style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFF" />
      </AppBackground>
    );
  }

  return (
    <AppBackground style={styles.container}>
      <FlatList
        data={feedNoticias}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>SP em Alerta</Text>

            {destaque && (
              <View style={[styles.highlight, { borderColor: getColor(destaque.nivel) }]}>
                {destaque.imagem && (
                  <Image source={{ uri: destaque.imagem }} style={styles.highlightImage} />
                )}

                <Text style={styles.highlightLevel}>ALERTA {destaque.nivel?.toUpperCase()}</Text>
                <Text style={styles.highlightTitle}>{destaque.titulo}</Text>
                <Text style={styles.highlightText}>{destaque.descricao}</Text>
                <Text style={styles.highlightInfo}>{destaque.regiao}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Ultimas Atualizacoes</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: getColor(item.nivel) }]}>
            {item.imagem && <Image source={{ uri: item.imagem }} style={styles.image} />}

            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardDescription}>{item.descricao}</Text>
            <Text style={styles.cardInfo}>
              {item.regiao} - {item.nivel}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.button} onPress={() => router.push("/map")}>
            <Text style={styles.buttonText}>Abrir mapa</Text>
          </TouchableOpacity>
        }
      />
    </AppBackground>
  );
}
