export type Mode = "inspect" | "build" | "deploy" | "creative"
export type Role = "viewer" | "operator" | "deployer" | "admin"
export type MessageType = "text" | "plan" | "diff" | "preview" | "action" | "meta" | "error"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  type: MessageType
  content: string
  timestamp: string
  meta?: Record<string, unknown>
}

export interface Thread {
  id: string
  title: string
  mode: Mode
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface ActionRequest {
  type: "inspect" | "modify" | "deploy" | "rollback"
  tool: string
  target?: string
  payload?: Record<string, unknown>
  confirm?: boolean
}

export interface ActionResponse {
  success: boolean
  status: string
  message: string
  risk: string
  requiresConfirm: boolean
  logId?: string
  result?: unknown
}
