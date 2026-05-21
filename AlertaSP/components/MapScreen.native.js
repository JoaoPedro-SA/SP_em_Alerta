import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert as NativeAlert,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import api from "../app/src/services/api";
import { TEST_ALERTS } from "../constants/testAlerts";

const DEFAULT_COORDS = {
  latitude: -23.55052,
  longitude: -46.633309,
};

const EARTH_RADIUS_KM = 6371;
const KEYBOARD_PANEL_GAP = 8;

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
  return String(alert?.street_name || alert?.streetName || "").trim();
}

function formatAlertLocation(alert) {
  const streetName = getAlertStreet(alert);

  if (streetName) {
    return streetName;
  }

  return `${alert.latitude.toFixed(6)}, ${alert.longitude.toFixed(6)}`;
}

function buildLeafletMapHtml(alerts, userLocation, draftLocation, isStreetLoading) {
  const center = draftLocation || userLocation || alerts[0] || DEFAULT_COORDS;
  const alertJson = JSON.stringify(alerts).replace(/</g, "\\u003c");
  const userJson = JSON.stringify(userLocation || DEFAULT_COORDS).replace(/</g, "\\u003c");
  const draftJson = JSON.stringify(draftLocation || null).replace(/</g, "\\u003c");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; background: #111; }
    .leaflet-popup-content { margin: 10px 12px; line-height: 1.35; }
    .fallback {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      color: #fff;
      font-family: Arial, sans-serif;
      text-align: center;
      background: #111;
    }
    .dot {
      border-radius: 999px;
      border: 2px solid #fff;
      box-shadow: 0 1px 5px rgba(0,0,0,.4);
    }
    .alert-dot { background: #1e90ff; }
    .draft-dot { background: #ff3b30; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <script>
    const alerts = ${alertJson};
    const userLocation = ${userJson};
    const draftLocation = ${draftJson};
    const streetLoading = ${JSON.stringify(Boolean(isStreetLoading))};

    function postMessage(payload) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

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

    function popupContent(title, description, subtitle) {
      return "<strong>" + escapeHtml(title || "Alerta") + "</strong><br>" +
        escapeHtml(description || "Sem descricao") +
        (subtitle ? "<br><small>" + escapeHtml(subtitle) + "</small>" : "");
    }

    function initMap() {
      if (!window.L) {
        document.getElementById("map").innerHTML =
          '<div class="fallback">Nao foi possivel carregar o mapa. Verifique sua internet e tente novamente.</div>';
        return;
      }

      const map = L.map("map", {
        center: [${center.latitude}, ${center.longitude}],
        zoom: 13,
        zoomControl: true
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(map);

      const bounds = [];
      const alertIcon = L.divIcon({
        className: "dot alert-dot",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      });
      const draftIcon = L.divIcon({
        className: "dot draft-dot",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10]
      });

      if (userLocation) {
        L.circleMarker([userLocation.latitude, userLocation.longitude], {
          radius: 8,
          color: "#ffffff",
          weight: 2,
          fillColor: "#29b35b",
          fillOpacity: 1
        }).addTo(map).bindPopup("Voce esta aqui");
        bounds.push([userLocation.latitude, userLocation.longitude]);
      }

      alerts.forEach(function (alert) {
        const latitude = Number(alert.latitude);
        const longitude = Number(alert.longitude);

        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return;
        }

        L.marker([latitude, longitude], { icon: alertIcon, title: alert.title || "Alerta" })
          .addTo(map)
          .bindPopup(popupContent(alert.title, alert.description, alert.street_name || alert.streetName));
        bounds.push([latitude, longitude]);
      });

      if (draftLocation) {
        L.marker([draftLocation.latitude, draftLocation.longitude], { icon: draftIcon, title: "Novo alerta" })
          .addTo(map)
          .bindPopup(streetLoading ? "Buscando rua..." : popupContent("Novo alerta", "", draftLocation.street_name))
          .openPopup();
        bounds.push([draftLocation.latitude, draftLocation.longitude]);
      }

      if (bounds.length > 1 && !draftLocation) {
        map.fitBounds(bounds, { padding: [32, 32] });
      }

      map.on("click", function (event) {
        postMessage({
          type: "map-press",
          latitude: event.latlng.lat,
          longitude: event.latlng.lng
        });
      });
    }

    initMap();
  <\/script>
</body>
</html>`;
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

function formatReverseGeocodeAddress(address) {
  if (!address) {
    return "";
  }

  const street = address.street || address.name;
  const number = address.streetNumber;

  if (street) {
    return [street, number].filter(Boolean).join(", ");
  }

  return [address.name, address.district, address.city].filter(Boolean).join(", ");
}

export default function MapScreen() {
  const router = useRouter();
  const geocodeRequestRef = useRef(0);
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);
  const [draftLocation, setDraftLocation] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [streetLoading, setStreetLoading] = useState(false);

  useEffect(() => {
    getLocation();
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates?.height || 0;
      setKeyboardOffset(Math.max(0, keyboardHeight - KEYBOARD_PANEL_GAP));
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  async function fetchAlerts() {
    setLoadingAlerts(true);

    try {
      const response = await api.get("/alert");
      const data = Array.isArray(response.data) ? response.data : [];
      const normalizedAlerts = data.map(normalizeAlert).filter(Boolean);

      setAlerts(normalizedAlerts);
      hydrateAlertStreetNames(normalizedAlerts);
    } catch (error) {
      console.log("Erro ao buscar alerts:", error);
      setAlerts(TEST_ALERTS);
      setFeedback("Nao foi possivel carregar a API. Mostrando alertas de teste.");
    } finally {
      setLoadingAlerts(false);
    }
  }

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      NativeAlert.alert("Localizacao", "Permissao de localizacao negada.");
      setLocation(DEFAULT_COORDS);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.log("Erro ao obter localizacao:", error);
      setLocation(DEFAULT_COORDS);
    }
  }

  async function hydrateAlertStreetNames(alertsToHydrate) {
    const alertsWithoutStreet = alertsToHydrate.filter((alert) => !getAlertStreet(alert));

    for (const alert of alertsWithoutStreet) {
      const streetName = await getStreetNameForCoords(alert);

      if (streetName) {
        setAlerts((current) =>
          current.map((currentAlert) =>
            String(currentAlert.id) === String(alert.id)
              ? { ...currentAlert, street_name: streetName }
              : currentAlert
          )
        );
      }
    }
  }

  async function getStreetNameForCoords(coords) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      return formatReverseGeocodeAddress(addresses[0]);
    } catch (error) {
      console.log("Erro ao buscar rua:", error);
      return "";
    }
  }

  async function selectDraftLocation(coords) {
    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;
    setDraftLocation({ ...coords, street_name: "" });
    setFeedback("");
    setStreetLoading(true);

    const streetName = await getStreetNameForCoords(coords);

    if (geocodeRequestRef.current !== requestId) {
      return;
    }

    setDraftLocation({ ...coords, street_name: streetName });
    setStreetLoading(false);
  }

  function handleMapMessage(event) {
    try {
      const payload = JSON.parse(event.nativeEvent.data);

      if (payload?.type === "map-press") {
        selectDraftLocation({
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
        });
      }
    } catch (error) {
      console.log("Mensagem invalida do mapa:", error);
    }
  }

  function useCurrentLocation() {
    selectDraftLocation(location || DEFAULT_COORDS);
  }

  async function handleCreateAlert() {
    const cleanTitle = title.trim() || "Alerta";
    const cleanDescription = description.trim();

    if (!draftLocation) {
      setFeedback("Toque no mapa para escolher o ponto do alerta.");
      return;
    }

    if (!cleanDescription) {
      setFeedback("Escreva a descricao do alerta.");
      return;
    }

    setSaving(true);
    setFeedback("");

    try {
      const response = await api.post("/alert", {
        latitude: draftLocation.latitude,
        longitude: draftLocation.longitude,
        street_name: getAlertStreet(draftLocation),
        title: cleanTitle,
        description: cleanDescription,
      });

      const created = normalizeAlert(response.data?.alert || response.data);

      if (created) {
        setAlerts((current) => [
          created,
          ...current.filter((alert) => String(alert.id) !== String(created.id) && !String(alert.id).startsWith("teste-")),
        ]);
      } else {
        await fetchAlerts();
      }

      setTitle("");
      setDescription("");
      setDraftLocation(null);
      setStreetLoading(false);
      setFeedback("Alerta publicado para os outros usuarios.");
    } catch (error) {
      console.log("Erro ao criar alerta:", error);
      setFeedback(error.response?.data?.message || "Nao foi possivel criar o alerta.");
    } finally {
      setSaving(false);
    }
  }

  const nearbyAlerts = getNearbyAlerts(alerts, location || DEFAULT_COORDS);
  const mapHtml = useMemo(
    () => buildLeafletMapHtml(nearbyAlerts, location || DEFAULT_COORDS, draftLocation, streetLoading),
    [nearbyAlerts, location, draftLocation, streetLoading]
  );

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.centerText}>Obtendo localizacao...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <WebView
        style={styles.map}
        source={{ html: mapHtml }}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        onMessage={handleMapMessage}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/home")}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <View
        pointerEvents="box-none"
        style={[styles.panelContainer, keyboardOffset > 0 && { bottom: keyboardOffset }]}
      >
        <View style={[styles.panel, keyboardOffset > 0 && styles.panelKeyboardOpen]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Novo alerta</Text>
            <Text style={styles.counterText}>
              {loadingAlerts ? "Atualizando..." : `${nearbyAlerts.length} visiveis`}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Titulo"
            placeholderTextColor="#777"
            value={title}
            maxLength={100}
            returnKeyType="next"
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descricao do alerta"
            placeholderTextColor="#777"
            value={description}
            maxLength={255}
            multiline
            returnKeyType="done"
            onChangeText={setDescription}
          />

          <Text style={styles.coordsText}>
            {streetLoading
              ? "Buscando rua..."
              : draftLocation
                ? formatAlertLocation(draftLocation)
                : "Toque no mapa para escolher o ponto"}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.primaryButton, (saving || streetLoading) && styles.buttonDisabled]}
              onPress={handleCreateAlert}
              disabled={saving || streetLoading}
            >
              <Text style={styles.primaryButtonText}>
                {streetLoading ? "Buscando rua..." : saving ? "Publicando..." : "Publicar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={useCurrentLocation}>
              <Text style={styles.secondaryButtonText}>Minha posicao</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={fetchAlerts}>
              <Text style={styles.secondaryButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0d0000",
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d0000",
  },
  centerText: {
    color: "#fff",
    marginTop: 12,
  },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  backButtonText: {
    color: "#ffd700",
    fontWeight: "bold",
  },
  panelContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
  },
  panel: {
    backgroundColor: "#202020",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  panelKeyboardOpen: {
    padding: 12,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  panelTitle: {
    color: "#ffd700",
    fontSize: 18,
    fontWeight: "bold",
  },
  counterText: {
    color: "#ddd",
    fontSize: 12,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    color: "#111",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  coordsText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    flexGrow: 1,
    backgroundColor: "#ffd700",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#000",
    fontWeight: "bold",
  },
  secondaryButton: {
    flexGrow: 1,
    backgroundColor: "#111",
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffd700",
  },
  secondaryButtonText: {
    color: "#ffd700",
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  feedback: {
    color: "#fff",
    fontSize: 12,
    marginTop: 10,
  },
});
