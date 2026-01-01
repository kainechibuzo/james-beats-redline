import { ReactNode } from "react";
import { useCanAccessPremiumFeature } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Lock, ExternalLink } from "lucide-react";

interface PremiumFeatureGateProps {
  children: ReactNode;
  featureName?: string;
  showLockOverlay?: boolean;
}

const PremiumFeatureGate = ({ 
  children, 
  featureName = "this feature",
  showLockOverlay = true 
}: PremiumFeatureGateProps) => {
  const { canAccess, requiresPayment, paystackUrl } = useCanAccessPremiumFeature();

  if (canAccess) {
    return <>{children}</>;
  }

  if (showLockOverlay) {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none blur-sm">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
          <Card className="max-w-sm mx-4 border-primary/30 bg-card/90">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade to premium to unlock {featureName}
              </p>
              {requiresPayment && paystackUrl && (
                <Button
                  variant="glow"
                  className="w-full gap-2"
                  onClick={() => window.open(paystackUrl, "_blank")}
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export const PremiumBadge = () => {
  const { canAccess, requiresPayment, paystackUrl } = useCanAccessPremiumFeature();

  if (canAccess || !requiresPayment) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 border-primary/50 text-primary hover:bg-primary/10"
      onClick={() => window.open(paystackUrl, "_blank")}
    >
      <Lock className="w-3 h-3" />
      Premium
    </Button>
  );
};

export const UpgradeButton = ({ className = "" }: { className?: string }) => {
  const { canAccess, requiresPayment, paystackUrl } = useCanAccessPremiumFeature();

  if (canAccess || !requiresPayment) return null;

  return (
    <Button
      variant="glow"
      className={`gap-2 ${className}`}
      onClick={() => window.open(paystackUrl, "_blank")}
    >
      <Crown className="w-4 h-4" />
      Upgrade to Premium
      <ExternalLink className="w-3 h-3" />
    </Button>
  );
};

export default PremiumFeatureGate;
