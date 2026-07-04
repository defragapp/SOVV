import { pgTable, uuid, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// ── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:                   uuid("id").primaryKey().defaultRandom(),
  email:                text("email").notNull().unique(),
  passwordHash:         text("password_hash").notNull(),
  tier:                 text("tier").notNull().default("free"),   // 'free' | 'pro'
  stripeCustomerId:     text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt:            timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Sessions (httpOnly cookie-based) ─────────────────────────────────────────
export const sessions = pgTable("sessions", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Baseline Design ───────────────────────────────────────────────────────────
export const baselines = pgTable("baselines", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  // Birth data — primary Baseline Design inputs
  dob:            text("dob").notNull().default(""),   // YYYY-MM-DD
  tob:            text("tob").notNull().default(""),   // time of birth (approx ok; empty = not provided)
  pob:            text("pob").notNull().default(""),   // place of birth
  // Self-reported pattern fields — the calibration layer that refines the computed map
  defaultRetreat: text("default_retreat").notNull().default(""),
  coreBoundary:   text("core_boundary").notNull().default(""),
  repairMechanic: text("repair_mechanic").notNull().default(""),
  // Computed Baseline Design (behavioral signals derived from birth data)
  computedProfile: jsonb("computed_profile"),
  baselineStatus:  text("baseline_status").notNull().default("not_started"), // not_started|ready|degraded|failed
  computedAt:      timestamp("computed_at", { withTimezone: true }),
  updatedAt:       timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Usage events (session metering for tier limits) ───────────────────────────
export const usageEvents = pgTable("usage_events", {
  id:        uuid("id").primaryKey().defaultRandom(),
  userId:    uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind:      text("kind").notNull().default("defrag"),  // which space consumed the session
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Archive Entries (saved Defrag pattern results) ────────────────────────────
export const archiveEntries = pgTable("archive_entries", {
  id:                uuid("id").primaryKey().defaultRandom(),
  userId:            uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  space:             text("space").notNull().default("defrag"),  // 'defrag' | 'covenant' | 'alignment'
  inputText:         text("input_text").notNull().default(""),
  activePattern:     text("active_pattern").notNull(),
  whatsActive:       text("whats_active").notNull(),
  defenseMechanism:  text("defense_mechanism").notNull(),
  resolutionSteps:   jsonb("resolution_steps").notNull().default([]),
  bestNextResponse:  text("best_next_response").notNull(),
  baselineTriggered: boolean("baseline_triggered").notNull().default(false),
  createdAt:         timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Covenants ─────────────────────────────────────────────────────────────────
export const covenants = pgTable("covenants", {
  id:               uuid("id").primaryKey().defaultRandom(),
  userId:           uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title:            text("title").notNull(),
  type:             text("type").notNull(),
  withWhom:         text("with_whom").notNull(),
  boundary:         text("boundary").notNull(),
  costOfViolation:  text("cost_of_violation").notNull(),
  sealed:           text("sealed").notNull(),  // ISO date string YYYY-MM-DD
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Alignment Entries (committed response vectors) ────────────────────────────
export const alignmentEntries = pgTable("alignment_entries", {
  id:           uuid("id").primaryKey().defaultRandom(),
  userId:       uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  personId:     text("person_id").notNull().default("self"),
  personName:   text("person_name").notNull().default("Self"),
  theirPattern: text("their_pattern").notNull(),
  yourResponse: text("your_response").notNull(),
  yourAction:   text("your_action").notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Inferred types ────────────────────────────────────────────────────────────
export type User            = typeof users.$inferSelect;
export type Session         = typeof sessions.$inferSelect;
export type Baseline        = typeof baselines.$inferSelect;
export type ArchiveEntry    = typeof archiveEntries.$inferSelect;
export type Covenant        = typeof covenants.$inferSelect;
export type AlignmentEntry  = typeof alignmentEntries.$inferSelect;

export type InsertUser           = typeof users.$inferInsert;
export type InsertSession        = typeof sessions.$inferInsert;
export type InsertBaseline       = typeof baselines.$inferInsert;
export type InsertArchiveEntry   = typeof archiveEntries.$inferInsert;
export type InsertCovenant       = typeof covenants.$inferInsert;
export type InsertAlignmentEntry = typeof alignmentEntries.$inferInsert;
