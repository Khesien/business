'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Thermometer, 
  Settings, 
  Bell, 
  TrendingUp,
  Box,
  Fuel,
  Waves,
  LogOut,
  User,
  History
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import CsvUpload from '@/components/CsvUpload'
import SensorManagement from '@/components/SensorManagement'
import AlertRules from '@/components/AlertRules'
import PredictionsList from '@/components/PredictionsList'
import SettingsView from '@/components/SettingsView'
import { useRealtimeReadings, useRealtimeAlerts } from '@/hooks/useRealtimeData'
import { analyzeReading, predictMaintenance } from '@/lib/ai-engine'

type Tab = 'overview' | 'sensors' | 'alerts' | 'predictions' | 'settings'

// Dashboard component
export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()
  
  const { readings, loading: readingsLoading } = useRealtimeReadings()
  const { alerts } = useRealtimeAlerts()

  useEffect(() => {
    setMounted(true)
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'var(--accent-primary)', padding: '8px', borderRadius: '12px' }}>
            <Activity color="white" size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Faith Business</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarItem icon={<Activity size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarItem icon={<Box size={20} />} label="Sensors" active={activeTab === 'sensors'} onClick={() => setActiveTab('sensors')} />
          <SidebarItem icon={<AlertTriangle size={20} />} label="Alerts" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
          <SidebarItem icon={<TrendingUp size={20} />} label="Predictions" active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')} />
          <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="glass-card" style={{ padding: '16px', borderRadius: '12px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <User size={14} />
              <span>{user?.email || 'Loading...'}</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="subtitle">Botswana Field Insights • Predictive Maintenance</p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Live Stream</span>
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            <div className="grid-stats">
              <StatCard 
                title="Latest Reading" 
                value={readings.length > 0 ? `${readings[readings.length - 1].value}${readings[readings.length - 1].sensors?.sensor_types?.unit || ''}` : '--'} 
                sub={readings.length > 0 ? readings[readings.length - 1].sensors?.name : 'No data'} 
                icon={<Activity color="#3b82f6" />} 
                status={readings.length > 0 ? 'online' : 'offline'} 
              />
              <StatCard 
                title="Total Sensors" 
                value={new Set(readings.map(r => r.sensor_id)).size} 
                sub="Active in field" 
                icon={<Box color="#10b981" />} 
                status="online" 
              />
              <StatCard 
                title="Anomalies" 
                value={alerts.length} 
                sub="Last 24h" 
                icon={<AlertTriangle color="#f59e0b" />} 
                status={alerts.length > 0 ? 'warning' : 'online'} 
              />
              <StatCard 
                title="System Health" 
                value="Active" 
                sub="Pipeline running" 
                icon={<Zap color="#8b5cf6" />} 
                status="online" 
              />
            </div>

            <div className="grid-main">
              <section className="glass-card" style={{ minHeight: '400px' }}>
                <h3 style={{ marginBottom: '24px' }}>Real-time Telemetry</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readings}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="timestamp" stroke="var(--text-muted)" fontSize={10} tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} />
                      <Tooltip contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--card-border)' }} />
                      <Area type="monotone" dataKey="value" stroke="var(--accent-primary)" fill="url(#colorValue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="glass-card">
                <h3 style={{ marginBottom: '20px', color: 'var(--accent-primary)' }}>AI Analyst Prediction</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {predictMaintenance(readings) ? (
                    <PredictionItem 
                      type="Predictive Engine" 
                      detail="Maintenance Required" 
                      prediction={predictMaintenance(readings)?.outcome} 
                      urgency={predictMaintenance(readings)?.confidence === 'high' ? 'error' : 'warning'} 
                    />
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Gathering telemetry data for trend analysis...
                    </p>
                  )}
                  
                  <div style={{ marginTop: '24px', borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px', fontSize: '1rem' }}>Live Health Check</h4>
                    {readings.length > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                        <div style={{ 
                          width: '10px', height: '10px', borderRadius: '50%', 
                          background: analyzeReading(readings[readings.length-1].sensors?.sensor_types?.name, readings[readings.length-1].value).status === 'Fine' ? 'var(--success)' : 'var(--error)' 
                        }}></div>
                        <div>
                          <p style={{ fontWeight: '600' }}>{analyzeReading(readings[readings.length-1].sensors?.sensor_types?.name, readings[readings.length-1].value).status}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{analyzeReading(readings[readings.length-1].sensors?.sensor_types?.name, readings[readings.length-1].value).message}</p>
                        </div>
                      </div>
                    ) : <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Waiting for field data...</p>}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === 'sensors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <SensorManagement />
            <CsvUpload />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <AlertRules />
            <div className="glass-card">
              <h3 style={{ marginBottom: '20px' }}>Alert History</h3>
              {alerts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No alerts recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts.map(a => (
                    <div key={a.id} style={{ padding: '12px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontWeight: '600' }}>{a.alert_rules?.sensors?.name}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--error)' }}>Value: {a.readings?.value}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(a.triggered_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <PredictionsList />
        )}

        {activeTab === 'settings' && (
          <SettingsView user={user} />
        )}
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', cursor: 'pointer',
        background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
        transition: 'var(--transition-smooth)'
      }}
    >
      {icon}
      <span style={{ fontWeight: '500' }}>{label}</span>
    </div>
  )
}

function StatCard({ title, value, sub, icon, status }: any) {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px' }}>{icon}</div>
        <span className={`status-badge status-${status}`}>{status}</span>
      </div>
      <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</h4>
      <p style={{ fontSize: '1.75rem', fontWeight: '700' }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  )
}

function PredictionItem({ type, detail, prediction, urgency }: any) {
  return (
    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid var(--${urgency})` }}>
      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: `var(--${urgency})` }}>{type}</span>
      <p style={{ fontWeight: '600', margin: '4px 0' }}>{detail}</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{prediction}</p>
    </div>
  )
}
