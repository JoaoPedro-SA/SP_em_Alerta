import axios from "axios";
import { Platform } from "react-native";

function getApiUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    if (Platform.OS === "web" && typeof window !== "undefined") {
        return `${window.location.protocol}//${window.location.hostname}:5001`;
    }

    return "http://192.168.15.25:5001";
}

const api = axios.create({
    baseURL: getApiUrl(),
    timeout: 8000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;