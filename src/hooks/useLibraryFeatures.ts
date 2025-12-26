import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// 11. Song Ratings (1-5 stars)
export const useSongRatings = () => {
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const setRating = useCallback((songId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [songId]: Math.max(1, Math.min(5, rating)) }));
  }, []);

  const getRating = useCallback((songId: string) => ratings[songId] || 0, [ratings]);

  return { ratings, setRating, getRating };
};

// 12. Song Notes
export const useSongNotes = () => {
  const [notes, setNotes] = useState<Record<string, string>>({});

  const setNote = useCallback((songId: string, note: string) => {
    setNotes(prev => ({ ...prev, [songId]: note }));
  }, []);

  const getNote = useCallback((songId: string) => notes[songId] || "", [notes]);

  return { notes, setNote, getNote };
};

// 13. Custom Tags
export const useSongTags = () => {
  const [tags, setTags] = useState<Record<string, string[]>>({});

  const addTag = useCallback((songId: string, tag: string) => {
    setTags(prev => ({
      ...prev,
      [songId]: [...(prev[songId] || []), tag].filter((v, i, a) => a.indexOf(v) === i),
    }));
  }, []);

  const removeTag = useCallback((songId: string, tag: string) => {
    setTags(prev => ({
      ...prev,
      [songId]: (prev[songId] || []).filter(t => t !== tag),
    }));
  }, []);

  const getTags = useCallback((songId: string) => tags[songId] || [], [tags]);

  const getAllTags = useMemo(() => {
    const allTags = new Set<string>();
    Object.values(tags).forEach((songTags: string[]) => songTags.forEach(tag => allTags.add(tag)));
    return Array.from(allTags);
  }, [tags]);

  return { tags, addTag, removeTag, getTags, getAllTags };
};

// 14. Library Sort Options
export type SortOption = "title" | "artist" | "date_added" | "play_count" | "duration" | "rating";
export type SortDirection = "asc" | "desc";

export const useLibrarySort = () => {
  const [sortBy, setSortBy] = useState<SortOption>("date_added");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const toggleDirection = useCallback(() => {
    setDirection(prev => prev === "asc" ? "desc" : "asc");
  }, []);

  return { sortBy, direction, setSortBy, setDirection, toggleDirection };
};

// 15. Library Filters
export interface LibraryFilters {
  genre: string | null;
  artist: string | null;
  mood: string | null;
  minRating: number;
  hasLyrics: boolean | null;
  addedAfter: Date | null;
}

export const useLibraryFilters = () => {
  const [filters, setFilters] = useState<LibraryFilters>({
    genre: null,
    artist: null,
    mood: null,
    minRating: 0,
    hasLyrics: null,
    addedAfter: null,
  });

  const setFilter = useCallback(<K extends keyof LibraryFilters>(key: K, value: LibraryFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      genre: null,
      artist: null,
      mood: null,
      minRating: 0,
      hasLyrics: null,
      addedAfter: null,
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.genre !== null || filters.artist !== null || 
           filters.mood !== null || filters.minRating > 0 || 
           filters.hasLyrics !== null || filters.addedAfter !== null;
  }, [filters]);

  return { filters, setFilter, clearFilters, hasActiveFilters };
};

// 16. Playlist Folders
export interface PlaylistFolder {
  id: string;
  name: string;
  playlistIds: string[];
  color: string;
}

export const usePlaylistFolders = () => {
  const [folders, setFolders] = useState<PlaylistFolder[]>([]);

  const createFolder = useCallback((name: string, color = "hsl(348 83% 47%)") => {
    const folder: PlaylistFolder = {
      id: crypto.randomUUID(),
      name,
      playlistIds: [],
      color,
    };
    setFolders(prev => [...prev, folder]);
    return folder;
  }, []);

  const addToFolder = useCallback((folderId: string, playlistId: string) => {
    setFolders(prev => prev.map(f => 
      f.id === folderId 
        ? { ...f, playlistIds: [...f.playlistIds, playlistId] }
        : f
    ));
  }, []);

  const removeFromFolder = useCallback((folderId: string, playlistId: string) => {
    setFolders(prev => prev.map(f => 
      f.id === folderId 
        ? { ...f, playlistIds: f.playlistIds.filter(id => id !== playlistId) }
        : f
    ));
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
  }, []);

  return { folders, createFolder, addToFolder, removeFromFolder, deleteFolder };
};

// 17. Recently Added
export const useRecentlyAdded = (limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recently-added", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// 18. Most Played
export const useMostPlayed = (limit = 20) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["most-played", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("play_count", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// 19. Listening History (detailed)
export interface ListeningHistoryItem {
  id: string;
  songId: string;
  playedAt: Date;
  duration: number; // How long they listened
  completed: boolean;
}

export const useListeningHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["listening-history", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("recently_played")
        .select("*, songs (*)")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

// 20. Smart Playlists (auto-generated based on rules)
export interface SmartPlaylistRule {
  field: "genre" | "artist" | "play_count" | "rating" | "added_date";
  operator: "equals" | "contains" | "greater_than" | "less_than" | "in_last_days";
  value: string | number;
}

export interface SmartPlaylist {
  id: string;
  name: string;
  rules: SmartPlaylistRule[];
  limit: number;
  sortBy: SortOption;
}

export const useSmartPlaylists = () => {
  const [smartPlaylists, setSmartPlaylists] = useState<SmartPlaylist[]>([
    {
      id: "recently-added",
      name: "Recently Added",
      rules: [{ field: "added_date", operator: "in_last_days", value: 7 }],
      limit: 50,
      sortBy: "date_added",
    },
    {
      id: "heavy-rotation",
      name: "Heavy Rotation",
      rules: [{ field: "play_count", operator: "greater_than", value: 5 }],
      limit: 30,
      sortBy: "play_count",
    },
  ]);

  const createSmartPlaylist = useCallback((playlist: Omit<SmartPlaylist, "id">) => {
    const newPlaylist: SmartPlaylist = { ...playlist, id: crypto.randomUUID() };
    setSmartPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

  return { smartPlaylists, createSmartPlaylist };
};
