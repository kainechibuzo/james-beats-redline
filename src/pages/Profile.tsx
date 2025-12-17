import { useState } from "react";
import { User, Mail, Crown, Settings, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
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
    switch (profile?.subscription_tier) {
      case "artist":
        return (
          <Badge className="gap-1 bg-gradient-to-r from-purple-500 to-pink-500">
            <Crown className="w-3 h-3" />
            Artist
          </Badge>
        );
      case "premium":
        return (
          <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500">
            <Crown className="w-3 h-3" />
            Premium
          </Badge>
        );
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="pb-32 max-w-4xl mx-auto animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start gap-8 mb-8">
        <div className="relative">
          <Avatar className="w-32 h-32">
            <AvatarImage src={avatarPreview || profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-4xl">
              {profile?.display_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <label className="absolute bottom-0 right-0 p-2 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Camera className="w-4 h-4 text-primary-foreground" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Display Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-2xl font-bold h-auto py-2"
                />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="@username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={updateProfile.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">
                  {profile?.display_name || user?.email?.split("@")[0] || "User"}
                </h1>
                {getTierBadge()}
              </div>
              {profile?.username && (
                <p className="text-muted-foreground mb-2">@{profile.username}</p>
              )}
              <p className="text-muted-foreground flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              {profile?.bio && (
                <p className="text-foreground mb-4">{profile.bio}</p>
              )}
              <div className="flex gap-4 mb-4 text-sm">
                <span><strong>{profile?.followers_count || 0}</strong> followers</span>
                <span><strong>{profile?.following_count || 0}</strong> following</span>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={startEditing}>
                  Edit Profile
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Listening Stats</CardTitle>
            <CardDescription>Your music activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Plays</span>
              <span className="text-2xl font-bold">{profile?.total_plays || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Likes</span>
              <span className="text-2xl font-bold">{profile?.total_likes || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-lg font-semibold">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Your current plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              {getTierBadge()}
              <span className="text-lg font-medium capitalize">
                {profile?.subscription_tier || "free"} Plan
              </span>
            </div>
            {profile?.subscription_tier === "free" && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upgrade to unlock premium features
                </p>
                <Button variant="glow" className="w-full">
                  Upgrade to Premium
                </Button>
              </div>
            )}
            {profile?.subscription_tier === "premium" && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Upload up to 50 tracks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Ad-free listening</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>High quality audio</span>
                </div>
              </div>
            )}
            {profile?.subscription_tier === "artist" && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Unlimited uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Analytics dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span>Verified artist badge</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
