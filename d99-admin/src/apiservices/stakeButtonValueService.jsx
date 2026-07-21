import axios from 'axios';

import { API_BASE_URL, API_ENDPOINTS } from '../config/api'

const BASE_URL = API_BASE_URL || "http://localhost:8000/api/user";
const finalBaseUrl = BASE_URL.endsWith('/user') ? BASE_URL : `${BASE_URL}/user`;
const API_URL = `${finalBaseUrl}/stake-button-values`;

const defaultGameButtons = [
    { label: '1k', value: 1000 },
    { label: '2k', value: 2000 },
    { label: '5k', value: 5000 },
    { label: '10k', value: 10000 },
    { label: '20k', value: 20000 },
    { label: '25k', value: 25000 },
    { label: '50k', value: 50000 },
    { label: '75k', value: 75000 },
];

const defaultCasinoButtons = [
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: '500', value: 500 },
    { label: '1000', value: 1000 },
    { label: '', value: 0 },
    { label: '', value: 0 },
];

export const getStakeButtonValues = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.get(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Failed to fetch values');
        }
    } catch (error) {
        console.error('Error fetching stake button values:', error);
        // Fallback to defaults
        return {
            game_buttons: defaultGameButtons,
            casino_buttons: defaultCasinoButtons,
        };
    }
};

export const updateStakeButtonValues = async (data) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await axios.post(API_URL, data, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'Failed to update values');
        }
    } catch (error) {
        console.error('Error updating stake button values:', error);
        throw error;
    }
};
