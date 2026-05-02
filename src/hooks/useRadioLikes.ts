import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLikedRadioStations = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["liked-radio-stations", user?.id],
    queryFn: async () => {
      if (!user) return new Set<string>();
      const { data, error } = await supabase
        .from("liked_radio_stations")
        .select("station_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return new Set((data || []).map((r) => r.station_id));
    },
    enabled: !!user,
  });
};

export const useToggleRadioLike = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ stationId, isLiked }: { stationId: string; isLiked: boolean }) => {
      if (!user) throw new Error("Sign in required");
      if (isLiked) {
        await supabase
          .from("liked_radio_stations")
          .delete()
          .eq("user_id", user.id)
          .eq("station_id", stationId);
      } else {
        await supabase
          .from("liked_radio_stations")
          .insert({ user_id: user.id, station_id: stationId });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked-radio-stations"] }),
  });
};
