import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Compute consecutive-day listening streak from `recently_played`.
 * Counts back from today; breaks on first missed day.
 */
export const useListeningStreak = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["listening-streak", user?.id],
    queryFn: async () => {
      if (!user) return { current: 0, longest: 0 };
      const since = new Date();
      since.setDate(since.getDate() - 365);
      const { data, error } = await supabase
        .from("recently_played")
        .select("played_at")
        .eq("user_id", user.id)
        .gte("played_at", since.toISOString())
        .order("played_at", { ascending: false });
      if (error) throw error;

      const days = new Set<string>();
      for (const row of data || []) {
        days.add(new Date(row.played_at).toISOString().slice(0, 10));
      }

      const dayKey = (d: Date) => d.toISOString().slice(0, 10);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Current streak
      let current = 0;
      const probe = new Date(today);
      // Allow streak to start from today OR yesterday (so missing today doesn't reset until tomorrow)
      if (!days.has(dayKey(probe))) {
        probe.setDate(probe.getDate() - 1);
      }
      while (days.has(dayKey(probe))) {
        current++;
        probe.setDate(probe.getDate() - 1);
      }

      // Longest streak in last 365 days
      const sortedDays = Array.from(days).sort();
      let longest = 0;
      let run = 0;
      let prev: Date | null = null;
      for (const d of sortedDays) {
        const cur = new Date(d);
        if (prev) {
          const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
          run = diff === 1 ? run + 1 : 1;
        } else {
          run = 1;
        }
        if (run > longest) longest = run;
        prev = cur;
      }

      return { current, longest };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
};
