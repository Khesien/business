'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react'

export default function SensorManagement() {
  const [sensors, setSensors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newSensor, setNewSensor] = useState({ name: '', type_id: '' })
  const [types, setTypes] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: sensorData } = await supabase.from('sensors').select('*, sensor_types(name, unit)')
    const { data: typeData } = await supabase.from('sensor_types').select('*')
    if (sensorData) setSensors(sensorData)
    if (typeData) setTypes(typeData)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newSensor.name || !newSensor.type_id) return
    const { error } = await supabase.from('sensors').insert([newSensor])
    if (!error) {
      setNewSensor({ name: '', type_id: '' })
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('sensors').delete().eq('id', id)
    if (!error) fetchData()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>Sensor Management</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Add Sensor Form */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr auto', 
          gap: '12px', 
          padding: '16px', 
          borderRadius: '12px', 
          background: 'rgba(255,255,255,0.03)',
          marginBottom: '12px'
        }}>
          <input 
            placeholder="Sensor Name (e.g. Pump 1)" 
            value={newSensor.name}
            onChange={(e) => setNewSensor({...newSensor, name: e.target.value})}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
          />
          <select 
            value={newSensor.type_id}
            onChange={(e) => setNewSensor({...newSensor, type_id: e.target.value})}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
          >
            <option value="">Select Type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>)}
          </select>
          <button 
            onClick={handleAdd}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'white', cursor: 'pointer' }}
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Sensor List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sensors.map(sensor => (
            <div key={sensor.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr auto', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.02)',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '500' }}>{sensor.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {sensor.sensor_types?.name} ({sensor.sensor_types?.unit})
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleDelete(sensor.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
