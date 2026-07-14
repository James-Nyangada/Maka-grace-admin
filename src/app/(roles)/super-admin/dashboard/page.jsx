"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import {
  MousePointerClick,
  Users,
  Eye,
  TrendingUp,
  Package,
} from "lucide-react"

// Mock data for Website Statistics
const pageVisitsData = [
  { month: "Jan", visits: 12500 },
  { month: "Feb", visits: 14200 },
  { month: "Mar", visits: 15800 },
  { month: "Apr", visits: 18100 },
  { month: "May", visits: 17500 },
  { month: "Jun", visits: 21000 },
  { month: "Jul", visits: 23500 },
  { month: "Aug", visits: 22000 },
  { month: "Sep", visits: 19000 },
  { month: "Oct", visits: 20500 },
  { month: "Nov", visits: 24000 },
  { month: "Dec", visits: 28000 },
]

const popularPackagesData = [
  { name: "Bali Adventure", views: 4500, enquiries: 120 },
  { name: "Tokyo City Explorer", views: 3200, enquiries: 95 },
  { name: "Paris Romance Getaway", views: 2800, enquiries: 85 },
  { name: "Swiss Alps Retreat", views: 2100, enquiries: 60 },
  { name: "Dubai Luxury Experience", views: 1800, enquiries: 55 },
]

export default function OverviewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Website Statistics</h1>
          <p className="text-muted-foreground">Monitor your website traffic, popular packages, and enquiry conversions.</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Page Visits</p>
                  <p className="text-3xl font-bold text-primary mb-2">240.6K</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Unique Visitors</p>
                  <p className="text-3xl font-bold text-blue-600 mb-2">185.2K</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Enquiry Conversion Rate</p>
                  <p className="text-3xl font-bold text-green-600 mb-2">4.8%</p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +0.5% from last month
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MousePointerClick className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Page Visits Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Page Visits Trend</CardTitle>
              <CardDescription>Monthly website traffic over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pageVisitsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`${value} visits`, "Visits"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Popular Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Packages by Views</CardTitle>
              <CardDescription>Most viewed travel packages on the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularPackagesData} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis dataKey="name" type="category" width={120} className="text-muted-foreground text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name) => [value, name === "views" ? "Page Views" : "Enquiries"]}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Package Enquiry Conversion</CardTitle>
            <CardDescription>Conversion rate of views to enquiries for top packages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {popularPackagesData.map((pkg, idx) => {
                const conversionRate = ((pkg.enquiries / pkg.views) * 100).toFixed(2);
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{pkg.name}</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">{conversionRate}% ({pkg.enquiries} enquiries)</span>
                    </div>
                    <Progress value={Number(conversionRate) * 10} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
