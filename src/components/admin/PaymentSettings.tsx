import { useState, useEffect } from "react";
import { usePaystackUrl, useUpdatePaystackUrl } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ExternalLink, Check, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

const PaymentSettings = () => {
  const { data: currentUrl, isLoading } = usePaystackUrl();
  const updateUrl = useUpdatePaystackUrl();
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (currentUrl !== undefined) {
      setUrl(currentUrl);
    }
  }, [currentUrl]);

  const handleSave = async () => {
    try {
      await updateUrl.mutateAsync(url.trim());
      toast.success("Payment settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update payment settings");
    }
  };

  const isConfigured = url && url.trim() !== "";

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure Paystack payment integration</CardDescription>
            </div>
          </div>
          <Badge variant={isConfigured ? "default" : "secondary"}>
            {isConfigured ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Configured
              </>
            ) : (
              <>
                <AlertCircle className="w-3 h-3 mr-1" />
                Free Access
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>If no URL is set, all users have free access to all features</li>
              <li>If a URL is set, free users will see upgrade prompts for premium features</li>
              <li>Admins always have full access regardless of settings</li>
              <li>Use your Paystack payment page URL from your dashboard</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paystack-url">Paystack Payment Page URL</Label>
          <div className="flex gap-2">
            <Input
              id="paystack-url"
              type="url"
              placeholder="https://paystack.com/pay/your-payment-page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            {isConfigured && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(url, "_blank")}
                title="Test payment link"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Create a payment page in your Paystack dashboard and paste the URL here
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="glow"
            onClick={handleSave}
            disabled={updateUrl.isPending}
          >
            {updateUrl.isPending ? "Saving..." : "Save Settings"}
          </Button>
          {isConfigured && (
            <Button
              variant="outline"
              onClick={() => {
                setUrl("");
                handleSave();
              }}
              disabled={updateUrl.isPending}
            >
              Clear URL (Enable Free Access)
            </Button>
          )}
        </div>

        {isConfigured && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Premium Features (locked for free users):</h4>
            <div className="flex flex-wrap gap-2">
              {["AI DJ", "Lyrics Generation", "Sleep Timer", "Audio Equalizer", "Crossfade", "Advanced Stats"].map((feature) => (
                <span key={feature} className="px-2 py-1 text-xs border rounded-full text-muted-foreground">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSettings;
