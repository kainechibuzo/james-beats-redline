import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="text-8xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/home">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
