export interface ExplainRequest {
  message: string
  target?: {
    id: string
    relation: Relation
  }
}

export type Relation = "self" | "partner" | "family" | "friend" | "colleague"

export interface ExplainResponse {
  response: string
  shift: Shift
  pressure_points?: PressurePoint[]
  move: Move
  insights: Insight[]
  thread_meta: ThreadMeta
}

export interface Shift {
  label: string
  summary: string
}

export interface PressurePoint {
  type: "emotional" | "structural" | "communication"
  label: string
  description: string
  yours?: string
  theirs?: string
}

export interface Move {
  label: string
  description: string
  difficulty: "gentle" | "moderate" | "direct"
}

export interface Insight {
  id: string
  type: "pattern" | "dynamic" | "baseline"
  title: string
  detail: string
  source: "baseline" | "comparison" | "conversation"
}

export interface ThreadMeta {
  target_id?: string
  target_relation?: Relation
  baseline_loaded: boolean
  target_baseline_loaded?: boolean
}

export interface Person {
  id: string
  name: string
  relation: Relation
  avatar?: string
}

export interface ThreadMessage {
  id: string
  role: "user" | "sovereign"
  content: string
  shift?: Shift
  move?: Move
  insights?: Insight[]
  pressure_points?: PressurePoint[]
  timestamp: number
}

export type Tier = "free" | "pro"
export type SubscriptionStatus = "free" | "active" | "past_due" | "canceled" | "incomplete"