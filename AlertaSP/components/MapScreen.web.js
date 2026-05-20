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

const EARTH_RADIUS_KM = 6371;
const STREET_LOOKUP_FAILED = "Rua proxima nao encontrada";
const STREET_PLACEHOLDERS = new Set(["Rua nao identificada", STREET_LOOKUP_FAILED]);

function isStreetPlaceholder(streetName) {
  return STREET_PLACEHOLDERS.has(String(streetName || "").trim());
}

function normalizeAlert(alert) {
  const latitude = Number(alert?.latitude);
  const longitude = Number(alert?.longitude);
  const streetName = String(alert?.street_name || alert?.streetName || "").trim();

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    ...alert,
    id: alert?.id ?? `${latitude}-${longitude}-${Date.now()}`,
    latitude,
    longitude,
    street_name: streetName,
  };
}

function getAlertStreet(alert) {
  const streetName = String(alert?.street_name || alert?.streetName || "").trim();
  return isStreetPlaceholder(streetName) ? "" : streetName;
}

function formatAlertCoordinates(alert) {
  return `${Number(alert.latitude).toFixed(6)}, ${Number(alert.longitude).toFixed(6)}`;
}

function getStreetDisplay(alert) {
  const rawStreetName = String(alert?.street_name || alert?.streetName || "").trim();

  if (rawStreetName === STREET_LOOKUP_FAILED) {
    return "Buscando rua proxima...";
  }

  return getAlertStreet(alert) || "Buscando nome da rua...";
}

function formatPublishedAt(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPublishedDisplay(alert) {
  const publishedAt = formatPublishedAt(alert?.created_at || alert?.createdAt);
  return publishedAt ? `Publicado em: ${publishedAt}` : "";
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceInKm(origin, target) {
  if (!origin || !target) {
    return Number.POSITIVE_INFINITY;
  }

  const latitudeDistance = toRadians(target.latitude - origin.latitude);
  const longitudeDistance = toRadians(target.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const targetLatitude = toRadians(target.latitude);

  const halfChordLength =
    Math.sin(latitudeDistance / 2) * Math.sin(latitudeDistance / 2) +
    Math.cos(originLatitude) *
      Math.cos(targetLatitude) *
      Math.sin(longitudeDistance / 2) *
      Math.sin(longitudeDistance / 2);

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));
}

function getNearbyAlerts(alerts, location) {
  return [...alerts]
    .map((alert) => ({
      ...alert,
      distanceInKm: getDistanceInKm(location, alert),
    }))
    .sort((firstAlert, secondAlert) => firstAlert.distanceInKm - secondAlert.distanceInKm);
}

function extractOsmStreetName(data) {
  const address = data?.address || {};
  const street = address.road || address.pedestrian || address.footway || address.cycleway || address.path || address.residential || address.square;
  const number = address.house_number;
  const nearbyArea = address.neighbourhood || address.suburb || address.city_district || address.city;

  if (street) {
    return [street, number].filter(Boolean).join(", ");
  }

  if (nearbyArea) {
    return nearbyArea;
  }

  return data?.display_name ? data.display_name.split(",").slice(0, 2).join(", ").trim() : "";
}

async function fetchOsmStreetName(latitude, longitude) {
  for (const zoom of [18, 17, 16]) {
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        "accept-language": "pt-BR",
        lat: String(latitude),
        lon: String(longitude),
        zoom: String(zoom),
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);

      if (!response.ok) {
        continue;
      }

      const streetName = extractOsmStreetName(await response.json());

      if (streetName) {
        return streetName;
      }
    } catch (error) {
      console.warn("Falha ao buscar rua pelo OpenStreetMap:", error);
    }
  }

  return "";
}

function buildGoogleMapHtml(alerts, selectedAlert, fallbackCoords) {
  const center = selectedAlert || alerts[0] || fallbackCoords;
  const selectedId = selectedAlert?.id ?? null;
  const alertJson = JSON.stringify(alerts).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .leaflet-popup-content { margin: 12px 14px; }
    .leaflet-popup-content-wrapper { max-height: min(360px, calc(100vh - 96px)); overflow-y: auto; }
    .alert-marker {
      border-radius: 999px;
      border: 2px solid #fff;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.35);
    }
    .alert-marker { background: #1e88e5; }
    .alert-popup {
      box-sizing: border-box;
      max-width: min(380px, calc(100vw - 64px));
      min-width: min(260px, calc(100vw - 64px));
      padding: 2px 8px 4px 0;
      line-height: 1.4;
    }
    .alert-popup strong {
      display: block;
      font-size: 15px;
      margin-bottom: 6px;
      overflow-wrap: anywhere;
    }
    .alert-popup span {
      color: #555;
      display: block;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
    .alert-popup small { color: #777; display: block; margin-top: 8px; overflow-wrap: anywhere; }
    .alert-popup time { color: #777; display: block; margin-top: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <script>
    const alerts = ${alertJson};
    const selectedId = ${JSON.stringify(selectedId)};
    function escapeHtml(value) {
      return String(value || "").replace(/[&<>"']/g, function (char) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;"
        }[char];
      });
    }

    function getKnownStreetName(value) {
      const streetName = String(value || "").trim();

      if (!streetName || streetName === "Rua nao identificada" || streetName === "Rua proxima nao encontrada") {
        return "";
      }

      return streetName;
    }

    function formatPublishedAt(value) {
      if (!value) {
        return "";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(date);
    }

    function popupContent(title, description, streetName, createdAt) {
      const publishedAt = formatPublishedAt(createdAt);

      return (
        '<div class="alert-popup"><strong>' +
        escapeHtml(title || "Alerta") +
        "</strong><span>" +
        escapeHtml(description || "Sem descricao") +
        "</span>" +
        (streetName ? "<small>" + escapeHtml(streetName) + "</small>" : "") +
        (publishedAt ? "<time>Publicado em: " + escapeHtml(publishedAt) + "</time>" : "") +
        "</div>"
      );
    }

    function initMap() {
      if (!window.L) {
        document.getElementById("map").innerHTML = '<div style="display:flex;height:100%;align-items:center;justify-content:center;font-family:Arial;background:#111;color:#fff;text-align:center;padding:24px;">Nao foi possivel carregar o mapa.</div>';
        return;
      }

      const map = L.map("map", {
        center: [${center.latitude}, ${center.longitude}],
        zoom: 13,
        zoomControl: true
      });
      const bounds = [];
      const alertIcon = L.divIcon({
        className: "alert-marker",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      alerts.forEach((alert) => {
        const position = { lat: alert.latitude, lng: alert.longitude };
        const alertStreetName = getKnownStreetName(alert.street_name || alert.streetName);
        const marker = L.marker([position.lat, position.lng], { icon: alertIcon, title: alert.title || "Alerta" })
          .addTo(map)
          .bindPopup(popupContent(alert.title, alert.description, alertStreetName, alert.created_at || alert.createdAt));

        marker.on("click", () => {
          window.parent.postMessage({ type: "alert-selected", alertId: alert.id }, "*");
        });

        bounds.push([position.lat, position.lng]);

        if (String(alert.id) === String(selectedId)) {
          marker.openPopup();
          map.setView([position.lat, position.lng], 14);
        }
      });

      if (alerts.length > 1 && !selectedId) {
        map.fitBounds(bounds, { padding: [28, 28] });
      }
    }

    initMap();
  <\/script>
</body>
</html>`;
}

export default function MapScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [feedback, setFeedback] = useState("");

  async function fetchAlerts() {
    try {
      const response = await api.get("/alert");
      const data = Array.isArray(response.data) ? response.data : [];
      const normalizedAlerts = data.map(normalizeAlert).filter(Boolean);

      setAlerts(normalizedAlerts);
      hydrateAlertStreetNames(normalizedAlerts);
    } catch (error) {
      console.error("Erro ao buscar alerts no web map:", error);
      setAlerts(TEST_ALERTS);
      setFeedback("Nao foi possivel carregar a API. Mostrando alertas de teste.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStreetName(latitude, longitude) {
    return fetchOsmStreetName(latitude, longitude);
  }

  async function saveAlertStreetName(alertId, streetName) {
    const cleanStreetName = getAlertStreet({ street_name: streetName });

    if (!cleanStreetName || alertId === undefined || alertId === null) {
      return;
    }

    try {
      await api.patch(`/alert/${alertId}/street`, {
        street_name: cleanStreetName,
      });
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Erro ao salvar rua do alerta:", error);
      }
    }
  }

  async function hydrateAlertStreetNames(alertsToHydrate) {
    const alertsWithoutStreet = alertsToHydrate.filter((alert) => !getAlertStreet(alert));
    const resolvedStreets = {};

    for (const alert of alertsWithoutStreet) {
      const streetName = await fetchStreetName(alert.latitude, alert.longitude, alert.id);

      if (streetName) {
        resolvedStreets[String(alert.id)] = streetName;
        saveAlertStreetName(alert.id, streetName);
      }
    }

    if (Object.keys(resolvedStreets).length === 0) {
      return;
    }

    setAlerts((current) =>
      current.map((alert) =>
        resolvedStreets[String(alert.id)]
          ? { ...alert, street_name: resolvedStreets[String(alert.id)] }
          : alert
      )
    );
    setSelectedAlert((current) =>
      current && resolvedStreets[String(current.id)]
        ? { ...current, street_name: resolvedStreets[String(current.id)] }
        : current
    );
  }

  function getBrowserLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setUserLocation(DEFAULT_COORDS);
      setFeedback((current) => current || "Nao foi possivel obter sua localizacao. Usando Sao Paulo como referencia.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(DEFAULT_COORDS);
        setFeedback((current) => current || "Permissao de localizacao negada. Usando Sao Paulo como referencia.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  useEffect(() => {
    getBrowserLocation();
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nearbyAlerts = useMemo(
    () => getNearbyAlerts(alerts, userLocation || DEFAULT_COORDS),
    [alerts, userLocation]
  );

  useEffect(() => {
    function handleMapMessage(event) {
      if (event.data?.type !== "alert-selected") {
        return;
      }

      const clickedAlert = nearbyAlerts.find((alert) => String(alert.id) === String(event.data.alertId));

      if (clickedAlert) {
        setSelectedAlert(clickedAlert);
      }
    }

    window.addEventListener("message", handleMapMessage);

    return () => {
      window.removeEventListener("message", handleMapMessage);
    };
  }, [nearbyAlerts]);

  useEffect(() => {
    setSelectedAlert((current) => {
      if (current && nearbyAlerts.some((alert) => String(alert.id) === String(current.id))) {
        return nearbyAlerts.find((alert) => String(alert.id) === String(current.id)) || current;
      }

      return nearbyAlerts[0] || null;
    });
  }, [nearbyAlerts]);

  const mapHtml = useMemo(
    () => buildGoogleMapHtml(nearbyAlerts, selectedAlert, userLocation || DEFAULT_COORDS),
    [nearbyAlerts, selectedAlert, userLocation]
  );

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Mapa de Alertas</Text>
      <Text style={styles.description}>Visualize os alertas publicados pelo aplicativo mobile.</Text>
      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.mapContainer}>
        <iframe title="Mapa de alertas" srcDoc={mapHtml} style={styles.mapFrame} loading="lazy" />
      </View>

      {selectedAlert && (
        <View style={styles.selectedAlert}>
          <Text style={styles.selectedAlertTitle}>{selectedAlert.title || "Alerta"}</Text>
          <Text style={styles.selectedAlertText}>{selectedAlert.description || "Sem descricao"}</Text>
          <Text style={styles.selectedAlertStreet}>Rua: {getStreetDisplay(selectedAlert)}</Text>
          {getPublishedDisplay(selectedAlert) ? (
            <Text style={styles.selectedAlertDate}>{getPublishedDisplay(selectedAlert)}</Text>
          ) : null}
          <Text style={styles.selectedAlertCoords}>Coordenadas: {formatAlertCoordinates(selectedAlert)}</Text>
        </View>
      )}

      {loading ? (
        <Text style={styles.loading}>Carregando alertas...</Text>
      ) : nearbyAlerts.length === 0 ? (
        <Text style={styles.empty}>Nenhum alerta encontrado.</Text>
      ) : null}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
        <Text style={styles.refreshButtonText}>Atualizar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/home")}>
        <Text style={styles.buttonText}>Voltar para Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
