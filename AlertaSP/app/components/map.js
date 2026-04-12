import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";


export default function Map() {
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
  try {
    const response = await fetch("http://172.18.40.4:5001/alert");
    const data = await response.json();
    setAlerts(data);
  } catch (error) {
    console.log("Erro ao buscar alerts:", error);
  }
}

  async function getLocation() {
    // Pedir permissão
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permissão de localização negada");
      return;
    }

    // Pegar posição atual
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Obtendo localização...</Text>
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
        title="Você está aqui"
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
      pinColor="blue"
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
