import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { pusherClient } from "@/lib/pusher"
import { toast } from "sonner"
import { PUSHER_EVENTS } from "@/config/constants"
import type { Notification } from "@/types"

export function useNotification() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (session?.user) {
      // Subscribe to notifications
      const channel = pusherClient.subscribe("notifications")

      // Handle new request
      channel.bind(PUSHER_EVENTS.NEW_REQUEST, (data: Notification) => {
        setNotifications((prev) => [data, ...prev])
        setUnreadCount((prev) => prev + 1)
        toast.info(data.message)
      })

      // Handle maintenance request
      channel.bind(PUSHER_EVENTS.MAINTENANCE_REQUEST, (data: Notification) => {
        setNotifications((prev) => [data, ...prev])
        setUnreadCount((prev) => prev + 1)
        toast.info(data.message)
      })

      // Handle status change
      channel.bind(PUSHER_EVENTS.STATUS_CHANGE, (data: Notification) => {
        setNotifications((prev) => [data, ...prev])
        setUnreadCount((prev) => prev + 1)
        toast.info(data.message)
      })

      // Handle low stock
      channel.bind(PUSHER_EVENTS.LOW_STOCK, (data: Notification) => {
        setNotifications((prev) => [data, ...prev])
        setUnreadCount((prev) => prev + 1)
        toast.warning(data.message)
      })

      // Fetch initial notifications
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(data)
          setUnreadCount(data.filter((n: Notification) => !n.read).length)
        })

      return () => {
        channel.unbind_all()
        pusherClient.unsubscribe("notifications")
      }
    }
  }, [session?.user])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      })

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => prev - 1)
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  }
} 