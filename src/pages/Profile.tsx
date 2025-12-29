import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  User, Mail, Settings, Camera, Save, X, Music, Heart, Clock, 
  TrendingUp, Disc, Play, Headphones, Star, Sparkles, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useLikedSongs, useRecentlyPlayed } from "@/hooks/useSongs";
import { usePlaylists } from "@/hooks/usePlaylists";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { data: likedSongs } = useLikedSongs();
  const { data: recentlyPlayed } = useRecentlyPlayed();
  const { data: playlists } = usePlaylists();
  const updateProfile = useUpdateProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const startEditing = () => {
    setDisplayName(profile?.display_name || "");
    setUsername(profile?.username || "");
    setBio(profile?.bio || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileName = `${user.id}/${Date.now()}-avatar.${avatarFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      await updateProfile.mutateAsync({
        display_name: displayName || null,
        username: username || null,
        bio: bio || null,
        avatar_url: avatarUrl,
      });

      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const getTierBadge = () => {
    const tier = profile?.subscription_tier || "free";
    const badges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      free: { label: "Free", className: "bg-muted text-muted-foreground", icon: <Music className="w-3 h-3" /> },
      premium: { label: "Premium", className: "bg-gradient-to-r from-amber-500 to-orange-500 text-white", icon: <Star className="w-3 h-3" /> },
      artist: { label: "Artist", className: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", icon: <Award className="w-3 h-3" /> },
    };
    const badge = badges[tier];
    return (
      <Badge className={cn("gap-1", badge.className)}>
        {badge.icon}
        {badge.label}
      </Badge>
    );
  };

  // Calculate stats
  const totalMinutesListened = Math.round((recentlyPlayed?.length || 0) * 3.5); // Rough estimate
  const topGenres = recentlyPlayed?.slice(0, 10).map(s => s.genre).filter(Boolean);
  const uniqueGenres = [...new Set(topGenres)].slice(0, 3);

  if (isLoading) {
    return (
      <div className="pb-32 max-w-5xl mx-auto animate-fade-in p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-5xl mx-auto animate-fade-in p-4">
      {/* Hero Section with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 md:p-8 mb-8 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Avatar */}
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-300" />
            <Avatar className="relative w-28 h-28 md:w-36 md:h-36 ring-4 ring-background">
              <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-4xl md:text-5xl font-bold">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <label className="absolute bottom-1 right-1 p-2.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-105">
                <Camera className="w-4 h-4 text-primary-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Input
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold h-auto py-2 bg-background/50"
                />
                <Input
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50"
                />
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="bg-background/50"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={updateProfile.isPending} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={cancelEditing} className="gap-2">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {profile?.display_name || user?.email?.split("@")[0] || "User"}
                  </h1>
                  {getTierBadge()}
                </div>
                {profile?.username && (
                  <p className="text-muted-foreground mb-2 text-lg">@{profile.username}</p>
                )}
                <p className="text-muted-foreground flex items-center gap-2 mb-3 text-sm">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {profile?.bio && (
                  <p className="text-foreground/80 mb-4 max-w-xl">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 md:gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span><strong>{profile?.followers_count || 0}</strong> followers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Heart className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span><strong>{profile?.following_count || 0}</strong> following</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={startEditing} className="gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-500">{profile?.total_plays || 0}</p>
              <p className="text-xs text-muted-foreground">Total Streams</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border-pink-500/20 hover:border-pink-500/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-pink-500">{likedSongs?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Liked Songs</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Disc className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-500">{playlists?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Playlists</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-500">{totalMinutesListened}</p>
              <p className="text-xs text-muted-foreground">Minutes Listened</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recently Played */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" />
                Recently Played
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentlyPlayed && recentlyPlayed.length > 0 ? (
                <div className="space-y-2">
                  {recentlyPlayed.slice(0, 5).map((song, index) => (
                    <div 
                      key={song.id + index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <img 
                        src={song.cover_url || "/placeholder.svg"} 
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">No songs played yet</p>
              )}
              {recentlyPlayed && recentlyPlayed.length > 5 && (
                <Link to="/recently-played">
                  <Button variant="ghost" className="w-full mt-3 text-sm">
                    View All
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Listening Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Taste
              </CardTitle>
              <CardDescription>Based on your listening history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Genres */}
              <div>
                <p className="text-sm font-medium mb-2">Top Genres</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueGenres.length > 0 ? uniqueGenres.map((genre, i) => (
                    <span key={`genre-${i}`}>
                      <Badge variant="secondary" className="px-3 py-1">
                        {genre}
                      </Badge>
                    </span>
                  )) : (
                    <p className="text-xs text-muted-foreground">Listen to more music to see your top genres</p>
                  )}
                </div>
              </div>

              {/* Listening Streak */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Listening Streak</p>
                  <Badge variant="outline" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    {recentlyPlayed?.length ? Math.min(recentlyPlayed.length, 7) : 0} days
                  </Badge>
                </div>
                <Progress value={Math.min((recentlyPlayed?.length || 0) * 10, 100)} className="h-2" />
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="text-sm font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link to="/liked-songs">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span className="text-xs">Liked Songs</span>
                </Button>
              </Link>
              <Link to="/liked-albums">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Disc className="w-5 h-5 text-blue-500" />
                  <span className="text-xs">Liked Albums</span>
                </Button>
              </Link>
              <Link to="/library">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Music className="w-5 h-5 text-green-500" />
                  <span className="text-xs">Your Library</span>
                </Button>
              </Link>
              <Link to="/yearly-recap">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-xs">Yearly Recap</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
