import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE_URL);

// Get Contract Detail
export const getContractDetail = async () => {
    const response = await axios.get(`${API_BASE_URL}/contract/detail`);
    return response.data;
};

// Get Token Balance
export const getBalance = async (address) => {
    const response = await axios.get(`${API_BASE_URL}/contract/balance/${address}`);
    return response.data;
};

// Mint token
export const mintTokens = async (to, amount) => {
    const response = await axios.post(`${API_BASE_URL}/contract/mint`, { to, amount });
    return response.data;
};

// get KAIA Price
export const getKaiaPrice = async () => {
    const response = await axios.get(`${API_BASE_URL}/price-feed`);
    return response.data;
};