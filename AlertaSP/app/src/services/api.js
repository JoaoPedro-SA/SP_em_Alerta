import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.15.25:5001',
    timeout: 8000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
