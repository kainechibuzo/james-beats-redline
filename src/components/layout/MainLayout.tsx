import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import Player from "./Player";
import MiniPlayer from "@/components/features/MiniPlayer";
import BottomNav from "./BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTrackProtection } from "@/hooks/useTrackProtection";

const MainLayout = () => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Enable track protection to prevent unauthorized downloads
  useTrackProtection(true);

  // Prefetch common data on mount for faster navigation
  useEffect(() => {
    // Prefetch public songs
    queryClient.prefetchQuery({
      queryKey: ["songs"],
      queryFn: async () => {
        const { data } = await supabase
          .from("songs")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(100);
        return data || [];
      },
      staleTime: 1000 * 60 * 2,
    });

    // Prefetch albums
    queryClient.prefetchQuery({
      queryKey: ["albums"],
      queryFn: async () => {
        const { data } = await supabase
          .from("albums")
          .select("*")
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(50);
        return data || [];
      },
      staleTime: 1000 * 60 * 2,
    });

    // Prefetch user data if logged in
    if (user) {
      queryClient.prefetchQuery({
        queryKey: ["playlists", user.id],
        queryFn: async () => {
          const { data } = await supabase
            .from("playlists")
            .select("*")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false });
          return data || [];
        },
        staleTime: 1000 * 60,
      });
    }
  }, [queryClient, user]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className={isMobile ? "p-4 pt-16 pb-40" : "p-8"}>
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <MiniPlayer />
      <Player />
    </div>
  );
};

export default MainLayout;
