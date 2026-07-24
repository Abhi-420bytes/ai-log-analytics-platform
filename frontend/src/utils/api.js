// src/utils/api.js
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || '/api'
const WS   = import.meta.env.VITE_WS_URL  || `ws://${window.location.hostname}:8000`

export const api = axios.create({ baseURL: BASE, timeout: 10000 })

export const endpoints = {
  metrics:     () => api.get('/metrics'),
  sourceStats: () => api.get('/source_stats'),
  anomalies:   () => api.get('/anomalies'),
  graph:       () => api.get('/graph'),
  drift:       () => api.get('/drift'),
  models:      () => api.get('/models'),
  xai:         () => api.get('/xai'),
  cluster:     () => api.get('/cluster'),
  health:      () => api.get('/health'),
  reload:      () => api.post('/reload'),
}

export const wsUrl = {
  logs:    `${WS}/ws/logs`,
  metrics: `${WS}/ws/metrics`,
}
