import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const registerUser = async (email: string, password: string) => {
    const response = await api.post('/register', { email, password });
    return response.data;
};

export const loginUser = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const getPlayers = async (token: string) => {
    const response = await api.get('/players', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const getMyTeam = async (token: string) => {
    const response = await api.get('/me/team', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export const updateMyTeam = async (token: string, playerIds: number[]) => {
    const response = await api.post('/me/team', 
    { player_ids: playerIds },
    {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

export default api;
