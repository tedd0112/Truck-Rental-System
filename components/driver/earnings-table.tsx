"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChevronDown, Download, Eye } from "lucide-react"

export default function EarningsTable() {
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all")

  // Mock data for earnings
  // In a real app, you would fetch this from your database
  const earnings = [
    {
      id: "job001",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      customer: "Robert Martinez",
      jobType: "Furniture Delivery",
      amount: 105.25,
      status: "completed",
    },
    {
      id: "job002",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      customer: "Lisa Thompson",
      jobType: "Home Goods Delivery",
      amount: 95.0,
      status: "completed",
    },
    {
      id: "job003",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      customer: "Michael Brown",
      jobType: "Construction Materials",
      amount: 150.25,
      status: "completed",
    },
    {
      id: "job004",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      customer: "Emily Johnson",
      jobType: "Moving Boxes",
      amount: 0, // No payment for cancelled job
      status: "cancelled",
    },
    {
      id: "job005",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      customer: "John Smith",
      jobType: "Furniture Delivery",
      amount: 120.5,
      status: "completed",
    },
  ]

  const filteredEarnings = earnings.filter((earning) => filter === "all" || earning.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              Filter: {filter === "all" ? "All Jobs" : filter === "completed" ? "Completed" : "Cancelled"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>All Jobs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("completed")}>Completed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("cancelled")}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Job ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Job Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEarnings.map((earning) => (
              <TableRow key={earning.id}>
                <TableCell>{formatDate(earning.date)}</TableCell>
                <TableCell>{earning.id}</TableCell>
                <TableCell>{earning.customer}</TableCell>
                <TableCell>{earning.jobType}</TableCell>
                <TableCell className="text-right">
                  {earning.status === "cancelled" ? (
                    <span className="text-red-500">Cancelled</span>
                  ) : (
                    formatCurrency(earning.amount)
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
