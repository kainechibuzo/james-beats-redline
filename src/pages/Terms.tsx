import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, FileText, Shield, Users, AlertCircle, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Terms = () => {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user already accepted terms
  useEffect(() => {
    if (!user) return;

    const checkTermsStatus = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("terms_accepted_at")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data?.terms_accepted_at) {
          // User already accepted, skip to home
          navigate("/home", { replace: true });
        }
      } catch (err) {
        console.error("Error checking terms status:", err);
      }
    };

    checkTermsStatus();
  }, [user, navigate]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    setHasScrolledToBottom(isNearBottom || element.scrollHeight - element.scrollTop === element.clientHeight);
  };

  const handleAccept = async () => {
    if (!accepted || !user) {
      setError("Please accept the terms to continue");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, ensure the profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            display_name:
              (user.user_metadata as any)?.display_name ??
              (user.user_metadata as any)?.username ??
              user.email?.split("@")[0] ??
              "User",
            username:
              (user.user_metadata as any)?.username ??
              user.email?.split("@")[0] ??
              null,
          });

        if (createError) throw createError;
      }

      // Now update with terms acceptance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          terms_accepted_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      toast.success("Welcome to James Beats!");
      
      // Force a small delay to ensure database is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      navigate("/home", { replace: true });
    } catch (err) {
      console.error("Error accepting terms:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to accept terms";
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip and try again later
    toast.info("You can accept terms anytime from settings");
    navigate("/home", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
            <Music className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            James Beats
          </h1>
          <p className="text-muted-foreground mt-2">
            Please review and accept our terms before continuing
          </p>
        </div>

        {/* Terms Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-glow">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Terms of Use & User Agreement</h2>
          </div>

          <ScrollArea className="h-[400px] pr-4" onScroll={handleScroll}>
            <div 
              ref={setScrollRef}
              className="space-y-6 text-sm text-muted-foreground"
            >
              <section>
                <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  1. Content Ownership & Rights
                </h3>
                <p className="mb-2">
                  By uploading any audio content ("Content") to James Beats, you acknowledge and agree to the following:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="text-foreground">Joint Ownership:</strong> Any song, audio track, or musical content you upload becomes the joint property of both you (the "Uploader") and James Beats (the "Platform"). This means both parties retain equal rights to use, distribute, license, and monetize the Content.
                  </li>
                  <li>
                    <strong className="text-foreground">License Grant:</strong> You grant James Beats a worldwide, non-exclusive, royalty-free, perpetual, and irrevocable license to use, reproduce, modify, adapt, publish, translate, distribute, perform, and display such Content.
                  </li>
                  <li>
                    <strong className="text-foreground">Revenue Sharing:</strong> Any revenue generated from your Content may be shared between you and James Beats according to the platform's current revenue sharing policies.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  2. User Responsibilities
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You warrant that you have the legal right to upload and share the Content, and that it does not infringe on any third-party intellectual property rights.
                  </li>
                  <li>
                    You are solely responsible for any Content you upload and any consequences thereof.
                  </li>
                  <li>
                    You agree not to upload any Content that is illegal, harmful, threatening, abusive, defamatory, or otherwise objectionable.
                  </li>
                  <li>
                    You will not attempt to circumvent any security measures or download/steal other users' Content.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2">3. Platform Rights</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    James Beats reserves the right to remove any Content at its sole discretion, without prior notice.
                  </li>
                  <li>
                    The Platform may use uploaded Content for promotional purposes, including but not limited to advertisements, social media, and marketing materials.
                  </li>
                  <li>
                    James Beats may sublicense the Content to third parties for streaming, distribution, or other commercial purposes.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2">4. Content Protection</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    James Beats implements technical measures to protect Content from unauthorized downloading and distribution.
                  </li>
                  <li>
                    Users who attempt to circumvent these protections will have their accounts terminated.
                  </li>
                  <li>
                    Any unauthorized use of Content may result in legal action.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2">5. Termination</h3>
                <p>
                  Even if your account is terminated, the joint ownership and license rights granted to James Beats shall survive and remain in effect. You may request removal of your Content, but James Beats reserves the right to maintain copies for archival and legal purposes.
                </p>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2">6. Disclaimer</h3>
                <p>
                  THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. JAMES BEATS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
                </p>
              </section>

              <section>
                <h3 className="text-foreground font-semibold mb-2">7. Amendments</h3>
                <p>
                  James Beats reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-foreground font-medium">
                  By clicking "I Accept," you confirm that you have read, understood, and agree to be bound by these Terms of Use and User Agreement.
                </p>
              </section>
            </div>
          </ScrollArea>

          {/* Scroll indicator */}
          {!hasScrolledToBottom && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ChevronUp className="w-4 h-4 animate-bounce" />
              Scroll to bottom to continue
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => {
                  setAccepted(checked === true);
                  setError(null);
                }}
                disabled={isLoading}
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I have read and agree to the Terms of Use and User Agreement
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="glow"
                className="flex-1"
                disabled={!accepted || isLoading}
                onClick={handleAccept}
              >
                {isLoading ? "Processing..." : "I Accept - Continue"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={handleSkip}
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Last updated: January 2026
        </p>
      </div>
    </div>
  );
};

export default Terms;
