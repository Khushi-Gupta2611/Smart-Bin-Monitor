import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import { Layout } from "@/components/layout";

import Login from "@/pages/login";
import Signup from "@/pages/signup";

import Home from "@/pages/home";
import Reports from "@/pages/reports";
import NewReport from "@/pages/new-report";
import ReportDetail from "@/pages/report-detail";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import Donate from "@/pages/donate";
import Volunteers from "@/pages/volunteers";
import ProtectedRoute from "@/components/ProtectedRoute";

import AdminDashboard from "@/pages/admin-dashboard";
import StaffDashboard from "@/pages/staff-dashboard";
import Profile from "@/pages/profile";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/reports" component={Reports} />
        <Route path="/report/new" component={NewReport} />
        <Route path="/report/:id" component={ReportDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/donate" component={Donate} />
        <Route path="/volunteers" component={Volunteers} />

        <Route path="/admin">
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/staff">
          <ProtectedRoute allowedRoles={["cleaning_staff"]}>
            <StaffDashboard />
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}