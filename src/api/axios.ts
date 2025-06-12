// src/api/axios.ts
import axios from 'axios'

const api = axios.create({
  // This will be proxied to https://frontend-take-home-service.fetch.com
  baseURL: '/api',
  withCredentials: true,      // send & receive the HttpOnly auth cookie
  headers: { 'Content-Type': 'application/json' },
})

export default api
