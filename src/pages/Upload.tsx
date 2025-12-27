import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Upload as UploadIcon, Music, X, Image, AlertCircle, Lock, FolderOpen, FileAudio, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUploadSong } from "@/hooks/useUpload";
import { useCreateAlbum, useMyAlbums } from "@/hooks/useAlbums";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const GENRES = [
  "Pop", "Rock", "Hip-Hop", "R&B", "Electronic", "Jazz", 
  "Classical", "Country", "Latin", "Afrobeats", "Indie", "Other"
];

interface FolderFile {
  file: File;
  name: string;
  relativePath: string;
}

const Upload = () => {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: myAlbums } = useMyAlbums();
  const navigate = useNavigate();
  const uploadMutation = useUploadSong();
  const createAlbum = useCreateAlbum();
  
  // Song upload state
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [albumId, setAlbumId] = useState("");
  const [genre, setGenre] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [artistError, setArtistError] = useState<string | null>(null);
  const [isCheckingArtist, setIsCheckingArtist] = useState(false);

  // Album/Folder upload state (merged)
  const [folderFiles, setFolderFiles] = useState<FolderFile[]>([]);
  const [folderAlbumTitle, setFolderAlbumTitle] = useState("");
  const [folderAlbumGenre, setFolderAlbumGenre] = useState("");
  const [folderAlbumYear, setFolderAlbumYear] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const [folderCoverFile, setFolderCoverFile] = useState<File | null>(null);
  const [folderCoverPreview, setFolderCoverPreview] = useState<string | null>(null);
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [folderUploadProgress, setFolderUploadProgress] = useState(0);
  const [albumIsPublic, setAlbumIsPublic] = useState(true);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const folderCoverInputRef = useRef<HTMLInputElement>(null);

  // Check if user has existing songs to lock artist name
  const { data: userExistingSongs } = useQuery({
    queryKey: ["user-existing-songs", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("songs")
        .select("artist")
        .eq("user_id", user.id)
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
    enabled: !!user,
  });

  const lockedArtistName = userExistingSongs?.artist || null;
  const isArtistLocked = !!lockedArtistName;

  useEffect(() => {
    if (isArtistLocked && lockedArtistName) {
      setArtist(lockedArtistName);
    } else if (profile?.display_name && !artist) {
      setArtist(profile.display_name);
    }
  }, [profile?.display_name, isArtistLocked, lockedArtistName]);

  const checkArtistName = async (artistName: string) => {
    if (!artistName.trim() || !user) return;
    
    setIsCheckingArtist(true);
    setArtistError(null);

    try {
      const { data, error } = await supabase
        .from("songs")
        .select("user_id")
        .ilike("artist", artistName.trim())
        .neq("user_id", user.id)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setArtistError("This artist name is already used by another user");
      }
    } catch (error) {
      console.error("Error checking artist name:", error);
    } finally {
      setIsCheckingArtist(false);
    }
  };

  const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isArtistLocked) return;
    const value = e.target.value;
    setArtist(value);
    setArtistError(null);
  };

  const handleArtistBlur = () => {
    if (artist.trim()) {
      checkArtistName(artist);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 100MB");
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

  const handleSubmitSong = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!audioFile || !title || !artist) return;

    if (artistError) {
      toast.error("Please fix the artist name error before uploading");
      return;
    }

    await checkArtistName(artist);
    if (artistError) {
      toast.error("This artist name is already taken by another user");
      return;
    }

    await uploadMutation.mutateAsync({
      title,
      artist: artist.trim(),
      album: albumId && albumId !== "none" ? myAlbums?.find(a => a.id === albumId)?.title : album || undefined,
      genre: genre || undefined,
      audioFile,
      coverFile: coverFile || undefined,
      isPublic,
    });

    setTitle("");
    setArtist(profile?.display_name || "");
    setAlbum("");
    setAlbumId("");
    setGenre("");
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    
    navigate("/library");
  };

  // Handle folder selection - this creates an album
  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const audioFiles: FolderFile[] = [];
    let coverFound: File | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath || file.name;
      
      if (file.type.startsWith('audio/') || /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(file.name)) {
        audioFiles.push({
          file,
          name: file.name.replace(/\.[^/.]+$/, ""),
          relativePath,
        });
      }
      
      if (!coverFound && file.type.startsWith('image/') && /cover|album|folder|front/i.test(file.name)) {
        coverFound = file;
      }
    }

    if (audioFiles.length === 0) {
      toast.error("No audio files found in the folder");
      return;
    }

    audioFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setFolderFiles(audioFiles);

    const firstPath = audioFiles[0]?.relativePath || "";
    const folderName = firstPath.split('/')[0] || "";
    if (folderName && !folderAlbumTitle) {
      setFolderAlbumTitle(folderName);
    }

    if (coverFound) {
      setFolderCoverFile(coverFound);
      setFolderCoverPreview(URL.createObjectURL(coverFound));
    }

    toast.success(`Found ${audioFiles.length} tracks for your album`);
  }, [folderAlbumTitle]);

  const handleFolderCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFolderCoverFile(file);
      setFolderCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (folderFiles.length === 0 || !folderAlbumTitle || !artist) return;

    setIsUploadingFolder(true);
    setFolderUploadProgress(0);

    try {
      let coverUrl: string | undefined;
      if (folderCoverFile) {
        const fileName = `${user?.id}/${Date.now()}-album-cover.${folderCoverFile.name.split('.').pop()}`;
        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(fileName, folderCoverFile);

        if (!coverError) {
          const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
          coverUrl = data.publicUrl;
        }
      }

      // Create the album
      const newAlbum = await createAlbum.mutateAsync({
        title: folderAlbumTitle,
        artist: artist.trim(),
        description: folderDescription || undefined,
        genre: folderAlbumGenre || undefined,
        release_year: folderAlbumYear ? parseInt(folderAlbumYear) : undefined,
        cover_url: coverUrl,
        is_public: albumIsPublic,
        is_featured: false,
      });

      // Upload each song
      for (let i = 0; i < folderFiles.length; i++) {
        const folderFile = folderFiles[i];
        setFolderUploadProgress(Math.round(((i + 1) / folderFiles.length) * 100));

        await uploadMutation.mutateAsync({
          title: folderFile.name,
          artist: artist.trim(),
          album: folderAlbumTitle,
          genre: folderAlbumGenre || undefined,
          audioFile: folderFile.file,
          coverFile: folderCoverFile || undefined,
          isPublic: albumIsPublic,
        });
      }

      toast.success(`Album "${folderAlbumTitle}" created with ${folderFiles.length} tracks!`);
      
      setFolderFiles([]);
      setFolderAlbumTitle("");
      setFolderAlbumGenre("");
      setFolderAlbumYear("");
      setFolderDescription("");
      setFolderCoverFile(null);
      setFolderCoverPreview(null);
      
      navigate("/albums");
    } catch (error) {
      console.error("Album upload error:", error);
      toast.error("Failed to create album");
    } finally {
      setIsUploadingFolder(false);
      setFolderUploadProgress(0);
    }
  };

  const removeFileFromFolder = (index: number) => {
    setFolderFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="pb-32 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">Upload Your Music</h1>
      <p className="text-muted-foreground mb-8">
        Share your tracks and albums with the world.
      </p>

      <Tabs defaultValue="album" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="album" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Upload Album (Folder)
          </TabsTrigger>
          <TabsTrigger value="song" className="gap-2">
            <Music className="w-4 h-4" />
            Single Track
          </TabsTrigger>
        </TabsList>

        {/* Album = Folder Upload */}
        <TabsContent value="album">
          <form onSubmit={handleSubmitAlbum}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Disc className="w-5 h-5" />
                  Create Album from Folder
                </CardTitle>
                <CardDescription>
                  Select a folder containing your album tracks. Each folder becomes an album.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Folder Select */}
                <div
                  onClick={() => folderInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    folderFiles.length > 0 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={folderInputRef}
                    type="file"
                    {...{ webkitdirectory: "", directory: "" } as any}
                    onChange={handleFolderSelect}
                    className="hidden"
                    multiple
                  />
                  {folderFiles.length > 0 ? (
                    <div className="flex items-center justify-center gap-3">
                      <FolderOpen className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{folderFiles.length} tracks ready</p>
                        <p className="text-sm text-muted-foreground">Click to select different folder</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Select Album Folder</p>
                      <p className="text-sm text-muted-foreground">
                        Choose a folder with your album tracks
                      </p>
                    </>
                  )}
                </div>

                {/* Show files in folder */}
                {folderFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Tracks ({folderFiles.length})</Label>
                    <ScrollArea className="h-48 border rounded-lg p-2">
                      {folderFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <FileAudio className="w-4 h-4 text-primary" />
                            <span className="text-sm">{index + 1}. {file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFileFromFolder(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>
                )}

                {/* Album Details */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    onClick={() => folderCoverInputRef.current?.click()}
                    className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      folderCoverPreview 
                        ? "border-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      ref={folderCoverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFolderCoverSelect}
                      className="hidden"
                    />
                    {folderCoverPreview ? (
                      <img src={folderCoverPreview} alt="Album cover" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Album Cover</span>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="folderAlbumTitle">Album Title *</Label>
                      <Input
                        id="folderAlbumTitle"
                        value={folderAlbumTitle}
                        onChange={(e) => setFolderAlbumTitle(e.target.value)}
                        placeholder="Album name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="folderArtist">
                        Artist Name *
                        {isArtistLocked && <Lock className="w-3 h-3 inline ml-1" />}
                      </Label>
                      <Input
                        id="folderArtist"
                        value={artist}
                        onChange={handleArtistChange}
                        onBlur={handleArtistBlur}
                        placeholder="Your artist name"
                        disabled={isArtistLocked}
                        required
                      />
                      {artistError && (
                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {artistError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="folderGenre">Genre</Label>
                    <Select value={folderAlbumGenre} onValueChange={setFolderAlbumGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="folderYear">Release Year</Label>
                    <Input
                      id="folderYear"
                      type="number"
                      value={folderAlbumYear}
                      onChange={(e) => setFolderAlbumYear(e.target.value)}
                      placeholder={new Date().getFullYear().toString()}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Album</Label>
                    <p className="text-sm text-muted-foreground">
                      Make this album visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={albumIsPublic}
                    onCheckedChange={setAlbumIsPublic}
                  />
                </div>

                {isUploadingFolder && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading tracks...</span>
                      <span>{folderUploadProgress}%</span>
                    </div>
                    <Progress value={folderUploadProgress} />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  className="w-full"
                  disabled={folderFiles.length === 0 || !folderAlbumTitle || !artist || isUploadingFolder}
                >
                  {isUploadingFolder ? "Creating Album..." : `Create Album (${folderFiles.length} tracks)`}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Single Song Upload */}
        <TabsContent value="song">
          <form onSubmit={handleSubmitSong}>
            <Card>
              <CardHeader>
                <CardTitle>Track Details</CardTitle>
                <CardDescription>
                  Upload a single track
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
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <>
                        <Image className="w-8 h-8 mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Cover Art</span>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Track title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="artist">
                        Artist *
                        {isArtistLocked && <Lock className="w-3 h-3 inline ml-1" />}
                      </Label>
                      <Input
                        id="artist"
                        value={artist}
                        onChange={handleArtistChange}
                        onBlur={handleArtistBlur}
                        placeholder="Artist name"
                        disabled={isArtistLocked}
                        required
                      />
                      {artistError && (
                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {artistError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="albumSelect">Add to Album</Label>
                    <Select value={albumId} onValueChange={setAlbumId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select album (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No album</SelectItem>
                        {myAlbums?.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public</Label>
                    <p className="text-sm text-muted-foreground">
                      Make visible to everyone
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  className="w-full"
                  disabled={!audioFile || !title || !artist || uploadMutation.isPending || !!artistError}
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload Track"}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
