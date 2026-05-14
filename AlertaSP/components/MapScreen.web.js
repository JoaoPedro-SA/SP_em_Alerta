import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import styles from "../styles/map_webStyle";
import api from "../app/src/services/api";
import { TEST_ALERTS } from "../constants/testAlerts";

const DEFAULT_COORDS = {
  latitude: -23.55052,
  longitude: -46.633309,
};

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function normalizeAlert(alert) {
  const latitude = Number(alert.latitude);
  const longitude = Number(alert.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...alert,
    latitude,
    longitude,
  };
}

function buildGoogleMapHtml(alerts, selectedAlert, fallbackCoords) {
  if (!GOOGLE_MAPS_API_KEY) {
    return `<!doctype html><html><body style="margin:0;display:flex;height:100%;align-items:center;justify-content:center;font-family:Arial;background:#111;color:#fff;text-align:center;padding:24px;">Configure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY no arquivo .env.</body></html>`;
  }

  const visibleAlerts = alerts.length > 0 ? alerts : [selectedAlert].filter(Boolean);
  const center = selectedAlert || visibleAlerts[0] || fallbackCoords;
  const selectedId = selectedAlert?.id ?? null;
  const alertJson = JSON.stringify(visibleAlerts).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .alert-popup strong { display: block; font-size: 15px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const alerts = ${alertJson};
    const selectedId = ${JSON.stringify(selectedId)};

    function initMap() {
      const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: ${center.latitude}, lng: ${center.longitude} },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
      });

      const bounds = new google.maps.LatLngBounds();
      const infoWindow = new google.maps.InfoWindow();

      alerts.forEach((alert) => {
        const position = { lat: alert.latitude, lng: alert.longitude };
        const marker = new google.maps.Marker({
          position,
          map,
          title: alert.title || "Alerta",
          icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        });

        const content =
          '<div class="alert-popup"><strong>' +
          (alert.title || "Alerta") +
          "</strong>" +
          (alert.description || "Sem descricao") +
          "</div>";

        marker.addListener("click", () => {
          infoWindow.setContent(content);
          infoWindow.open({ anchor: marker, map });
        });

        bounds.extend(position);

        if (String(alert.id) === String(selectedId)) {
          infoWindow.setContent(content);
          infoWindow.open({ anchor: marker, map });
          map.setCenter(position);
          map.setZoom(14);
        }
      });

      if (alerts.length > 1 && !selectedId) {
        map.fitBounds(bounds);
      }
    }
  <\/script>
  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap"><\/script>
</body>
</html>`;
}

export default function MapScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(DEFAULT_COORDS);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await api.get("/alert");
        const data = Array.isArray(response.data) ? response.data : [];
        const normalizedAlerts = data.map(normalizeAlert).filter(Boolean);
        const nextAlerts = normalizedAlerts.length > 0 ? normalizedAlerts : TEST_ALERTS;

        setAlerts(nextAlerts);
        setSelectedAlert(nextAlerts[0]);
      } catch (error) {
        console.error("Erro ao buscar alerts no web map:", error);
        setAlerts(TEST_ALERTS);
        setSelectedAlert(TEST_ALERTS[0]);
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
          console.warn("Geolocalizacao nao permitida ou falhou:", error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const mapHtml = useMemo(() => buildGoogleMapHtml(alerts, selectedAlert, coords), [alerts, selectedAlert, coords]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mapa Web</Text>
      <Text style={styles.description}>Alertas marcados no Google Maps nas coordenadas cadastradas.</Text>

      <View style={styles.mapContainer}>
        <iframe title="Mapa de alertas" srcDoc={mapHtml} style={styles.mapFrame} loading="lazy" />
      </View>

      {selectedAlert && (
        <View style={styles.selectedAlert}>
          <Text style={styles.selectedAlertTitle}>{selectedAlert.title || "Alerta"}</Text>
          <Text style={styles.selectedAlertText}>{selectedAlert.description || "Sem descricao"}</Text>
          <Text style={styles.selectedAlertCoords}>
            {selectedAlert.latitude}, {selectedAlert.longitude}
          </Text>
        </View>
      )}

      <Text style={styles.subtitle}>Alertas proximos</Text>

      {loading ? (
        <Text style={styles.loading}>Carregando alertas...</Text>
      ) : alerts.length === 0 ? (
        <Text style={styles.empty}>Nenhum alerta encontrado.</Text>
      ) : (
        alerts.map((alert) => (
          <TouchableOpacity key={alert.id} style={styles.alertCard} onPress={() => setSelectedAlert(alert)}>
            <Text style={styles.alertTitle}>{alert.title || "Alerta"}</Text>
            <Text style={styles.alertText}>{alert.description || "Sem descricao"}</Text>
            <Text style={styles.alertText}>
              {alert.latitude}, {alert.longitude}
            </Text>
            <Text style={styles.alertHint}>Toque para abrir o marcador no mapa</Text>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/home")}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
