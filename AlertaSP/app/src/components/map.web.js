import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { useRouter } from "expo-router";

const DEFAULT_COORDS = {
     latitude: -23.55052,
     longitude: -46.633309,
};

function buildOsmUrl({ latitude, longitude }) {
     const delta = 0.02;
     const south = latitude - delta;
     const west = longitude - delta;
     const north = latitude + delta;
     const east = longitude + delta;

     return `https://www.openstreetmap.org/export/embed.html?bbox=${west}%2C${south}%2C${east}%2C${north}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

export default function MapWeb() {
     const router = useRouter();
     const [alerts, setAlerts] = useState([]);
     const [loading, setLoading] = useState(true);
     const [coords, setCoords] = useState(DEFAULT_COORDS);
     const [selectedMarker, setSelectedMarker] = useState(null);

     useEffect(() => {
          async function fetchAlerts() {
               try {
                    const response = await fetch("http://192.168.15.25:5001/alert");
                    const data = await response.json();
                    setAlerts(data || []);
               } catch (error) {
                    console.error("Erro ao buscar alerts no web map:", error);
               } finally {
                    setLoading(false);
               }
          }

          fetchAlerts();

          if (typeof navigator !== "undefined" && navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(
                    ({ coords: location }) => {
                         setCoords({ latitude: location.latitude, longitude: location.longitude });
                    },
                    (error) => {
                         console.warn("Geolocalização não permitida ou falhou:", error);
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
               );
          }
     }, []);

     const mapCenter = selectedMarker || coords;
     const mapUrl = buildOsmUrl(mapCenter);

     return (
          <ScrollView contentContainerStyle={styles.container}>
               <Text style={styles.title}>Mapa Web</Text>
               <Text style={styles.description}>
                    Aqui está uma versão de mapa compatível com o navegador.
               </Text>

               <View style={styles.mapContainer}>
                    <iframe
                         title="Mapa OpenStreetMap"
                         src={mapUrl}
                         style={styles.mapFrame}
                         loading="lazy"
                    />
               </View>

               <Text style={styles.subtitle}>Alertas próximos</Text>

               {loading ? (
                    <Text style={styles.loading}>Carregando alertas...</Text>
               ) : alerts.length === 0 ? (
                    <Text style={styles.empty}>Nenhum alerta encontrado.</Text>
               ) : (
                    alerts.map((alert) => (
                         <TouchableOpacity
                              key={alert.id}
                              style={styles.alertCard}
                              onPress={() => setSelectedMarker({ latitude: alert.latitude, longitude: alert.longitude })}
                         >
                              <Text style={styles.alertTitle}>{alert.title || "Alerta"}</Text>
                              <Text style={styles.alertText}>{alert.description || "Sem descrição"}</Text>
                              <Text style={styles.alertText}>
                                   {alert.latitude}, {alert.longitude}
                              </Text>
                              <Text style={styles.alertHint}>Toque para centralizar no mapa</Text>
                         </TouchableOpacity>
                    ))
               )}

               <TouchableOpacity style={styles.button} onPress={() => router.replace("/home")}>
                    <Text style={styles.buttonText}>Voltar para Home</Text>
               </TouchableOpacity>
          </ScrollView>
     );
}

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
          height: 320,
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
