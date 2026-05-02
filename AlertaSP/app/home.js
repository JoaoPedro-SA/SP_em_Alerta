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

  async function fetchNews() {
    try {
      const res = await axios.get("http://192.168.1.2:5001/news");
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

  const destaque = news.find((n) => n.nivel === "vermelho") || news[0];

  return (
    <LinearGradient
      colors={["#0d0000", "#2b0000", "#5a3a00"]}
      style={styles.container}
    >
      <Text style={styles.title}>🚨 SP em Alerta</Text>

      <FlatList
        data={news}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        
        ListHeaderComponent={
          destaque && (
            <View
              style={[
                styles.highlight,
                { borderLeftColor: getColor(destaque.nivel) },
              ]}
            >
              {destaque.imagem && (
                <Image
                  source={{ uri: destaque.imagem }}
                  style={styles.highlightImage}
                />
              )}
              <Text style={styles.highlightTitle}>
                {destaque.titulo}
              </Text>
              <Text style={styles.highlightDesc}>
                {destaque.descricao}
              </Text>
            </View>
          )
        }

        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { borderLeftColor: getColor(item.nivel) },
            ]}
          >
            {item.imagem && (
              <Image
                source={{ uri: item.imagem }}
                style={styles.image}
              />
            )}

            <View style={{ padding: 10 }}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>
              <Text style={styles.cardDesc}>
                {item.descricao}
              </Text>

              <Text style={styles.cardInfo}>
                {item.regiao} • {item.nivel}
              </Text>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/map")}
      >
        <Text>Abrir mapa</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}