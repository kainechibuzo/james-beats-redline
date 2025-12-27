import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Facebook, Twitter, Mail, Link2 } from "lucide-react";
import { toast } from "sonner";

interface SharePlaylistProps {
  playlistId?: string;
  playlistName?: string;
}

const SharePlaylist = ({ playlistId, playlistName = "My Playlist" }: SharePlaylistProps) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/playlist/${playlistId || "example"}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: "Facebook", icon: Facebook, color: "bg-blue-600", url: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: "Twitter", icon: Twitter, color: "bg-sky-500", url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out ${playlistName}!`)}` },
    { name: "Email", icon: Mail, color: "bg-red-500", url: `mailto:?subject=${encodeURIComponent(playlistName)}&body=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Share Playlist
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button variant="outline" size="icon" onClick={copyLink}>
            {copied ? <Link2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
        <div className="flex gap-2">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => window.open(option.url, "_blank")}
            >
              <option.icon className="w-4 h-4" />
              {option.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SharePlaylist;
