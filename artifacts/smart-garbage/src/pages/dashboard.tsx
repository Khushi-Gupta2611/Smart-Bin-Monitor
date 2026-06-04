import { useGetStatsSummary, useGetAreaStats, useGetCategoryStats, getGetStatsSummaryQueryKey, getGetAreaStatsQueryKey, getGetCategoryStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle, Leaf, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: isStatsLoading } = useGetStatsSummary({
    query: { queryKey: getGetStatsSummaryQueryKey() }
  });
  
  const { data: areaStats, isLoading: isAreaLoading } = useGetAreaStats({
    query: { queryKey: getGetAreaStatsQueryKey() }
  });
  
  const { data: categoryStats, isLoading: isCategoryLoading } = useGetCategoryStats({
    query: { queryKey: getGetCategoryStatsQueryKey() }
  });

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-[1600px] mx-auto min-h-[100dvh]">
      <div>
        <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">City Intelligence Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of environmental health and community action.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : stats ? (
          <>
            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">
                  {Math.round((stats.completedReports / Math.max(stats.totalReports, 1)) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Of all reported issues</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Issues</CardTitle>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">{stats.pendingReports}</div>
                <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Eco-Points</CardTitle>
                <Leaf className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">{stats.totalEcoPoints.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Awarded to citizens</p>
              </CardContent>
            </Card>
            <Card className="bg-card shadow-sm border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display text-foreground">${stats.totalDonations.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Raised for cleaning drives</p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        {/* Area Stats Chart */}
        <Card className="bg-card shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Pollution by Area</CardTitle>
            <CardDescription>Areas with the highest concentration of reports</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            {isAreaLoading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : areaStats && areaStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="location" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="reportCount" name="Total Reports" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="completedCount" name="Resolved" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Category Stats Chart */}
        <Card className="bg-card shadow-sm border-border flex flex-col">
          <CardHeader>
            <CardTitle>Issue Breakdown</CardTitle>
            <CardDescription>Distribution of report categories</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px] flex items-center justify-center">
            {isCategoryLoading ? (
              <Skeleton className="h-[300px] w-[300px] rounded-full" />
            ) : categoryStats && categoryStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                    stroke="none"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, (name as string).replace('_', ' ')]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    formatter={(value) => <span className="capitalize text-sm text-foreground">{value.replace('_', ' ')}</span>}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
