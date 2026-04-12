import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.113:5001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;