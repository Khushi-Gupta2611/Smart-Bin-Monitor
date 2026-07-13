import { useParams, Link } from "wouter";
import { useGetReport, getGetReportQueryKey, useUpdateReportStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Clock, Leaf, AlertTriangle, User, ArrowLeft, Loader2, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { ReportStatusUpdateStatus } from "@workspace/api-client-react";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const reportId = parseInt(id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: report, isLoading, isError } = useGetReport(reportId, {
    query: { enabled: !!reportId, queryKey: getGetReportQueryKey(reportId) }
  });

  const updateStatus = useUpdateReportStatus();
  const [newStatus, setNewStatus] = useState<ReportStatusUpdateStatus | "">("");
  const [completionImageUrl, setCompletionImageUrl] = useState("");

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    
    updateStatus.mutate(
      { 
        id: reportId, 
        data: {
          status: newStatus as ReportStatusUpdateStatus,
          completionImageUrl:
            newStatus === "completed"
              ? completionImageUrl
              : undefined,
        }
      },
      {
        onSuccess: (updatedData) => {
          toast({
            title: "Status Updated",
            description: `Report status changed to ${newStatus.replace('_', ' ')}`,
          });
          queryClient.setQueryData(getGetReportQueryKey(reportId), updatedData);
          setNewStatus("");
        },
        onError: () => {
          toast({
            title: "Update Failed",
            description: "Could not update report status.",
            variant: "destructive"
          });
        }
      }
    );
  };

  async function handleDelete() {
  if (!confirm("Are you sure you want to delete this report?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3001/api/reports/${reportId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast({
        title: "Error",
        description: data.error,
        variant: "destructive",
      });

      return;
    }

    toast({
      title: "Deleted",
      description: "Report deleted successfully.",
    });

    navigate("/reports");
  } catch {
    toast({
      title: "Error",
      description: "Could not delete report.",
      variant: "destructive",
    });
  }
}

  if (isLoading) {
    return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-96 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <AlertTriangle className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
        <h2 className="text-2xl font-bold font-display text-foreground mb-2">Report Not Found</h2>
        <p className="text-muted-foreground mb-6">The report you are looking for does not exist or has been removed.</p>
        <Link href="/reports">
          <Button>Back to Reports</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'under_work': return 'bg-secondary text-secondary-foreground';
      case 'pending': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const timelineSteps = ['pending', 'accepted', 'under_work', 'completed'];
  const currentStepIndex = timelineSteps.indexOf(report.status);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-[100dvh]">
      <Link href="/reports" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Reports
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground tracking-tight">{report.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(report.createdAt).toLocaleString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {report.location}</span>
          </div>
        </div>
        <Badge className={`text-base px-4 py-1.5 ${getStatusColor(report.status)} capitalize`}>
          {report.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Before Cleaning */}
          {report.imageUrl && (
            <Card className="shadow-sm border-border">
              <CardHeader>
                <CardTitle>Before Cleaning</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="w-full h-[400px] rounded-xl overflow-hidden">
                  <img
                    src={report.imageUrl || "/placeholder.png"}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                    alt="Before Cleaning"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* After Cleaning */}
          {report.completionImageUrl && (
            <Card className="shadow-sm border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">
                  After Cleaning ✅
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="w-full h-[400px] rounded-xl overflow-hidden">
                  <img
                    src={report.completionImageUrl || "/placeholder.png"}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.png";
                    }}
                    alt="After Cleaning"
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl">Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{report.description}</p>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl">Status Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full hidden sm:block"></div>
                <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                  {timelineSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step} className="flex flex-row sm:flex-col items-center gap-4 sm:gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${
                          isCompleted ? 'bg-primary border-primary/20 text-primary-foreground' : 'bg-muted border-background text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-primary/20 ring-offset-2 ring-offset-background' : ''}`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current opacity-50" />}
                        </div>
                        <span className={`text-sm font-medium capitalize ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Report Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                <Badge variant="outline" className="capitalize text-sm bg-accent/30">{report.category.replace('_', ' ')}</Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Severity</p>
                <Badge variant="outline" className={`capitalize text-sm ${getSeverityColor(report.severity)}`}>
                  {report.severity}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Reporter</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{report.reporterName}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Assigned To</p>
                {report.assignedTo ? (
                  <span className="font-medium">{report.assignedTo}</span>
                ) : (
                  <span className="text-muted-foreground italic text-sm">Unassigned</span>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-3 bg-secondary/10 p-3 rounded-lg border border-secondary/20">
                  <div className="p-2 bg-secondary rounded-md text-secondary-foreground shrink-0">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                  <p className="text-sm font-bold text-foreground">
                    {report.status === "completed"
                      ? "Eco Points Earned"
                      : "Potential Eco Points"}
                  </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold font-display text-secondary">
                        {report.ecoPointsAwarded}
                      </p>

                      {report.status === "completed" && (
                        <span className="text-green-600 font-semibold">
                          ✅ Earned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authority Actions */}
          {user?.role !== "citizen" && (
            <Card className="shadow-md border-primary/20 bg-card overflow-hidden">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Staff Actions
                </CardTitle>

                <CardDescription className="mt-1">
                  Update report status (Admin/Staff only)
                </CardDescription>
              </div>

              <CardContent className="pt-6">
                <div className="space-y-4">

                  <Select
                    value={newStatus}
                    onValueChange={(val: any) => setNewStatus(val)}
                  >
                    <SelectTrigger className="w-full bg-background border-input">
                      <SelectValue placeholder="Update Status..." />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="under_work">Under Work</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Show only when Completed is selected */}
                  {newStatus === "completed" && (
                    <Input
                      placeholder="Paste completion image URL"
                      value={completionImageUrl}
                      onChange={(e) =>
                        setCompletionImageUrl(e.target.value)
                      }
                    />
                  )}

                  <Button
                    className="w-full"
                    disabled={
                      !newStatus ||
                      newStatus === report.status ||
                      updateStatus.isPending
                    }
                    onClick={handleStatusUpdate}
                  >
                    {updateStatus.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}

                    Save Changes
                  </Button>

                </div>
              </CardContent>
            </Card>
          )}

          {user?.role === "citizen" &&
          report.reporterId === user.id &&
          report.status === "pending" && (
            <Card className="shadow-md border-red-200 bg-red-50/40 dark:bg-red-950/20">
              <CardContent className="p-6">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Report
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}