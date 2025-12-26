import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin, useAdminStats, useAllUsers, useFeaturedArtists } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Users, Music, Disc, Database, TrendingUp, 
  Calendar, BarChart3, Clock, HardDrive, AlertTriangle
} from "lucide-react";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: allUsers, isLoading: usersLoading } = useAllUsers();
  const { data: featuredArtists } = useFeaturedArtists();

  // If not logged in
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Shield className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">Please sign in to access the admin panel</p>
        <Button variant="glow" onClick={() => navigate("/auth")}>
          Sign In
        </Button>
      </div>
    );
  }

  // Loading admin status
  if (adminLoading) {
    return (
      <div className="pb-32 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page.
          <br />
          Contact an administrator if you believe this is an error.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your music platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Music className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalSongs || 0}</p>
                <p className="text-xs text-muted-foreground">Total Songs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Disc className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalAlbums || 0}</p>
                <p className="text-xs text-muted-foreground">Total Albums</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold">{stats?.totalPlays?.toLocaleString() || 0}</p>
                <p className="text-xs text-muted-foreground">Total Plays</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Users</p>
                <p className="text-2xl font-bold">{stats?.weeklyUsers || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-green-400 mt-2">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Users</p>
                <p className="text-2xl font-bold">{stats?.monthlyUsers || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-green-400 mt-2">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Playlists Created</p>
                <p className="text-2xl font-bold">{stats?.totalPlaylists || 0}</p>
              </div>
              <Database className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="artists" className="gap-2">
            <Music className="w-4 h-4" />
            Featured Artists
          </TabsTrigger>
          <TabsTrigger value="storage" className="gap-2">
            <HardDrive className="w-4 h-4" />
            Storage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users ({allUsers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))
                  ) : (
                    allUsers?.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {profile.display_name || profile.username || "Anonymous"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined {new Date(profile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{profile.subscription_tier}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {profile.total_plays} plays
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artists">
          <Card>
            <CardHeader>
              <CardTitle>Featured Artists</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredArtists?.length ? (
                <div className="space-y-2">
                  {featuredArtists.map((artist) => (
                    <div
                      key={artist.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden">
                          {artist.image_url ? (
                            <img src={artist.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{artist.artist_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {artist.monthly_listeners?.toLocaleString()} monthly listeners
                          </p>
                        </div>
                      </div>
                      {artist.is_verified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No featured artists yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">Database Storage</p>
                      <p className="text-sm text-muted-foreground">
                        Songs, playlists, user data
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{stats?.totalSongs || 0}</p>
                    <p className="text-xs text-muted-foreground">records</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Songs</p>
                    <p className="text-2xl font-bold">{stats?.totalSongs || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Albums</p>
                    <p className="text-2xl font-bold">{stats?.totalAlbums || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Playlists</p>
                    <p className="text-2xl font-bold">{stats?.totalPlaylists || 0}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Users</p>
                    <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;