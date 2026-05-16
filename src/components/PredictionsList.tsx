'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react'

export default function PredictionsList() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPredictions()
    
    // Subscribe to new predictions
    const channel = supabase
      .channel('realtime_predictions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'predictions' },
        () => fetchPredictions()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPredictions = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('predictions')
      .select('*, sensors(name)')
      .order('created_at', { ascending: false })
    if (data) setPredictions(data)
    setLoading(false)
  }

  if (loading) return <div>Loading insights...</div>

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Maintenance Forecasts</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {predictions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <TrendingUp size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>No predictive insights available yet.</p>
            <p style={{ fontSize: '0.875rem' }}>Data collection in progress for model training.</p>
          </div>
        ) : (
          predictions.map(p => (
            <div key={p.id} style={{ 
              padding: '20px', 
              borderRadius: '16px', 
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--card-border)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: p.confidence_level === 'high' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: p.confidence_level === 'high' ? 'var(--success)' : 'var(--warning)',
                    textTransform: 'uppercase'
                  }}>
                    {p.confidence_level} Confidence
                  </span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Asset: {p.sensors?.name}</span>
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>{p.predicted_outcome}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    <span>Est. Time: {p.estimated_time_to_event}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} />
                    <span>Probability: {(p.probability * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)'
                }}>
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
