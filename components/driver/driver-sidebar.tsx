"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Home,
  Briefcase,
  Navigation,
  DollarSign,
  User,
  Menu,
  MessageSquare,
  Clock,
  Star,
  HelpCircle,
  LogOut,
  Truck,
} from "lucide-react"
import { useAuth } from "@/lib/auth"

interface DriverSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function DriverSidebar({ className }: DriverSidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/driver",
      active: pathname === "/driver",
    },
    {
      label: "Jobs",
      icon: Briefcase,
      href: "/driver/jobs",
      active: pathname === "/driver/jobs" || pathname.startsWith("/driver/jobs/"),
    },
    {
      label: "Navigation",
      icon: Navigation,
      href: "/driver/navigation",
      active: pathname === "/driver/navigation",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/driver/messages",
      active: pathname === "/driver/messages",
    },
    {
      label: "Earnings",
      icon: DollarSign,
      href: "/driver/earnings",
      active: pathname === "/driver/earnings",
    },
    {
      label: "Job History",
      icon: Clock,
      href: "/driver/history",
      active: pathname === "/driver/history",
    },
    {
      label: "Ratings",
      icon: Star,
      href: "/driver/ratings",
      active: pathname === "/driver/ratings",
    },
    {
      label: "Profile",
      icon: User,
      href: "/driver/profile",
      active: pathname === "/driver/profile",
    },
    {
      label: "Support",
      icon: HelpCircle,
      href: "/driver/support",
      active: pathname === "/driver/support",
    },
  ]

  return (
    <div className={cn("pb-12 border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold tracking-tight">Driver App</h2>
          </div>
          <div className="hidden md:flex">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden">
                <MobileSidebar routes={routes} onSignOut={signOut} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <div className="px-3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-5 w-5" />
                    {route.label}
                  </Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function MobileSidebar({
  routes,
  onSignOut,
}: {
  routes: { label: string; icon: any; href: string; active: boolean }[]
  onSignOut: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-2 py-4">
        <Truck className="h-6 w-6 text-blue-600" />
        <h2 className="text-lg font-semibold tracking-tight">Driver App</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {routes.map((route) => (
            <Button
              key={route.href}
              variant={route.active ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href={route.href}>
                <route.icon className="mr-2 h-5 w-5" />
                {route.label}
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 mt-auto">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
