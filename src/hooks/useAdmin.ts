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
        .order("date", { ascending: true });

      if (error) throw error;
      return data as SiteAnalytics[];
    },
    enabled: !!isAdmin,
  });
};

// Get user growth trends for charts (admin only)
export const useUserGrowthTrends = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["user-growth-trends"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date for daily counts
      const dailyCounts: Record<string, number> = {};
      const weeklyCounts: Record<string, number> = {};
      const monthlyCounts: Record<string, number> = {};

      profiles?.forEach((profile) => {
        const date = new Date(profile.created_at);
        const dayKey = date.toISOString().split("T")[0];
        const weekKey = getWeekKey(date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        dailyCounts[dayKey] = (dailyCounts[dayKey] || 0) + 1;
        weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
        monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
      });

      // Convert to arrays for charts
      const daily = Object.entries(dailyCounts)
        .slice(-30)
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          users: count,
          cumulative: 0,
        }));

      const weekly = Object.entries(weeklyCounts)
        .slice(-12)
        .map(([week, count]) => ({
          week,
          users: count,
        }));

      const monthly = Object.entries(monthlyCounts)
        .slice(-12)
        .map(([month, count]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          users: count,
        }));

      // Calculate cumulative for daily
      let cumulative = 0;
      daily.forEach((d) => {
        cumulative += d.users;
        d.cumulative = cumulative;
      });

      return { daily, weekly, monthly };
    },
    enabled: !!isAdmin,
  });
};

// Get storage trends (admin only)
export const useStorageTrends = () => {
  const { data: isAdmin } = useIsAdmin();

  return useQuery({
    queryKey: ["storage-trends"],
    queryFn: async () => {
      const { data: songs, error: songsError } = await supabase
        .from("songs")
        .select("created_at")
        .order("created_at", { ascending: true });

      if (songsError) throw songsError;

      // Group songs by month
      const monthlySongs: Record<string, number> = {};
      songs?.forEach((song) => {
        const date = new Date(song.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlySongs[monthKey] = (monthlySongs[monthKey] || 0) + 1;
      });

      // Calculate cumulative storage (estimate ~5MB per song)
      const storageData = Object.entries(monthlySongs)
        .slice(-12)
        .map(([month, count]) => ({
          month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          songs: count,
          storageMB: count * 5,
        }));

      let cumulativeStorage = 0;
      storageData.forEach((d) => {
        cumulativeStorage += d.storageMB;
        d.storageMB = cumulativeStorage;
      });

      return storageData;
    },
    enabled: !!isAdmin,
  });
};

// Helper function to get week key
function getWeekKey(date: Date): string {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

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