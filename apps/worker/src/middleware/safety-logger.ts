/**
 * Safety event logging system
 * Tracks all safety mode triggers and violations for monitoring and audit
 */

export interface SafetyEvent {
  timestamp: number;
  userId: string;
  severity: "low" | "medium" | "high" | "critical";
  event_type:
    | "risk_word_detected"
    | "rate_limit_exceeded"
    | "validation_error"
    | "support_response_sent"
    | "system_error";
  details: {
    message?: string;
    error?: string;
    riskWord?: string;
    endpoint?: string;
    validation_field?: string;
    ip_address?: string;
  };
  metadata?: {
    sessionId?: string;
    requestId?: string;
    userAgent?: string;
  };
}

export interface SafetyLogger {
  log(event: SafetyEvent): Promise<void>;
  getEvents(userId: string, limit?: number): Promise<SafetyEvent[]>;
  getMetrics(timeWindowMinutes?: number): Promise<SafetyMetrics>;
}

export interface SafetyMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  topRiskWords: Array<{ word: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  timeRange: { start: number; end: number };
}

/**
 * KV-based implementation of SafetyLogger
 * Stores events in KV with daily rotation
 */
export class KVSafetyLogger implements SafetyLogger {
  private kv: any; // KVNamespace
  private prefix: string;

  constructor(kv: any, prefix: string = "safety-events:") {
    this.kv = kv;
    this.prefix = prefix;
  }

  /**
   * Log a safety event to KV storage
   */
  async log(event: SafetyEvent): Promise<void> {
    const date = new Date(event.timestamp);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `${this.prefix}${dateKey}`;

    try {
      // Get existing events for the day
      const stored = await this.kv.get(key);
      let events: SafetyEvent[] = stored ? JSON.parse(stored) : [];

      // Add new event (keep last 10,000 per day to avoid KV limits)
      events.push(event);
      if (events.length > 10000) {
        events = events.slice(-10000);
      }

      // Store back to KV with 1-week expiration
      await this.kv.put(key, JSON.stringify(events), {
        expirationTtl: 7 * 24 * 60 * 60, // 7 days
      });

      // Also increment metrics counter
      await this.incrementMetrics(event);
    } catch (err) {
      console.error("[SafetyLogger] Failed to log event:", err);
      // Don't throw - logging failures shouldn't break the app
    }
  }

  /**
   * Get recent events for a user
   */
  async getEvents(userId: string, limit: number = 100): Promise<SafetyEvent[]> {
    const now = new Date();
    const events: SafetyEvent[] = [];

    // Check last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      const key = `${this.prefix}${dateKey}`;

      try {
        const stored = await this.kv.get(key);
        if (stored) {
          const dayEvents: SafetyEvent[] = JSON.parse(stored);
          events.push(...dayEvents.filter((e) => e.userId === userId));
        }
      } catch {
        // Continue on read errors
      }

      if (events.length >= limit) break;
    }

    // Sort by timestamp descending and limit
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get aggregated metrics for monitoring
   */
  async getMetrics(timeWindowMinutes: number = 1440): Promise<SafetyMetrics> {
    const metrics: SafetyMetrics = {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      topRiskWords: [],
      topUsers: [],
      timeRange: { start: 0, end: Date.now() },
    };

    const windowMs = timeWindowMinutes * 60 * 1000;
    const cutoff = Date.now() - windowMs;

    const now = new Date();
    const daysToCheck = Math.ceil(timeWindowMinutes / (60 * 24));

    // Collect events from recent days
    const allEvents: SafetyEvent[] = [];
    for (let i = 0; i < daysToCheck; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split("T")[0];
      const key = `${this.prefix}${dateKey}`;

      try {
        const stored = await this.kv.get(key);
        if (stored) {
          const dayEvents: SafetyEvent[] = JSON.parse(stored);
          allEvents.push(...dayEvents.filter((e) => e.timestamp > cutoff));
        }
      } catch {
        // Continue on read errors
      }
    }

    // Aggregate metrics
    const riskWordCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};
    metrics.timeRange.start = cutoff;

    for (const event of allEvents) {
      metrics.totalEvents++;

      // Count by type
      metrics.eventsByType[event.event_type] = (metrics.eventsByType[event.event_type] || 0) + 1;

      // Count by severity
      metrics.eventsBySeverity[event.severity] = (metrics.eventsBySeverity[event.severity] || 0) + 1;

      // Track risk words
      if (event.details.riskWord) {
        riskWordCounts[event.details.riskWord] = (riskWordCounts[event.details.riskWord] || 0) + 1;
      }

      // Track users
      userCounts[event.userId] = (userCounts[event.userId] || 0) + 1;
    }

    // Top risk words
    metrics.topRiskWords = Object.entries(riskWordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top users
    metrics.topUsers = Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Increment real-time metrics counter
   */
  private async incrementMetrics(event: SafetyEvent): Promise<void> {
    const metricsKey = `${this.prefix}metrics:hourly`;
    const hour = Math.floor(Date.now() / (60 * 60 * 1000));
    const key = `${metricsKey}:${hour}`;

    try {
      const stored = await this.kv.get(key);
      let count = stored ? parseInt(stored, 10) : 0;
      count++;

      await this.kv.put(key, String(count), {
        expirationTtl: 7 * 24 * 60 * 60, // 7 days
      });
    } catch (err) {
      console.error("[SafetyLogger] Failed to increment metrics:", err);
    }
  }
}

/**
 * Helper to create safety events
 */
export function createSafetyEvent(
  userId: string,
  event_type: SafetyEvent["event_type"],
  severity: SafetyEvent["severity"],
  details: SafetyEvent["details"],
  metadata?: SafetyEvent["metadata"]
): SafetyEvent {
  return {
    timestamp: Date.now(),
    userId,
    event_type,
    severity,
    details,
    metadata,
  };
}

/**
 * Alert levels based on event frequency
 */
export interface AlertThreshold {
  riskWordDetections: number; // Per hour
  rateLimitExceeds: number; // Per hour
  validationErrors: number; // Per hour
}

export const DEFAULT_ALERT_THRESHOLDS: AlertThreshold = {
  riskWordDetections: 10,
  rateLimitExceeds: 50,
  validationErrors: 20,
};

/**
 * Check if metrics exceed alert thresholds
 */
export function checkAlertThresholds(metrics: SafetyMetrics, thresholds: AlertThreshold = DEFAULT_ALERT_THRESHOLDS): string[] {
  const alerts: string[] = [];

  const riskWordCount = metrics.eventsByType["risk_word_detected"] || 0;
  if (riskWordCount > thresholds.riskWordDetections) {
    alerts.push(`HIGH: ${riskWordCount} risk word detections in the last hour`);
  }

  const rateLimitCount = metrics.eventsByType["rate_limit_exceeded"] || 0;
  if (rateLimitCount > thresholds.rateLimitExceeds) {
    alerts.push(`HIGH: ${rateLimitCount} rate limit violations in the last hour`);
  }

  const validationCount = metrics.eventsByType["validation_error"] || 0;
  if (validationCount > thresholds.validationErrors) {
    alerts.push(`MEDIUM: ${validationCount} validation errors in the last hour`);
  }

  return alerts;
}
