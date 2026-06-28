import { useGetStatsSummary, useListRecentReports, getGetStatsSummaryQueryKey, getListRecentReportsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Leaf, MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: stats, isLoading: isLoadingStats } = useGetStatsSummary({
    query: { queryKey: getGetStatsSummaryQueryKey() }
  });

  // const { data: recentReports, isLoading: isLoadingReports } = useListRecentReports({
  //   query: { queryKey: getListRecentReportsQueryKey() }
  // });

  const response = useListRecentReports({
    query: { queryKey: getListRecentReportsQueryKey() }
});

console.log("DATA =", response.data);
console.log("TYPE =", typeof response.data);
console.log("IS ARRAY =", Array.isArray(response.data));

//const recentReports = response.data;
//const isLoadingReports = response.isLoading;

const recentReports = Array.isArray(response.data)
    ? response.data
    : [];

const isLoadingReports = response.isLoading;



  return (
    <div className="flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
          <Leaf className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 mb-6 backdrop-blur-sm border-none">
            Civic Action Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-6">
            Make your city cleaner, together.
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl">
            Report environmental issues, track cleanups in real-time, and earn eco-points for your community contributions.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/report/new" className="block">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg h-14 px-8 rounded-xl shadow-md font-semibold">
                Report an Issue
              </Button>
            </Link>
            <Link href="/reports" className="block">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg h-14 px-8 rounded-xl">
                View Reports
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Summary */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-foreground">Community Impact</h2>
          <Link href="/dashboard" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View full dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingStats ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
          ) : stats ? (
            <>
              <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">{stats.totalReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">Issues reported by citizens</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Issues</CardTitle>
                  <CheckCircle className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">{stats.completedReports}</div>
                  <p className="text-xs text-muted-foreground mt-1">Successfully cleaned</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Volunteers</CardTitle>
                  <Leaf className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">{stats.totalVolunteers}</div>
                  <p className="text-xs text-muted-foreground mt-1">Dedicated to the cause</p>
                </CardContent>
              </Card>
              <Card className="border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Resolution</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold font-display text-foreground">{stats.avgResolutionHours}h</div>
                  <p className="text-xs text-muted-foreground mt-1">From report to clean</p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </section>

      {/* Recent Reports */}
      <section className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-foreground">Recent Activity</h2>
          <Link href="/reports" className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingReports ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
          ) : recentReports?.slice(0, 3).map((report) => (
            <Link key={report.id} href={`/report/${report.id}`} className="block group">
              <Card className="h-full border-border bg-card shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all flex flex-col overflow-hidden">
                {report.imageUrl && (
                  <div className="h-40 w-full overflow-hidden bg-muted">
                    <img 
                      src={report.imageUrl} 
                      alt={report.title} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className={`${report.imageUrl ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant={report.status === 'completed' ? 'default' : report.status === 'pending' ? 'destructive' : 'secondary'} className="capitalize">
                      {report.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-sm mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                    <span className="text-xs text-muted-foreground">Reported by {report.reporterName}</span>
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> +{report.ecoPointsAwarded} pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        {recentReports?.length === 0 && !isLoadingReports && (
          <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">No recent reports</h3>
            <p className="text-muted-foreground text-sm">The city is looking clean! Be the first to report an issue if you see one.</p>
          </div>
        )}
      </section>
    </div>
  );
}
