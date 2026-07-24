// src/hooks/useData.js
import { useState, useEffect, useRef, useCallback } from 'react'
import { endpoints, wsUrl } from '../utils/api'

export function useFetch(fetchFn, interval = 15000) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetch = useCallback(async () => {
    try {
      const res = await fetchFn()
      setData(res.data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    fetch()
    if (interval) {
      const t = setInterval(fetch, interval)
      return () => clearInterval(t)
    }
  }, [fetch, interval])

  return { data, loading, error, refetch: fetch }
}

export function useLiveLogs(maxLogs = 100) {
  const [logs,      setLogs]      = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl.logs)
        wsRef.current.onopen    = () => setConnected(true)
        wsRef.current.onclose   = () => { setConnected(false); setTimeout(connect, 3000) }
        wsRef.current.onerror   = () => wsRef.current?.close()
        wsRef.current.onmessage = (e) => {
          const log = JSON.parse(e.data)
          setLogs(prev => [log, ...prev].slice(0, maxLogs))
        }
      } catch {
        setTimeout(connect, 3000)
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [maxLogs])

  return { logs, connected }
}

export function useLiveMetrics() {
  const [metrics,   setMetrics]   = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      try {
        wsRef.current = new WebSocket(wsUrl.metrics)
        wsRef.current.onopen    = () => setConnected(true)
        wsRef.current.onclose   = () => { setConnected(false); setTimeout(connect, 3000) }
        wsRef.current.onerror   = () => wsRef.current?.close()
        wsRef.current.onmessage = (e) => setMetrics(JSON.parse(e.data))
      } catch {
        setTimeout(connect, 3000)
      }
    }
    connect()
    return () => wsRef.current?.close()
  }, [])

  return { metrics, connected }
}
