import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Image, Loader2 } from "lucide-react";
import { useUpdateAlbum, Album } from "@/hooks/useAlbums";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz",
  "Classical", "Country", "Latin", "Afrobeats", "Indie", "Other"
];

interface EditAlbumDialogProps {
  album: Album | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditAlbumDialog = ({ album, open, onOpenChange }: EditAlbumDialogProps) => {
  const { user } = useAuth();
  const updateAlbum = useUpdateAlbum();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (album) {
      setTitle(album.title);
      setArtist(album.artist);
      setDescription(album.description || "");
      setGenre(album.genre || "");
      setReleaseYear(album.release_year?.toString() || "");
      setIsPublic(album.is_public);
      setCoverUrl(album.cover_url || null);
      setCoverPreview(album.cover_url || null);
      setCoverFile(null);
    }
  }, [album]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    setIsUploading(true);

    try {
      let newCoverUrl = coverUrl;

      if (coverFile && user) {
        const fileName = `${user.id}/${Date.now()}-album-cover.${coverFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile);

        if (!uploadError) {
          const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
          newCoverUrl = data.publicUrl;
        }
      }

      await updateAlbum.mutateAsync({
        id: album.id,
        title,
        artist,
        description: description || undefined,
        genre: genre || undefined,
        release_year: releaseYear ? parseInt(releaseYear) : undefined,
        is_public: isPublic,
        cover_url: newCoverUrl || undefined,
      });

      onOpenChange(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Album</DialogTitle>
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
            <Label htmlFor="edit-title">Title *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-artist">Artist *</Label>
            <Input
              id="edit-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
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

export default EditAlbumDialog;