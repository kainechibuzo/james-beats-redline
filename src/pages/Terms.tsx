import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, FileText, Shield, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Terms = () => {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!accepted || !user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            terms_accepted_at: new Date().toISOString(),
            display_name:
              (user.user_metadata as any)?.display_name ??
              (user.user_metadata as any)?.username ??
              user.email?.split("@")[0] ??
              null,
            username:
              (user.user_metadata as any)?.username ??
              user.email?.split("@")[0] ??
              null,
          },
          { onConflict: "user_id" },
        );

      if (error) throw error;
      
      toast.success("Welcome to James Beats!");
      navigate("/home");
    } catch (error) {
      toast.error("Failed to accept terms. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6 text-sm text-muted-foreground">
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
                  Even if your account is terminated, the joint ownership and license rights granted to James Beats shall survive and remain in effect. You may request removal of your Content, but James Beats retains the right to continue using Content that has been sublicensed or integrated into platform features.
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

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="accept-terms"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                I have read and agree to the Terms of Use and User Agreement
              </label>
            </div>

            <Button
              variant="glow"
              className="w-full"
              disabled={!accepted || isLoading}
              onClick={handleAccept}
            >
              {isLoading ? "Processing..." : "I Accept - Continue to James Beats"}
            </Button>
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
