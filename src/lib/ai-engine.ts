interface SensorState {
  status: 'Fine' | 'Low' | 'Critical';
  message: string;
}

export function analyzeReading(type: string, value: number): SensorState {
  const t = type.toLowerCase();
  
  if (t.includes('fuel') || t.includes('water') || t.includes('level')) {
    if (value < 15) return { status: 'Critical', message: 'Level is dangerously low. Refill immediately.' };
    if (value < 30) return { status: 'Low', message: 'Level is dropping. Plan for refill.' };
    return { status: 'Fine', message: 'Levels are optimal.' };
  }
  
  if (t.includes('temp')) {
    if (value > 50) return { status: 'Critical', message: 'Overheating detected. Shut down required.' };
    if (value > 40) return { status: 'Low', message: 'Temperature rising. Check cooling system.' };
    return { status: 'Fine', message: 'Operating temperature stable.' };
  }

  if (t.includes('power') || t.includes('voltage')) {
    if (value < 200) return { status: 'Critical', message: 'Undervoltage detected. Potential brownout.' };
    return { status: 'Fine', message: 'Power supply stable.' };
  }

  return { status: 'Fine', message: 'Sensor operating within normal parameters.' };
}

export function predictMaintenance(readings: any[]) {
  if (readings.length < 5) return null;

  // Simple Linear Trend Analysis (The 'AI' Logic)
  const latest = readings[readings.length - 1];
  const previous = readings[readings.length - 5];
  
  const timeDiff = (new Date(latest.timestamp).getTime() - new Date(previous.timestamp).getTime()) / (1000 * 60 * 60); // hours
  const valueDiff = latest.value - previous.value;
  
  if (timeDiff === 0) return null;
  
  const rateOfChange = valueDiff / timeDiff; // value per hour

  // If level is dropping (e.g. fuel)
  if (rateOfChange < 0 && latest.value > 0) {
    const hoursRemaining = Math.abs(latest.value / rateOfChange);
    return {
      outcome: `Asset expected to run dry/fail in approx. ${hoursRemaining.toFixed(1)} hours`,
      probability: 0.85,
      time: `${hoursRemaining.toFixed(0)}h`,
      confidence: hoursRemaining < 24 ? 'high' : 'medium'
    };
  }

  // If temp is rising
  if (rateOfChange > 0 && latest.sensors?.sensor_types?.name.toLowerCase().includes('temp')) {
    const hoursToCritical = (50 - latest.value) / rateOfChange;
    if (hoursToCritical > 0 && hoursToCritical < 48) {
      return {
        outcome: `Critical temperature threshold will be reached in ${hoursToCritical.toFixed(1)} hours`,
        probability: 0.75,
        time: `${hoursToCritical.toFixed(0)}h`,
        confidence: 'medium'
      };
    }
  }

  return null;
}
