import * as React from "react";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TermsGuardProps {
  children: React.ReactNode;
}

const TermsGuard = ({ children }: TermsGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("terms_accepted_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking terms:", error);
          setTermsAccepted(false);
        } else {
          setTermsAccepted(!!data?.terms_accepted_at);
        }
      } catch (error) {
        console.error("Error checking terms:", error);
        setTermsAccepted(false);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkTermsAcceptance();
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If user is logged in but hasn't accepted terms, redirect to terms page
  if (user && termsAccepted === false && location.pathname !== "/terms") {
    return <Navigate to="/terms" replace />;
  }

  return <>{children}</>;
};

export default TermsGuard;
