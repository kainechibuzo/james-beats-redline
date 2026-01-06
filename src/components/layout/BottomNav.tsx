import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Library, Upload, User, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state
  useEffect(() => {
    const dismissed = localStorage.getItem("bottomNavDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    localStorage.setItem("bottomNavDismissed", "true");
  };

  const handleShow = () => {
    setIsDismissed(false);
    setIsVisible(true);
    localStorage.removeItem("bottomNavDismissed");
  };

  const navItems = [
    { to: "/home", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/upload", icon: Upload, label: "Upload", requiresAuth: true },
    { to: user ? "/profile" : "/auth", icon: User, label: user ? "Profile" : "Login" },
  ];

  const filteredItems = navItems.filter(item => !item.requiresAuth || user);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-24 right-4 z-40 rounded-full bg-card border-border shadow-lg md:hidden"
        onClick={handleShow}
      >
        <Home className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <nav className="fixed bottom-20 left-2 right-2 z-40 md:hidden">
      <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl shadow-lg px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-around flex-1">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.to || 
                (item.to === "/home" && location.pathname === "/");
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all",
                    isActive 
                      ? "text-foreground bg-secondary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-foreground")} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
          <button
            onClick={handleDismiss}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
