import { describe, it, expect, beforeEach } from "vitest";
import {
  KVSafetyLogger,
  createSafetyEvent,
  checkAlertThresholds,
  DEFAULT_ALERT_THRESHOLDS,
  type SafetyMetrics,
} from "../src/middleware/safety-logger";

// Mock KV storage
class MockKV {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async put(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getAllKeys(): string[] {
    return Array.from(this.store.keys());
  }
}

describe("SafetyLogger", () => {
  let mockKv: MockKV;
  let logger: KVSafetyLogger;

  beforeEach(() => {
    mockKv = new MockKV();
    logger = new KVSafetyLogger(mockKv as any);
  });

  describe("log", () => {
    it("logs a safety event", async () => {
      const event = createSafetyEvent("user:123", "risk_word_detected", "high", {
        riskWord: "suicide",
        message: "User mentioned 'suicide' in message",
      });

      await logger.log(event);

      // Verify event was stored
      const today = new Date().toISOString().split("T")[0];
      const key = `safety-events:${today}`;
      const stored = await mockKv.get(key);
      expect(stored).toBeTruthy();

      const events = JSON.parse(stored!);
      expect(events).toHaveLength(1);
      expect(events[0].event_type).toBe("risk_word_detected");
      expect(events[0].userId).toBe("user:123");
    });

    it("appends to existing events for the day", async () => {
      const event1 = createSafetyEvent("user:123", "risk_word_detected", "high", {
        riskWord: "harm",
      });
      const event2 = createSafetyEvent("user:456", "validation_error", "medium", {
        validation_field: "message",
      });

      await logger.log(event1);
      await logger.log(event2);

      const today = new Date().toISOString().split("T")[0];
      const key = `safety-events:${today}`;
      const stored = await mockKv.get(key);

      const events = JSON.parse(stored!);
      expect(events).toHaveLength(2);
    });

    it("includes metadata in logged event", async () => {
      const event = createSafetyEvent("user:789", "rate_limit_exceeded", "low", {}, {
        sessionId: "sess:xyz",
        userAgent: "Mozilla/5.0",
      });

      await logger.log(event);

      const today = new Date().toISOString().split("T")[0];
      const stored = await mockKv.get(`safety-events:${today}`)!;
      const events = JSON.parse(stored);

      expect(events[0].metadata.sessionId).toBe("sess:xyz");
      expect(events[0].metadata.userAgent).toBe("Mozilla/5.0");
    });
  });

  describe("getEvents", () => {
    it("retrieves events for a user", async () => {
      const event1 = createSafetyEvent("user:123", "risk_word_detected", "high", {
        riskWord: "suicide",
      });
      const event2 = createSafetyEvent("user:456", "risk_word_detected", "high", {
        riskWord: "harm",
      });

      await logger.log(event1);
      await logger.log(event2);

      const userEvents = await logger.getEvents("user:123");
      expect(userEvents).toHaveLength(1);
      expect(userEvents[0].userId).toBe("user:123");
    });

    it("returns empty array if no events for user", async () => {
      const events = await logger.getEvents("user:no-events");
      expect(events).toEqual([]);
    });

    it("respects limit parameter", async () => {
      // Log 5 events for same user
      for (let i = 0; i < 5; i++) {
        const event = createSafetyEvent("user:limited", "risk_word_detected", "high", {
          riskWord: `word${i}`,
        });
        await logger.log(event);
      }

      const events = await logger.getEvents("user:limited", 3);
      expect(events).toHaveLength(3);
    });

    it("sorts events by timestamp descending", async () => {
      const now = Date.now();

      // Create events with different timestamps
      const event1 = createSafetyEvent("user:sort", "risk_word_detected", "high", {});
      event1.timestamp = now - 1000;

      const event2 = createSafetyEvent("user:sort", "risk_word_detected", "high", {});
      event2.timestamp = now;

      const event3 = createSafetyEvent("user:sort", "risk_word_detected", "high", {});
      event3.timestamp = now - 2000;

      await logger.log(event1);
      await logger.log(event2);
      await logger.log(event3);

      const events = await logger.getEvents("user:sort");
      expect(events[0].timestamp).toBeGreaterThan(events[1].timestamp);
      expect(events[1].timestamp).toBeGreaterThan(events[2].timestamp);
    });
  });

  describe("getMetrics", () => {
    it("aggregates event metrics", async () => {
      await logger.log(
        createSafetyEvent("user:123", "risk_word_detected", "high", {
          riskWord: "suicide",
        })
      );
      await logger.log(
        createSafetyEvent("user:123", "risk_word_detected", "high", {
          riskWord: "suicide",
        })
      );
      await logger.log(
        createSafetyEvent("user:456", "rate_limit_exceeded", "low", {})
      );

      const metrics = await logger.getMetrics();

      expect(metrics.totalEvents).toBe(3);
      expect(metrics.eventsByType["risk_word_detected"]).toBe(2);
      expect(metrics.eventsByType["rate_limit_exceeded"]).toBe(1);
    });

    it("counts events by severity", async () => {
      await logger.log(
        createSafetyEvent("user:123", "risk_word_detected", "critical", {})
      );
      await logger.log(
        createSafetyEvent("user:123", "risk_word_detected", "high", {})
      );
      await logger.log(
        createSafetyEvent("user:456", "rate_limit_exceeded", "low", {})
      );

      const metrics = await logger.getMetrics();

      expect(metrics.eventsBySeverity["critical"]).toBe(1);
      expect(metrics.eventsBySeverity["high"]).toBe(1);
      expect(metrics.eventsBySeverity["low"]).toBe(1);
    });

    it("tracks top risk words", async () => {
      await logger.log(
        createSafetyEvent("user:123", "risk_word_detected", "high", {
          riskWord: "suicide",
        })
      );
      await logger.log(
        createSafetyEvent("user:456", "risk_word_detected", "high", {
          riskWord: "suicide",
        })
      );
      await logger.log(
        createSafetyEvent("user:789", "risk_word_detected", "high", {
          riskWord: "harm",
        })
      );

      const metrics = await logger.getMetrics();

      expect(metrics.topRiskWords).toHaveLength(2);
      expect(metrics.topRiskWords[0].word).toBe("suicide");
      expect(metrics.topRiskWords[0].count).toBe(2);
      expect(metrics.topRiskWords[1].word).toBe("harm");
      expect(metrics.topRiskWords[1].count).toBe(1);
    });

    it("tracks top users", async () => {
      // User 1: 3 events
      for (let i = 0; i < 3; i++) {
        await logger.log(
          createSafetyEvent("user:active", "risk_word_detected", "high", {})
        );
      }

      // User 2: 1 event
      await logger.log(
        createSafetyEvent("user:quiet", "rate_limit_exceeded", "low", {})
      );

      const metrics = await logger.getMetrics();

      expect(metrics.topUsers).toHaveLength(2);
      expect(metrics.topUsers[0].userId).toBe("user:active");
      expect(metrics.topUsers[0].count).toBe(3);
    });

    it("respects time window", async () => {
      const now = Date.now();

      // Event within window
      const recentEvent = createSafetyEvent("user:123", "risk_word_detected", "high", {});
      recentEvent.timestamp = now - 30 * 60 * 1000; // 30 minutes ago

      // Event outside window
      const oldEvent = createSafetyEvent("user:456", "risk_word_detected", "high", {});
      oldEvent.timestamp = now - 25 * 60 * 60 * 1000; // 25 hours ago

      await logger.log(recentEvent);
      await logger.log(oldEvent);

      // Check 60-minute window
      const metrics = await logger.getMetrics(60);

      expect(metrics.totalEvents).toBe(1);
      expect(metrics.topUsers[0].userId).toBe("user:123");
    });
  });

  describe("createSafetyEvent", () => {
    it("creates event with current timestamp", () => {
      const before = Date.now();
      const event = createSafetyEvent("user:123", "risk_word_detected", "high", {});
      const after = Date.now();

      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });

    it("creates event with all properties", () => {
      const event = createSafetyEvent("user:123", "risk_word_detected", "high", {
        riskWord: "suicide",
        message: "Test message",
      });

      expect(event.userId).toBe("user:123");
      expect(event.event_type).toBe("risk_word_detected");
      expect(event.severity).toBe("high");
      expect(event.details.riskWord).toBe("suicide");
      expect(event.details.message).toBe("Test message");
    });
  });

  describe("checkAlertThresholds", () => {
    it("returns no alerts when within thresholds", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 5,
        eventsByType: {
          risk_word_detected: 5,
          rate_limit_exceeded: 0,
          validation_error: 0,
        },
        eventsBySeverity: { high: 5, low: 0, medium: 0, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      const alerts = checkAlertThresholds(metrics);
      expect(alerts).toHaveLength(0);
    });

    it("alerts on excessive risk word detections", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 15,
        eventsByType: {
          risk_word_detected: 15,
          rate_limit_exceeded: 0,
          validation_error: 0,
        },
        eventsBySeverity: { high: 15, low: 0, medium: 0, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      const alerts = checkAlertThresholds(metrics);
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toContain("risk word detections");
    });

    it("alerts on excessive rate limit violations", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 100,
        eventsByType: {
          risk_word_detected: 0,
          rate_limit_exceeded: 100,
          validation_error: 0,
        },
        eventsBySeverity: { high: 0, low: 100, medium: 0, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      const alerts = checkAlertThresholds(metrics);
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toContain("rate limit violations");
    });

    it("alerts on excessive validation errors", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 30,
        eventsByType: {
          risk_word_detected: 0,
          rate_limit_exceeded: 0,
          validation_error: 30,
        },
        eventsBySeverity: { high: 0, low: 0, medium: 30, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      const alerts = checkAlertThresholds(metrics);
      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toContain("validation errors");
    });

    it("returns multiple alerts when multiple thresholds exceeded", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 200,
        eventsByType: {
          risk_word_detected: 20,
          rate_limit_exceeded: 100,
          validation_error: 80,
        },
        eventsBySeverity: { high: 20, low: 100, medium: 80, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      const alerts = checkAlertThresholds(metrics);
      expect(alerts.length).toBeGreaterThan(1);
    });

    it("supports custom thresholds", () => {
      const metrics: SafetyMetrics = {
        totalEvents: 15,
        eventsByType: {
          risk_word_detected: 15,
          rate_limit_exceeded: 0,
          validation_error: 0,
        },
        eventsBySeverity: { high: 15, low: 0, medium: 0, critical: 0 },
        topRiskWords: [],
        topUsers: [],
        timeRange: { start: 0, end: Date.now() },
      };

      // Use high threshold
      const alerts = checkAlertThresholds(metrics, { ...DEFAULT_ALERT_THRESHOLDS, riskWordDetections: 100 });
      expect(alerts).toHaveLength(0);

      // Use low threshold
      const alerts2 = checkAlertThresholds(metrics, { ...DEFAULT_ALERT_THRESHOLDS, riskWordDetections: 5 });
      expect(alerts2.length).toBeGreaterThan(0);
    });
  });
});
