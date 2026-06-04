import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Import pages
import Home from "@/pages/home";
import Reports from "@/pages/reports";
import NewReport from "@/pages/new-report";
import ReportDetail from "@/pages/report-detail";
import Dashboard from "@/pages/dashboard";
import Leaderboard from "@/pages/leaderboard";
import Donate from "@/pages/donate";
import Volunteers from "@/pages/volunteers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/reports" component={Reports} />
        <Route path="/report/new" component={NewReport} />
        <Route path="/report/:id" component={ReportDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/donate" component={Donate} />
        <Route path="/volunteers" component={Volunteers} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
