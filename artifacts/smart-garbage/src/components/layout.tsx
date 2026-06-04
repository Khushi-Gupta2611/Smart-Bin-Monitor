import { Link, useLocation } from "wouter";
import { 
  Leaf, 
  MapPin, 
  LayoutDashboard, 
  Trophy, 
  HeartHandshake, 
  Users,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Home", icon: <Leaf className="w-5 h-5" /> },
    { href: "/reports", label: "Reports", icon: <MapPin className="w-5 h-5" /> },
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy className="w-5 h-5" /> },
    { href: "/donate", label: "Donate", icon: <HeartHandshake className="w-5 h-5" /> },
    { href: "/volunteers", label: "Volunteers", icon: <Users className="w-5 h-5" /> },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
          <Leaf className="w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight">EcoGuard</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-sidebar-border">
        <Link href="/report/new" className="block">
          <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md">
            Report Issue
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border text-sidebar-foreground z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-1.5 rounded-md">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg">EcoGuard</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:pt-0 pt-16 h-full min-h-screen">
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
