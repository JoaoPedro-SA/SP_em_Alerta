import axios from "axios";

const DEFAULT_API_URL = "https://sp-em-alerta-27yd.onrender.com";
const DEFAULT_TIMEOUT = 60000;

function getApiUrl() {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, "");
    }

    return DEFAULT_API_URL;
}

const api = axios.create({
    baseURL: getApiUrl(),
    timeout: DEFAULT_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
});

let wakeUpPromise = null;

export function wakeUpApi() {
    if (!wakeUpPromise) {
        wakeUpPromise = api
            .get("/health", { timeout: DEFAULT_TIMEOUT })
            .catch((error) => {
                console.log("Render wake-up failed:", error?.message || error);
            })
            .finally(() => {
                wakeUpPromise = null;
            });
    }

    return wakeUpPromise;
}

export default api;
