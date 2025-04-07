"use client"; // Menandai sebagai Client Component

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme/theme-toggle"
import { pusherClient } from "@/lib/pusher"

export function Navbar() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<number>(0)

  useEffect(() => {
    // Subscribe to notifications
    if (session?.user) {
      const channel = pusherClient.subscribe("notifications")
      
      channel.bind("new-request", () => {
        setNotifications((prev) => prev + 1)
      })
      
      return () => {
        channel.unbind_all()
        pusherClient.unsubscribe("notifications")
      }
    }
  }, [session?.user])

  const totalNotifications = notifications

  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold">
          Inventaris
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          {session?.user && (
            <div className="relative">
              <Link href="/notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {totalNotifications > 0 && (
                    <Badge variant="destructive">
                      {totalNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>
            </div>
          )}
          <ThemeToggle />
          {session?.user && (
            <Button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              variant="outline" 
              size="sm"
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 