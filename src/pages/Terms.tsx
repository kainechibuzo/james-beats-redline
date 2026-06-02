import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Music, Shield, Sparkles, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sections = [
  {
    icon: Shield,
    title: "Content & Ownership",
    body: "Songs you upload become jointly owned by you and James Beats. You grant us a worldwide, royalty-free, perpetual license to host, stream, distribute and promote that content.",
  },
  {
    icon: Lock,
    title: "Your Responsibilities",
    body: "You confirm you have rights to anything you upload, it doesn't infringe on others, and you won't try to bypass platform protections or scrape others' content.",
  },
  {
    icon: Sparkles,
    title: "Platform Rights",
    body: "James Beats may feature, sublicense, remix or remove content at any time. Even after account closure, the license you granted continues for archival, legal and promotional use.",
  },
];

const Terms = () => {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("terms_accepted_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.terms_accepted_at) navigate("/home", { replace: true });
    })();
  }, [user, navigate]);

  const handleAccept = async () => {
    if (!user) {
      setError("Please sign in again to continue.");
      return;
    }
    if (!accepted) {
      setError("Please tick the box to confirm you agree.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      const fallbackName =
        meta.display_name || meta.username || user.email?.split("@")[0] || "User";

      // Upsert ensures we never fail if the profile row already exists or is missing.
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            display_name: fallbackName,
            username: meta.username || user.email?.split("@")[0] || null,
            terms_accepted_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (upsertError) throw upsertError;

      toast.success("Welcome to James Beats");
      navigate("/home", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to accept terms";
      console.error("Terms accept failed:", err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:py-16">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
            <Music className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Before we drop the needle
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md">
            A quick agreement so we can keep the music, uploads, and discovery flowing.
          </p>
        </div>

        {/* Sections */}
        <div className="grid gap-4 sm:gap-5">
          {sections.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-border bg-card/60 backdrop-blur p-5 sm:p-6 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-base sm:text-lg">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Accept block */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5 sm:p-6">
          <label
            htmlFor="accept-terms"
            className="flex items-start gap-3 cursor-pointer select-none"
          >
            <Checkbox
              id="accept-terms"
              checked={accepted}
              onCheckedChange={(c) => {
                setAccepted(c === true);
                setError(null);
              }}
              disabled={isLoading}
              className="mt-1"
            />
            <span className="text-sm leading-relaxed">
              I've read and agree to the{" "}
              <span className="text-foreground font-medium">Terms of Use</span> and joint
              content license. I understand this is binding and survives account closure.
            </span>
          </label>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            variant="glow"
            size="lg"
            className="mt-5 w-full"
            disabled={!accepted || isLoading}
            onClick={handleAccept}
          >
            {isLoading ? (
              "Saving…"
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Enter
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Last updated June 2026
        </p>
      </div>
    </div>
  );
};

export default Terms;
