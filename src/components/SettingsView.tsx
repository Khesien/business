'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Shield, Globe, Key, Settings as SettingsIcon, Plus, Save, Loader2 } from 'lucide-react'

export default function SettingsView({ user }: { user: any }) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'api' | 'system'>('profile')
  const [sensorTypes, setSensorTypes] = useState<any[]>([])
  const [newType, setNewType] = useState({ name: '', unit: '' })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSensorTypes()
  }, [])

  const fetchSensorTypes = async () => {
    const { data } = await supabase.from('sensor_types').select('*')
    if (data) setSensorTypes(data)
  }

  const handleAddType = async () => {
    if (!newType.name || !newType.unit) return
    setLoading(true)
    const { error } = await supabase.from('sensor_types').insert([newType])
    if (!error) {
      setNewType({ name: '', unit: '' })
      fetchSensorTypes()
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '40px' }}>
      {/* Settings Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={() => setActiveSubTab('profile')}
          style={subTabStyle(activeSubTab === 'profile')}
        >
          <User size={18} /> Account Profile
        </button>
        <button 
          onClick={() => setActiveSubTab('api')}
          style={subTabStyle(activeSubTab === 'api')}
        >
          <Globe size={18} /> API & Ingestion
        </button>
        <button 
          onClick={() => setActiveSubTab('system')}
          style={subTabStyle(activeSubTab === 'system')}
        >
          <Shield size={18} /> System Config
        </button>
      </nav>

      {/* Settings Content */}
      <div className="glass-card">
        {activeSubTab === 'profile' && (
          <div>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User /> User Profile
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Email Address</label>
                <input readOnly value={user?.email || ''} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>User ID</label>
                <input readOnly value={user?.id || ''} style={inputStyle} />
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Profile settings are managed via Supabase Auth.
              </p>
            </div>
          </div>
        )}

        {activeSubTab === 'api' && (
          <div>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe /> Ingestion Endpoint
            </h3>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
              <p style={{ color: 'var(--accent-primary)', fontWeight: '700', marginBottom: '8px', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Active Endpoint URL
              </p>
              <code style={{ fontSize: '1rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/api/ingest` : '/api/ingest'}
              </code>
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
                <p style={labelStyle}>Payload Format (JSON)</p>
                <pre style={{ fontSize: '0.875rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
{`{
  "sensor_id": "uuid",
  "value": 42.5
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'system' && (
          <div>
            <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SettingsIcon /> Global Sensor Types
            </h3>
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Add new measurement units and sensor categories for your field equipment.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input 
                  placeholder="Type Name (e.g. Vibration)" 
                  value={newType.name}
                  onChange={(e) => setNewType({...newType, name: e.target.value})}
                  style={inputStyle} 
                />
                <input 
                  placeholder="Unit (e.g. Hz)" 
                  value={newType.unit}
                  onChange={(e) => setNewType({...newType, unit: e.target.value})}
                  style={{ ...inputStyle, width: '120px' }} 
                />
                <button 
                  onClick={handleAddType}
                  disabled={loading}
                  style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', padding: '0 20px', color: 'white', cursor: 'pointer' }}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {sensorTypes.map(t => (
                <div key={t.id} style={{ padding: '12px', border: '1px solid var(--card-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontWeight: '600' }}>{t.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unit: {t.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function subTabStyle(active: boolean): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    border: 'none',
    background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'var(--transition-smooth)'
  }
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--text-muted)',
  marginBottom: '4px'
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--card-border)',
  borderRadius: '8px',
  padding: '12px',
  color: 'var(--text-main)',
  outline: 'none',
  width: '100%'
}
