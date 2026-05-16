import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { sendAlertEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sensor_id, value, timestamp } = body

    if (!sensor_id || value === undefined) {
      return NextResponse.json({ error: 'Missing sensor_id or value' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // 1. Store the reading
    const { data: reading, error: readingError } = await supabase
      .from('readings')
      .insert([{ sensor_id, value, timestamp: timestamp || new Date().toISOString() }])
      .select()
      .single()

    if (readingError) throw readingError

    // 2. Check alert rules for this sensor
    const { data: rules } = await supabase
      .from('alert_rules')
      .select('*, sensors(name)')
      .eq('sensor_id', sensor_id)
      .eq('active', true)

    if (rules) {
      for (const rule of rules) {
        let triggered = false
        if (rule.condition === '>' && value > rule.threshold) triggered = true
        if (rule.condition === '<' && value < rule.threshold) triggered = true
        if (rule.condition === '=' && value === rule.threshold) triggered = true
        if (rule.condition === '>=' && value >= rule.threshold) triggered = true
        if (rule.condition === '<=' && value <= rule.threshold) triggered = true

        if (triggered) {
          // Log the alert
          await supabase.from('alerts').insert([{
            rule_id: rule.id,
            reading_id: reading.id,
            triggered_at: new Date().toISOString()
          }])

          // Send Email notification
          if (rule.email_notify) {
            await sendAlertEmail({
              sensorName: rule.sensors?.name || sensor_id,
              value,
              threshold: rule.threshold,
              condition: rule.condition
            })
          }

          console.log(`Alert triggered for sensor ${sensor_id}: ${value} ${rule.condition} ${rule.threshold}`)
        }
      }
    }

    // 3. Placeholder for Prediction Logic
    // In the future, this is where we'd call an ML model or check trends
    // await runPredictionModel(sensor_id, value)

    return NextResponse.json({ success: true, reading_id: reading.id }, { status: 201 })
  } catch (error: any) {
    console.error('Ingestion Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
