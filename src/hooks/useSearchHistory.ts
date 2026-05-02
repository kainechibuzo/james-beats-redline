import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchHistoryEntry {
  id: string;
  query: string;
  created_at: string;
}

export const useSearchHistory = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["search-history", user?.id],
    queryFn: async () => {
      if (!user) return [] as SearchHistoryEntry[];
      const { data, error } = await supabase
        .from("search_history")
        .select("id, query, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      
      // dedupe by query, keep most recent
      const seen = new Set<string>();
      const out: SearchHistoryEntry[] = [];
      for (const row of data || []) {
        const k = row.query.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(row);
      }
      return out.slice(0, 10);
    },
    enabled: !!user,
  });
};

export const useAddSearchHistory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (query: string) => {
      const trimmed = query.trim();
      if (!trimmed || !user) return;
      await supabase.from("search_history").insert({ user_id: user.id, query: trimmed });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });
};

export const useRemoveSearchHistory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await supabase.from("search_history").delete().eq("id", id).eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });
};

export const useClearSearchHistory = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("search_history").delete().eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["search-history"] }),
  });
};
