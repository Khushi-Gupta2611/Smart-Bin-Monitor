import { Link, useLocation } from "wouter";
import {
  Leaf,
  MapPin,
  LayoutDashboard,
  Trophy,
  HeartHandshake,
  Users,
  User,
  Menu,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  async function handleLogout() {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  }

  let navItems = [];

  if (user?.role === "admin") {
    navItems = [
      {
        href: "/admin",
        label: "Admin Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/reports",
        label: "Reports",
        icon: <MapPin className="w-5 h-5" />,
      },
      {
        href: "/leaderboard",
        label: "Leaderboard",
        icon: <Trophy className="w-5 h-5" />,
      },
    ];
  } else if (user?.role === "cleaning_staff") {
    navItems = [
      {
        href: "/staff",
        label: "Staff Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/reports",
        label: "Reports",
        icon: <MapPin className="w-5 h-5" />,
      },
    ];
  } else {
    navItems = [
      {
        href: "/",
        label: "Home",
        icon: <Leaf className="w-5 h-5" />,
      },
      {
        href: "/reports",
        label: "Reports",
        icon: <MapPin className="w-5 h-5" />,
      },
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
      },
      {
        href: "/leaderboard",
        label: "Leaderboard",
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        href: "/profile",
        label: "My Profile",
        icon: <Users className="w-5 h-5" />,
      },
      {
        href: "/donate",
        label: "Donate",
        icon: <HeartHandshake className="w-5 h-5" />,
      },
      {
        href: "/volunteers",
        label: "Volunteers",
        icon: <Users className="w-5 h-5" />,
      },
    ];
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">

      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <Leaf className="w-6 h-6" />
          </div>

          <div>
            <h2 className="font-bold text-xl">EcoGuard</h2>

            <p className="text-xs text-sidebar-foreground/70">
              {user?.name}
            </p>

            <p className="text-xs uppercase text-green-500 font-semibold">
              {user?.role.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));

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

      {/* Bottom */}
      <div className="p-6 border-t border-sidebar-border space-y-3">

        {user?.role === "citizen" && (
          <Link href="/report/new" className="block">
            <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              Report Issue
            </Button>
          </Link>
        )}

        <Button
          variant="destructive"
          className="w-full flex items-center gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>

      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      {/* Desktop */}
      <aside className="hidden md:block w-72 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      {/* Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center justify-between px-4">

        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          <span className="font-bold">EcoGuard</span>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-72 p-0 bg-sidebar"
          >
            <Sidebar />
          </SheetContent>
        </Sheet>

      </div>

      {/* Content */}
      <main className="flex-1 pt-16 md:pt-0">
        {children}
      </main>

    </div>
  );
}