import { useState, useRef } from "react";
import { Upload as UploadIcon, Music, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useUploadSong } from "@/hooks/useUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", 
  "Classical", "Country", "Latin", "Afrobeats", "Indie", "Other"
];

const Upload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const uploadMutation = useUploadSong();
  
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        return;
      }
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !title || !artist) return;

    await uploadMutation.mutateAsync({
      title,
      artist,
      album: album || undefined,
      genre: genre || undefined,
      audioFile,
      coverFile: coverFile || undefined,
      isPublic,
    });

    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    
    navigate("/library");
  };


  return (
    <div className="pb-32 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">Upload Your Music</h1>
      <p className="text-muted-foreground mb-8">
        Share your tracks with the world.
      </p>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Track Details</CardTitle>
            <CardDescription>
              Fill in the information about your track
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Audio Upload */}
            <div
              onClick={() => audioInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                audioFile 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioSelect}
                className="hidden"
              />
              {audioFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Music className="w-8 h-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, or FLAC (max. 100MB)
                  </p>
                </>
              )}
            </div>

            {/* Cover Art */}
            <div className="grid md:grid-cols-3 gap-4">
              <div
                onClick={() => coverInputRef.current?.click()}
                className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  coverPreview 
                    ? "border-primary" 
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Add Cover</p>
                  </>
                )}
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Track Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter track title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist">Artist Name *</Label>
                  <Input
                    id="artist"
                    placeholder="Enter artist name"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="album">Album</Label>
                <Input
                  id="album"
                  placeholder="Enter album name (optional)"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g.toLowerCase()}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="public" className="text-base font-medium">
                  Make track public
                </Label>
                <p className="text-sm text-muted-foreground">
                  Public tracks can be discovered by everyone
                </p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>Processing</span>
                </div>
                <Progress value={50} className="h-2" />
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="glow"
                className="flex-1 gap-2"
                disabled={!audioFile || !title || !artist || uploadMutation.isPending}
              >
                <Music className="w-4 h-4" />
                {uploadMutation.isPending ? "Uploading..." : "Upload Track"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default Upload;
