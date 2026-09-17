/**
 * Local Session Telemetry
 * Records focus interval metrics, completion rates, and streak data
 * stored locally with zero third-party tracking.
 */

export class SessionTelemetry {
  constructor(storageKey = "zenflow_session_metrics") {
    this.storageKey = storageKey;
  }

  getMetrics() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : { sessions: [], totalFocusMinutes: 0, streakDays: 0 };
    } catch (e) {
      return { sessions: [], totalFocusMinutes: 0, streakDays: 0 };
    }
  }

  recordSession(durationMinutes, sessionType = "pomodoro") {
    const metrics = this.getMetrics();
    const entry = {
      id: "sess_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      durationMinutes,
      sessionType,
    };

    metrics.sessions.push(entry);
    metrics.totalFocusMinutes += durationMinutes;

    // Retain rolling 100 sessions to bound localStorage footprint
    if (metrics.sessions.length > 100) {
      metrics.sessions = metrics.sessions.slice(-100);
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(metrics));
    } catch (e) {
      console.warn("Telemetry localStorage write failed:", e);
    }

    return entry;
  }

  exportReport() {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }
}
