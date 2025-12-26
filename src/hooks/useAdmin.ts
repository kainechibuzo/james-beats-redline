import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "moderator" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface SiteAnalytics {
  id: string;
  date: string;
  total_users: number;
  new_users: number;
  total_plays: number;
  total_uploads: number;
  storage_used_mb: number;
  created_at: string;
}

// Check if current user has a specific role
export const useHasRole = (role: AppRole) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["has-role", user?.id, role],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", role)
        .maybeSingle();

      if (error) {
        console.error("Role check error:", error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });
};

// Check if current user is admin
export const useIsAdmin = () => {
  return useHasRole("admin");
};

// Get all user roles (admin only)
export const useAllUserRoles = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!isAdmin,
  });
};

// Get site analytics (admin only)
export const useSiteAnalytics = (days = 30) => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["site-analytics", days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("site_analytics")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: false });

      if (error) throw error;
      return data as SiteAnalytics[];
    },
    enabled: !!isAdmin,
  });
};

// Get total counts for admin dashboard
export const useAdminStats = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Get total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total songs
      const { count: totalSongs } = await supabase
        .from("songs")
        .select("*", { count: "exact", head: true });

      // Get total playlists
      const { count: totalPlaylists } = await supabase
        .from("playlists")
        .select("*", { count: "exact", head: true });

      // Get total albums
      const { count: totalAlbums } = await supabase
        .from("albums")
        .select("*", { count: "exact", head: true });

      // Get users registered this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: weeklyUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Get users registered this month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: monthlyUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthAgo.toISOString());

      // Get total plays
      const { data: playData } = await supabase
        .from("songs")
        .select("play_count");
      const totalPlays = playData?.reduce((acc, s) => acc + (s.play_count || 0), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalSongs: totalSongs || 0,
        totalPlaylists: totalPlaylists || 0,
        totalAlbums: totalAlbums || 0,
        weeklyUsers: weeklyUsers || 0,
        monthlyUsers: monthlyUsers || 0,
        totalPlays,
      };
    },
    enabled: !!isAdmin,
  });
};

// Assign role to user (admin only)
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    },
  });
};

// Remove role from user (admin only)
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
    },
  });
};

// Get all users with profiles (admin only)
export const useAllUsers = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!isAdmin,
  });
};

// Get featured artists (admin only can manage)
export const useFeaturedArtists = () => {
  return useQuery({
    queryKey: ["featured-artists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_artists")
        .select("*")
        .order("monthly_listeners", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};