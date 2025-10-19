import { Upload as UploadIcon, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Upload = () => {
  return (
    <div className="pb-32 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">Upload Your Music</h1>
      <p className="text-muted-foreground mb-8">
        Share your tracks with the world. Premium feature for paid users.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Track Details</CardTitle>
          <CardDescription>
            Fill in the information about your track
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-muted-foreground">
              MP3, WAV, or FLAC (max. 100MB)
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Track Title</Label>
              <Input id="title" placeholder="Enter track title" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist Name</Label>
              <Input id="artist" placeholder="Enter artist name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input id="album" placeholder="Enter album name (optional)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input id="genre" placeholder="e.g., Pop, Rock, Hip-Hop" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your track..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover">Album Cover</Label>
              <Input id="cover" type="file" accept="image/*" />
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="glow" className="flex-1 gap-2">
              <Music className="w-4 h-4" />
              Upload Track
            </Button>
            <Button variant="outline">Save as Draft</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upload;
