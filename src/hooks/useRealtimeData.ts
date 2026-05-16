import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useRealtimeReadings(limit = 20) {
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchReadings = async () => {
      const { data } = await supabase
        .from('readings')
        .select('*, sensors(name, sensor_types(unit))')
        .order('timestamp', { ascending: false })
        .limit(limit)
      
      if (data) setReadings(data.reverse())
      setLoading(false)
    }

    fetchReadings()

    // Real-time subscription
    const channel = supabase
      .channel('realtime_readings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'readings' },
        (payload) => {
          // Fetch the full record with relations
          supabase
            .from('readings')
            .select('*, sensors(name, sensor_types(unit))')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setReadings(prev => [...prev.slice(1), data])
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [limit])

  return { readings, loading }
}

export function useRealtimeAlerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*, alert_rules(*, sensors(name))')
        .order('triggered_at', { ascending: false })
        .limit(10)
      if (data) setAlerts(data)
    }

    fetchAlerts()

    const channel = supabase
      .channel('realtime_alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          supabase
            .from('alerts')
            .select('*, alert_rules(*, sensors(name))')
            .eq('id', payload.new.id)
            .single()
            .then(({ data }) => {
              if (data) setAlerts(prev => [data, ...prev].slice(0, 10))
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { alerts }
}
