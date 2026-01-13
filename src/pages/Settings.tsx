import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { Moon, Sun, Shield, Bell, Download, Lock } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [autoDownload, setAutoDownload] = React.useState(false);
  const [trackProtection, setTrackProtection] = React.useState(true);

  const handleTrackProtectionChange = (enabled: boolean) => {
    setTrackProtection(enabled);
    toast.success(enabled ? "Track protection enabled" : "Track protection disabled");
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your app preferences</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="theme-toggle">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Track Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Track Protection
          </CardTitle>
          <CardDescription>Protect your music from unauthorized downloads</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="track-protection">Enable Protection</Label>
              <p className="text-sm text-muted-foreground">
                Prevents right-click downloads and disables audio URL exposure
              </p>
            </div>
            <Switch
              id="track-protection"
              checked={trackProtection}
              onCheckedChange={handleTrackProtectionChange}
            />
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">How track protection works</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                  <li>• Right-click context menu disabled on audio</li>
                  <li>• Audio file URLs are signed and expire</li>
                  <li>• Duplicate detection prevents re-uploads of the same track</li>
                  <li>• Watermarking can be added on streamed audio</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified about new releases and updates</p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads
          </CardTitle>
          <CardDescription>Manage offline playback settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-download">Auto-download Liked Songs</Label>
              <p className="text-sm text-muted-foreground">Automatically download songs when you like them</p>
            </div>
            <Switch
              id="auto-download"
              checked={autoDownload}
              onCheckedChange={setAutoDownload}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
