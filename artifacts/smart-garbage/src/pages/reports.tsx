import { useState } from "react";
import { useListReports, getListReportsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Leaf, Search, Filter } from "lucide-react";
export default function Reports() {
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [severity, setSeverity] = useState<string>("all");

  const queryParams = {
    ...(status !== "all" && { status }),
    ...(category !== "all" && { category }),
    ...(severity !== "all" && { severity }),
  };

  const { data: reports, isLoading } = useListReports(
    Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined,
    { query: { queryKey: getListReportsQueryKey(Object.keys(queryParams).length > 0 ? queryParams : undefined) } }
  );

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-primary text-primary-foreground hover:bg-primary/80';
      case 'under_work': return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      case 'pending': return 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20';
      default: return 'bg-accent text-accent-foreground hover:bg-accent/80';
    }
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'text-red-500 font-bold';
      case 'high': return 'text-orange-500 font-semibold';
      case 'medium': return 'text-yellow-600 font-medium';
      case 'low': return 'text-green-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto min-h-[100dvh]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">Environmental Reports</h1>
          <p className="text-muted-foreground mt-1">Browse and track civic issues reported by the community.</p>
        </div>
        <Link href="/report/new" className="block w-full md:w-auto">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            Submit New Report
          </Button>
        </Link>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap min-w-max">
            <Filter className="w-4 h-4" /> Filters
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <Select value={status} onValueChange={(val) => setStatus(val as any)}>
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="under_work">Under Work</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={(val) => setCategory(val as any)}>
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="garbage">Garbage</SelectItem>
                <SelectItem value="illegal_dumping">Illegal Dumping</SelectItem>
                <SelectItem value="water_pollution">Water Pollution</SelectItem>
                <SelectItem value="burning_waste">Burning Waste</SelectItem>
                <SelectItem value="toxic_waste">Toxic Waste</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severity} onValueChange={(val) => setSeverity(val as any)}>
              <SelectTrigger className="w-full bg-background border-input">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
        ) : reports?.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed rounded-xl bg-muted/20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">No reports found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters.</p>
          </div>
        ) : (
          reports?.map((report) => (
            <Link key={report.id} href={`/report/${report.id}`} className="block group">
              <Card className="h-full border-border bg-card shadow-sm group-hover:shadow-md group-hover:border-primary/30 transition-all flex flex-col overflow-hidden">
                {report.imageUrl && (
                  <div className="h-48 w-full overflow-hidden bg-muted">
                    <img 
                      src={report.imageUrl} 
                      alt={report.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className={`${report.imageUrl ? 'pt-4' : ''}`}>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">{report.title}</CardTitle>
                  <CardDescription className="flex items-center justify-between gap-1 text-sm mt-2">
                    <div className="flex items-center gap-1 truncate text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{report.location}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      Severity: <span className={getSeverityColor(report.severity)}>{report.severity}</span>
                    </span>
                    <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> {report.ecoPointsAwarded} pts
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
