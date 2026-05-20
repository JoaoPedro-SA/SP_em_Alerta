import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.25:5001';

const api = axios.create({
    baseURL: API_URL,
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
