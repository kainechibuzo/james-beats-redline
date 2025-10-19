import { User, Mail, Crown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  return (
    <div className="pb-32 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-start gap-8 mb-8">
        <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-16 h-16 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">Music Lover</h1>
            <Badge variant="default" className="gap-1">
              <Crown className="w-3 h-3" />
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4" />
            user@jamesbeats.com
          </p>
          <div className="flex gap-4">
            <Button variant="outline">Edit Profile</Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
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
              <span className="text-2xl font-bold">1,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hours Listened</span>
              <span className="text-2xl font-bold">567h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Favorite Genre</span>
              <span className="text-xl font-semibold">Hip-Hop</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Premium Benefits</CardTitle>
            <CardDescription>What you get with Premium</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Upload Your Music</p>
                <p className="text-sm text-muted-foreground">
                  Share your tracks with listeners
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">Ad-Free Experience</p>
                <p className="text-sm text-muted-foreground">
                  Enjoy uninterrupted music
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium">High Quality Audio</p>
                <p className="text-sm text-muted-foreground">
                  320kbps premium sound
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Notification Settings
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Privacy Settings
          </Button>
          <Button variant="destructive" className="w-full justify-start">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
