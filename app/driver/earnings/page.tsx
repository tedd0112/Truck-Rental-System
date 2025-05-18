import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase-server"
import { formatCurrency } from "@/lib/utils"
import { Download } from "lucide-react"
import EarningsChart from "@/components/driver/earnings-chart"
import EarningsTable from "@/components/driver/earnings-table"

export default async function DriverEarningsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Mock data for earnings
  // In a real app, you would fetch this from your database
  const earnings = {
    today: 120.5,
    thisWeek: 750.25,
    thisMonth: 3250.75,
    lastMonth: 2980.5,
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
          <p className="text-muted-foreground">Track your income and payment history</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Statement
        </Button>
      </div>

      {/* Earnings Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <h3 className="text-2xl font-bold">{formatCurrency(earnings.today)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Week</p>
            <h3 className="text-2xl font-bold">{formatCurrency(earnings.thisWeek)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">This Month</p>
            <h3 className="text-2xl font-bold">{formatCurrency(earnings.thisMonth)}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Last Month</p>
            <h3 className="text-2xl font-bold">{formatCurrency(earnings.lastMonth)}</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Earnings</CardTitle>
              <CardDescription>Your earnings for the past 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EarningsChart period="weekly" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
              <CardDescription>Your earnings for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EarningsChart period="monthly" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearly">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Earnings</CardTitle>
              <CardDescription>Your earnings for the past 12 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EarningsChart period="yearly" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>Detailed view of your earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <EarningsTable />
        </CardContent>
      </Card>
    </div>
  )
}
