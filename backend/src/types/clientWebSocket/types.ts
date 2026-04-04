import type { ServerWebSocket } from "bun"

export type ClientWebSocket = ServerWebSocket & {
  userId: string
}