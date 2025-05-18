"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Briefcase, Navigation, DollarSign, User } from "lucide-react"

interface DriverMobileNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function DriverMobileNav({ className }: DriverMobileNavProps) {
  const pathname = usePathname()

  const routes = [
    {
      label: "Home",
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
      label: "Navigate",
      icon: Navigation,
      href: "/driver/navigation",
      active: pathname === "/driver/navigation",
    },
    {
      label: "Earnings",
      icon: DollarSign,
      href: "/driver/earnings",
      active: pathname === "/driver/earnings",
    },
    {
      label: "Profile",
      icon: User,
      href: "/driver/profile",
      active: pathname === "/driver/profile",
    },
  ]

  return (
    <div className={cn("bg-background border-t h-16", className)}>
      <div className="grid h-full grid-cols-5">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1",
              route.active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span className="text-xs">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
