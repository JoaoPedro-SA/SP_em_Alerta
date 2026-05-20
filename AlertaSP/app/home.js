import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Image, Linking, Text, TouchableOpacity, View } from "react-native";
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
    imagem: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=320&q=70",
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

  function handleLogout() {
    router.replace("/login");
  }

  function getNewsInfo(item) {
    return [item.fonte, item.regiao, item.data].filter(Boolean).join(" - ");
  }

  function openNewsLink(link) {
    if (link) {
      Linking.openURL(link);
    }
  }

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
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.title}>SP em Alerta</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Deslogar</Text>
              </TouchableOpacity>
            </View>

            {destaque && (
              <TouchableOpacity
                style={[styles.highlight, { borderColor: getColor(destaque.nivel) }]}
                onPress={() => openNewsLink(destaque.link)}
                disabled={!destaque.link}
              >
                <View style={styles.highlightHeader}>
                  {destaque.imagem && (
                    <Image source={{ uri: destaque.imagem }} style={styles.highlightLogo} />
                  )}
                  <Text style={styles.highlightLevel}>ALERTA {destaque.nivel?.toUpperCase()}</Text>
                </View>
                <Text style={styles.highlightTitle}>{destaque.titulo}</Text>
                <Text style={styles.highlightText}>{destaque.descricao}</Text>
                <Text style={styles.highlightInfo}>{getNewsInfo(destaque)}</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Ultimas Atualizacoes</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { borderLeftColor: getColor(item.nivel) }]}
            onPress={() => openNewsLink(item.link)}
            disabled={!item.link}
          >
            {item.imagem && <Image source={{ uri: item.imagem }} style={styles.cardImage} />}

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDescription}>{item.descricao}</Text>
              <Text style={styles.cardInfo}>{getNewsInfo(item) || item.nivel}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fixedMapButton} onPress={() => router.push("/map")}>
        <Text style={styles.buttonText}>Abrir mapa</Text>
      </TouchableOpacity>
    </AppBackground>
  );
}
