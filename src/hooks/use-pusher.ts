import { useEffect } from "react"
import { pusherClient } from "@/lib/pusher"
import type { Channel } from "pusher-js"

interface UsePusherOptions {
  channelName: string
  eventName: string
  callback: (data: any) => void
}

export function usePusher({ channelName, eventName, callback }: UsePusherOptions) {
  useEffect(() => {
    let channel: Channel

    try {
      // Subscribe to channel
      channel = pusherClient.subscribe(channelName)

      // Bind to event
      channel.bind(eventName, callback)
    } catch (error) {
      console.error("Error in Pusher subscription:", error)
    }

    // Cleanup
    return () => {
      try {
        if (channel) {
          channel.unbind(eventName)
          pusherClient.unsubscribe(channelName)
        }
      } catch (error) {
        console.error("Error in Pusher cleanup:", error)
      }
    }
  }, [channelName, eventName, callback])
}

export function usePusherMultipleEvents(
  channelName: string,
  events: { [key: string]: (data: any) => void }
) {
  useEffect(() => {
    let channel: Channel

    try {
      // Subscribe to channel
      channel = pusherClient.subscribe(channelName)

      // Bind all events
      Object.entries(events).forEach(([eventName, callback]) => {
        channel.bind(eventName, callback)
      })
    } catch (error) {
      console.error("Error in Pusher subscription:", error)
    }

    // Cleanup
    return () => {
      try {
        if (channel) {
          Object.keys(events).forEach((eventName) => {
            channel.unbind(eventName)
          })
          pusherClient.unsubscribe(channelName)
        }
      } catch (error) {
        console.error("Error in Pusher cleanup:", error)
      }
    }
  }, [channelName, events])
} 