import axios from 'axios';

const api = axios.create({
    baseURL: 'http://172.18.38.23:5001',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;