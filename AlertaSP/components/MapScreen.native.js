import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import api from "../app/src/services/api";
import { TEST_ALERTS } from "../constants/testAlerts";

const DEFAULT_COORDS = {
  latitude: -23.55052,
  longitude: -46.633309,
};

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

export default function MapScreen() {
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const response = await api.get("/alert");
      const data = Array.isArray(response.data) ? response.data : [];
      const normalizedAlerts = data.map(normalizeAlert).filter(Boolean);

      setAlerts(normalizedAlerts.length > 0 ? normalizedAlerts : TEST_ALERTS);
    } catch (error) {
      console.log("Erro ao buscar alerts:", error);
      setAlerts(TEST_ALERTS);
    }
  }

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permissao de localizacao negada");
      setLocation(DEFAULT_COORDS);
      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    } catch (error) {
      console.log("Erro ao obter localizacao:", error);
      setLocation(DEFAULT_COORDS);
    }
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Obtendo localizacao...</Text>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        title="Voce esta aqui"
      />

      {alerts.map((alert) => (
        <Marker
          key={alert.id}
          coordinate={{
            latitude: alert.latitude,
            longitude: alert.longitude,
          }}
          title={alert.title}
          description={alert.description}
          pinColor="#1e90ff"
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
