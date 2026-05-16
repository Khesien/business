import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendAlertEmail({ sensorName, value, threshold, condition }: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@faithbusiness.com'
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    await resend.emails.send({
      from: `Faith Business Alerts <${fromEmail}>`,
      to: adminEmail,
      subject: `🚨 ALERT: Sensor ${sensorName} Threshold Exceeded`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ef4444;">Sensor Alert Triggered</h2>
          <p><strong>Sensor:</strong> ${sensorName}</p>
          <p><strong>Reading:</strong> ${value}</p>
          <p><strong>Threshold Rule:</strong> ${condition} ${threshold}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr />
          <p style="font-size: 0.8rem; color: #666;">This is an automated alert from your Predictive Maintenance Dashboard.</p>
        </div>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Email failed:', error)
    return { success: false, error }
  }
}
