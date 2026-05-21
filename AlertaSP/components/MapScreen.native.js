import { useEffect, useRef, useState } from "react";
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
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../app/src/services/api";
import { TEST_ALERTS } from "../constants/testAlerts";

const DEFAULT_COORDS = {
  latitude: -23.55052,
  longitude: -46.633309,
};

const DEFAULT_DELTA = {
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
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

function getMarkerDescription(alert) {
  return [
    getAlertStreet(alert),
    alert.description || "Sem descricao",
    getPublishedDisplay(alert),
  ].filter(Boolean).join(" - ");
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

  function handleMapPress(event) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    selectDraftLocation({ latitude, longitude });
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

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd700" />
        <Text style={styles.centerText}>Obtendo localizacao...</Text>
      </View>
    );
  }

  const nearbyAlerts = getNearbyAlerts(alerts, location);

  return (
    <View style={styles.screen}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          ...DEFAULT_DELTA,
        }}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Voce esta aqui"
        />

        {nearbyAlerts.map((alert) => (
          <Marker
            key={alert.id}
            coordinate={{
              latitude: alert.latitude,
              longitude: alert.longitude,
            }}
            title={alert.title || "Alerta"}
            description={getMarkerDescription(alert)}
            pinColor="#1e90ff"
          />
        ))}

        {draftLocation && (
          <Marker
            coordinate={draftLocation}
            title="Novo alerta"
            description={streetLoading ? "Buscando rua..." : formatAlertLocation(draftLocation)}
            pinColor="#ff3b30"
          />
        )}
      </MapView>

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
