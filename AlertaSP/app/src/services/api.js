import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
    baseURL: 'http://172.18.40.7:5001',
=======
    baseURL: 'http://172.18.38.3:5001',
>>>>>>> 5a143d5a430923aa876f7a8a666b6a2b88c88a65
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;