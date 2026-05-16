'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Bell, Loader2 } from 'lucide-react'

export default function AlertRules() {
  const [rules, setRules] = useState<any[]>([])
  const [sensors, setSensors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newRule, setNewRule] = useState({
    sensor_id: '',
    condition: '>',
    threshold: 0,
    email_notify: true
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: ruleData } = await supabase.from('alert_rules').select('*, sensors(name)')
    const { data: sensorData } = await supabase.from('sensors').select('*')
    if (ruleData) setRules(ruleData)
    if (sensorData) setSensors(sensorData)
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newRule.sensor_id) return
    const { error } = await supabase.from('alert_rules').insert([newRule])
    if (!error) {
      setNewRule({ sensor_id: '', condition: '>', threshold: 0, email_notify: true })
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('alert_rules').delete().eq('id', id)
    if (!error) fetchData()
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="animate-spin" /></div>

  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Alert Rules</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '2fr 1fr 1fr auto auto', 
          gap: '12px', 
          padding: '16px', 
          borderRadius: '12px', 
          background: 'rgba(255,255,255,0.03)',
          marginBottom: '12px',
          alignItems: 'center'
        }}>
          <select 
            value={newRule.sensor_id}
            onChange={(e) => setNewRule({...newRule, sensor_id: e.target.value})}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px', color: 'white' }}
          >
            <option value="">Select Sensor</option>
            {sensors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            value={newRule.condition}
            onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px', color: 'white' }}
          >
            <option value=">">{'>'}</option>
            <option value="<">{'<'}</option>
            <option value="=">{'='}</option>
            <option value=">=">{'>='}</option>
            <option value="<=">{'<='}</option>
          </select>
          <input 
            type="number" 
            value={newRule.threshold}
            onChange={(e) => setNewRule({...newRule, threshold: parseFloat(e.target.value)})}
            style={{ background: 'transparent', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '8px', color: 'white' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <input 
              type="checkbox" 
              checked={newRule.email_notify} 
              onChange={(e) => setNewRule({...newRule, email_notify: e.target.checked})}
            />
            Email
          </div>
          <button 
            onClick={handleAdd}
            style={{ background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', padding: '8px 16px', color: 'white', cursor: 'pointer' }}
          >
            <Plus size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rules.map(rule => (
            <div key={rule.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr auto auto', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.02)',
              alignItems: 'center'
            }}>
              <span style={{ fontWeight: '500' }}>{rule.sensors?.name}</span>
              <span style={{ color: 'var(--accent-secondary)' }}>{rule.condition}</span>
              <span style={{ fontWeight: '600' }}>{rule.threshold}</span>
              <div style={{ display: 'flex', color: rule.email_notify ? 'var(--success)' : 'var(--text-muted)' }}>
                <Bell size={16} />
              </div>
              <button 
                onClick={() => handleDelete(rule.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
