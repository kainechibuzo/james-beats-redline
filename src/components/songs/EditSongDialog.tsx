import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Image, Loader2 } from "lucide-react";
import { Song, useUpdateSong } from "@/hooks/useSongs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz",
  "Classical", "Country", "Latin", "Afrobeats", "Indie", "Other"
];

interface EditSongDialogProps {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSongDialog = ({ song, open, onOpenChange }: EditSongDialogProps) => {
  const { user } = useAuth();
  const updateSong = useUpdateSong();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
      setAlbum(song.album || "");
      setGenre(song.genre || "");
      setIsPublic(song.is_public);
      setCoverUrl(song.cover_url || null);
      setCoverPreview(song.cover_url || null);
      setCoverFile(null);
    }
  }, [song]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!song) return;

    setIsUploading(true);

    try {
      let newCoverUrl = coverUrl;

      if (coverFile && user) {
        const fileName = `${user.id}/${Date.now()}-cover.${coverFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile);

        if (!uploadError) {
          const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
          newCoverUrl = data.publicUrl;
        }
      }

      await updateSong.mutateAsync({
        id: song.id,
        title,
        artist,
        album: album || null,
        genre: genre === "none" ? null : genre || null,
        is_public: isPublic,
        cover_url: newCoverUrl,
      });

      toast.success("Song updated!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to update song: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover */}
          <div
            onClick={() => coverInputRef.current?.click()}
            className="w-32 h-32 mx-auto border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors hover:border-primary/50 overflow-hidden"
          >
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Image className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Cover</span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="edit-song-title">Title *</Label>
            <Input
              id="edit-song-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-song-artist">Artist *</Label>
            <Input
              id="edit-song-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-song-album">Album</Label>
            <Input
              id="edit-song-album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <Label>Genre</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label>Public</Label>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || !title || !artist}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSongDialog;