"use client"

import { useEffect, useRef } from "react"
import { formatCurrency } from "@/lib/utils"

interface EarningsChartProps {
  period: "weekly" | "monthly" | "yearly"
}

export default function EarningsChart({ period }: EarningsChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Mock data for the chart
    // In a real app, you would fetch this from your database
    let labels: string[] = []
    let data: number[] = []

    if (period === "weekly") {
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      data = [120.5, 95.75, 150.25, 85.5, 130.75, 105.25, 95.0]
    } else if (period === "monthly") {
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      data = Array.from({ length: 30 }, () => Math.random() * 150 + 50)
    } else {
      labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      data = [2980.5, 3120.75, 2850.25, 3050.5, 3250.75, 3150.25, 3350.5, 3450.75, 3250.25, 3150.5, 3350.75, 3450.25]
    }

    // Draw the chart
    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Clear the canvas
    ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height)

    // Set canvas dimensions
    const width = chartRef.current.width
    const height = chartRef.current.height
    const padding = 40

    // Calculate scale
    const maxValue = Math.max(...data) * 1.1 // Add 10% padding
    const xStep = (width - padding * 2) / (labels.length - 1)
    const yStep = (height - padding * 2) / maxValue

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#e2e8f0" // Tailwind slate-200
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, height - padding)
    ctx.lineTo(width - padding, height - padding)
    ctx.stroke()

    // Draw y-axis labels
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#64748b" // Tailwind slate-500
    ctx.font = "12px sans-serif"

    const yLabelCount = 5
    for (let i = 0; i <= yLabelCount; i++) {
      const value = (maxValue / yLabelCount) * i
      const y = height - padding - value * yStep
      ctx.fillText(formatCurrency(value), padding - 10, y)

      // Draw horizontal grid line
      ctx.beginPath()
      ctx.strokeStyle = "#e2e8f0" // Tailwind slate-200
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw x-axis labels
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    labels.forEach((label, i) => {
      const x = padding + i * xStep
      ctx.fillText(label, x, height - padding + 10)
    })

    // Draw data line
    ctx.beginPath()
    ctx.strokeStyle = "#3b82f6" // Tailwind blue-500
    ctx.lineWidth = 2
    data.forEach((value, i) => {
      const x = padding + i * xStep
      const y = height - padding - value * yStep
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    data.forEach((value, i) => {
      const x = padding + i * xStep
      const y = height - padding - value * yStep

      ctx.beginPath()
      ctx.fillStyle = "#ffffff" // White
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.strokeStyle = "#3b82f6" // Tailwind blue-500
      ctx.lineWidth = 2
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.stroke()
    })

    // Draw area under the line
    ctx.beginPath()
    ctx.fillStyle = "rgba(59, 130, 246, 0.1)" // Tailwind blue-500 with opacity
    data.forEach((value, i) => {
      const x = padding + i * xStep
      const y = height - padding - value * yStep
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.lineTo(padding + (labels.length - 1) * xStep, height - padding)
    ctx.lineTo(padding, height - padding)
    ctx.closePath()
    ctx.fill()
  }, [period])

  return <canvas ref={chartRef} width={800} height={400} className="w-full h-full"></canvas>
}
