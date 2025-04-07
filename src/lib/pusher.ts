import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
)

export const CHANNELS = {
  NOTIFICATIONS: "notifications",
  STATUS_CHANGES: "status-changes",
  REQUEST_UPDATES: "request-updates",
} as const

export const EVENTS = {
  NEW_NOTIFICATION: "new-notification",
  STATUS_CHANGED: "status-changed",
  REQUEST_UPDATED: "request-updated",
} as const 