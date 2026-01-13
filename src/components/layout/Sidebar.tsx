import { Home, Search, Library, Upload, Heart, Clock, User, LogIn, LogOut, Menu, X, Disc3, Calendar, Disc, Crown, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { UpgradeButton } from "@/components/subscription/PremiumFeatureGate";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [{
    icon: Home,
    label: "Home",
    path: "/"
  }, {
    icon: Search,
    label: "Search",
    path: "/search"
  }, {
    icon: Disc3,
    label: "DJ Beats",
    path: "/dj"
  }, {
    icon: Library,
    label: "Your Library",
    path: "/library"
  }, {
    icon: Upload,
    label: "Upload",
    path: "/upload"
  }];
  const libraryItems = [{
    icon: Heart,
    label: "Liked Songs",
    path: "/liked"
  }, {
    icon: Disc,
    label: "Liked Albums",
    path: "/liked-albums"
  }, {
    icon: Clock,
    label: "Recently Played",
    path: "/recent"
  }, {
    icon: Calendar,
    label: "Year in Music",
    path: "/recap"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };
  const handleNavClick = () => {
    if (isMobile) setIsOpen(false);
  };

  // Mobile toggle button
  if (isMobile) {
    return <>
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-sidebar/90 backdrop-blur-sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        {/* Overlay */}
        {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" onClick={() => setIsOpen(false)} />}

        {/* Mobile Sidebar */}
        <aside className={cn("fixed top-0 left-0 w-64 bg-sidebar h-screen flex flex-col border-r border-sidebar-border z-50 transition-transform duration-300", isOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="p-4 pt-16 flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">JB</span>
              </div>
              James Beats
            </h1>
            <ThemeToggle />
          </div>

          <nav className="flex-1 px-2">
            <div className="space-y-1">
              {navItems.map(item => {
              const isActive = location.pathname === item.path;
              return <Link key={item.path} to={item.path} onClick={handleNavClick} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>;
            })}
            </div>

            <div className="mt-6">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase mb-2">
                Your Collection
              </h3>
              <div className="space-y-1">
                {libraryItems.map(item => {
                const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} onClick={handleNavClick} className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>;
              })}
              </div>
            </div>
          </nav>

          <div className="p-3 border-t border-sidebar-border space-y-2">
            <UpgradeButton className="w-full text-sm" />
            {user ? <>
                <Link to="/profile" onClick={handleNavClick} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground text-sm">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </> : <Link to="/auth" onClick={handleNavClick}>
                <Button variant="glow" size="sm" className="w-full gap-2 text-sm">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>}
          </div>
        </aside>
      </>;
  }

  return <aside className="w-72 bg-sidebar h-screen flex flex-col border-r border-sidebar-border">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-base font-bold">JB</span>
          </div>
          James Beats
        </h1>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-1">
          {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return <Link key={item.path} to={item.path} className={cn("flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                <item.icon className="w-6 h-6" />
                <span className="text-base">{item.label}</span>
              </Link>;
        })}
        </div>

        <div className="mt-10">
          <h3 className="px-4 text-sm font-semibold text-muted-foreground uppercase mb-3">
            Your Collection
          </h3>
          <div className="space-y-1">
            {libraryItems.map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} className={cn("flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/50")}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>;
          })}
          </div>
        </div>
      </nav>

      <div className="p-5 border-t border-sidebar-border space-y-3 py-[60px]">
        <UpgradeButton className="w-full" />
        {user ? <>
            <Link to="/profile" className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200">
              <User className="w-6 h-6" />
              <span>{user.email?.split('@')[0]}</span>
            </Link>
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-4 px-4 text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
              Sign Out
            </Button>
          </> : <Link to="/auth">
            <Button variant="glow" className="w-full gap-3 py-3">
              <LogIn className="w-5 h-5" />
              Sign In
            </Button>
          </Link>}
      </div>
    </aside>;
};
export default Sidebar;