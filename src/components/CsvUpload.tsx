'use client'

import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function CsvUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setStatus('idle')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    
    // Simulation of CSV parsing and ingestion
    // In production, we would use PapaParse to read rows and call the /api/ingest endpoint in batches
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setStatus('success')
    } catch (err) {
      setStatus('error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="glass-card" style={{ maxWidth: '500px' }}>
      <h3 style={{ marginBottom: '20px' }}>Bulk Data Import</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
        Upload a CSV file containing historical sensor readings for training or backfilling.
      </p>

      <div 
        style={{ 
          border: '2px dashed var(--card-border)', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center',
          cursor: 'pointer',
          background: file ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
          transition: 'var(--transition-smooth)'
        }}
        onClick={() => document.getElementById('csv-input')?.click()}
      >
        <input 
          id="csv-input" 
          type="file" 
          accept=".csv" 
          hidden 
          onChange={handleFileChange} 
        />
        {file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <FileText size={40} color="var(--accent-primary)" />
            <p style={{ fontWeight: '600' }}>{file.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <Upload size={40} color="var(--text-muted)" />
            <p style={{ fontWeight: '500' }}>Click or drag CSV here</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format: sensor_id, value, timestamp</p>
          </div>
        )}
      </div>

      {file && status === 'idle' && (
        <button 
          onClick={handleUpload}
          disabled={uploading}
          style={{ 
            width: '100%', 
            marginTop: '20px', 
            padding: '12px', 
            borderRadius: '12px', 
            background: 'var(--accent-primary)', 
            color: 'white', 
            border: 'none', 
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : 'Process Upload'}
        </button>
      )}

      {status === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px' }}>
          <CheckCircle size={20} />
          <span>Upload successful! {file?.name} has been processed.</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>
          <XCircle size={20} />
          <span>Error processing file. Please check the format.</span>
        </div>
      )}
    </div>
  )
}
