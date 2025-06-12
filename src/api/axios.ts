// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',            // always /api
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
