import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Upload as UploadIcon, Music, X, Image, AlertCircle, Lock, Disc, FolderOpen, FileAudio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

  // Album creation state
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumArtist, setAlbumArtist] = useState("");
  const [albumDescription, setAlbumDescription] = useState("");
  const [albumGenre, setAlbumGenre] = useState("");
  const [albumReleaseYear, setAlbumReleaseYear] = useState("");
  const [albumIsPublic, setAlbumIsPublic] = useState(true);
  const [albumCoverFile, setAlbumCoverFile] = useState<File | null>(null);
  const [albumCoverPreview, setAlbumCoverPreview] = useState<string | null>(null);

  // Folder upload state
  const [folderFiles, setFolderFiles] = useState<FolderFile[]>([]);
  const [folderAlbumTitle, setFolderAlbumTitle] = useState("");
  const [folderAlbumGenre, setFolderAlbumGenre] = useState("");
  const [folderAlbumYear, setFolderAlbumYear] = useState("");
  const [folderCoverFile, setFolderCoverFile] = useState<File | null>(null);
  const [folderCoverPreview, setFolderCoverPreview] = useState<string | null>(null);
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);
  const [folderUploadProgress, setFolderUploadProgress] = useState(0);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const albumCoverInputRef = useRef<HTMLInputElement>(null);
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

  // Artist name is locked if user has uploaded songs before
  const lockedArtistName = userExistingSongs?.artist || null;
  const isArtistLocked = !!lockedArtistName;

  // Set default artist name from profile or locked artist name
  useEffect(() => {
    if (isArtistLocked && lockedArtistName) {
      setArtist(lockedArtistName);
      setAlbumArtist(lockedArtistName);
    } else if (profile?.display_name && !artist) {
      setArtist(profile.display_name);
      setAlbumArtist(profile.display_name);
    }
  }, [profile?.display_name, isArtistLocked, lockedArtistName]);

  // Check if artist name is taken by another user
  const checkArtistName = async (artistName: string) => {
    if (!artistName.trim() || !user) return;
    
    setIsCheckingArtist(true);
    setArtistError(null);

    try {
      // Check if any other user has used this artist name
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

  const handleAlbumCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAlbumCoverFile(file);
      setAlbumCoverPreview(URL.createObjectURL(file));
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
      album: albumId ? myAlbums?.find(a => a.id === albumId)?.title : album || undefined,
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

  const handleSubmitAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!albumTitle || !albumArtist) return;

    let coverUrl: string | undefined;
    
    if (albumCoverFile) {
      const fileName = `${user?.id}/${Date.now()}-album-cover.${albumCoverFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, albumCoverFile);

      if (uploadError) {
        toast.error("Failed to upload cover");
        return;
      }

      const { data } = supabase.storage.from("covers").getPublicUrl(fileName);
      coverUrl = data.publicUrl;
    }

    await createAlbum.mutateAsync({
      title: albumTitle,
      artist: albumArtist.trim(),
      description: albumDescription || undefined,
      genre: albumGenre || undefined,
      release_year: albumReleaseYear ? parseInt(albumReleaseYear) : undefined,
      cover_url: coverUrl,
      is_public: albumIsPublic,
      is_featured: false,
    });

    setAlbumTitle("");
    setAlbumDescription("");
    setAlbumGenre("");
    setAlbumReleaseYear("");
    setAlbumCoverFile(null);
    setAlbumCoverPreview(null);
  };

  // Handle folder selection
  const handleFolderSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const audioFiles: FolderFile[] = [];
    let coverFound: File | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relativePath = file.webkitRelativePath || file.name;
      
      // Check for audio files
      if (file.type.startsWith('audio/') || /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(file.name)) {
        audioFiles.push({
          file,
          name: file.name.replace(/\.[^/.]+$/, ""),
          relativePath,
        });
      }
      
      // Check for cover image
      if (!coverFound && file.type.startsWith('image/') && /cover|album|folder|front/i.test(file.name)) {
        coverFound = file;
      }
    }

    if (audioFiles.length === 0) {
      toast.error("No audio files found in the folder");
      return;
    }

    // Sort by filename
    audioFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
    setFolderFiles(audioFiles);

    // Try to extract album name from folder path
    const firstPath = audioFiles[0]?.relativePath || "";
    const folderName = firstPath.split('/')[0] || "";
    if (folderName && !folderAlbumTitle) {
      setFolderAlbumTitle(folderName);
    }

    // Set cover if found
    if (coverFound) {
      setFolderCoverFile(coverFound);
      setFolderCoverPreview(URL.createObjectURL(coverFound));
    }

    toast.success(`Found ${audioFiles.length} audio files`);
  }, [folderAlbumTitle]);

  const handleFolderCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFolderCoverFile(file);
      setFolderCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (folderFiles.length === 0 || !folderAlbumTitle || !artist) return;

    setIsUploadingFolder(true);
    setFolderUploadProgress(0);

    try {
      // First, upload cover if exists
      let coverUrl: string | undefined;
      if (folderCoverFile) {
        const fileName = `${user?.id}/${Date.now()}-folder-cover.${folderCoverFile.name.split('.').pop()}`;
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
        genre: folderAlbumGenre || undefined,
        release_year: folderAlbumYear ? parseInt(folderAlbumYear) : undefined,
        cover_url: coverUrl,
        is_public: true,
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
          isPublic: true,
        });
      }

      toast.success(`Album uploaded with ${folderFiles.length} songs!`);
      
      // Reset folder state
      setFolderFiles([]);
      setFolderAlbumTitle("");
      setFolderAlbumGenre("");
      setFolderAlbumYear("");
      setFolderCoverFile(null);
      setFolderCoverPreview(null);
      
      navigate("/library");
    } catch (error) {
      console.error("Folder upload error:", error);
      toast.error("Failed to upload album");
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

      <Tabs defaultValue="song" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="song" className="gap-2">
            <Music className="w-4 h-4" />
            Single Song
          </TabsTrigger>
          <TabsTrigger value="album" className="gap-2">
            <Disc className="w-4 h-4" />
            Create Album
          </TabsTrigger>
          <TabsTrigger value="folder" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Upload Folder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="song">
          <form onSubmit={handleSubmitSong}>
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
                      <Label htmlFor="artist" className="flex items-center gap-2">
                        Artist Name *
                        {isArtistLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </Label>
                      <div className="relative">
                        <Input
                          id="artist"
                          placeholder="Enter artist name"
                          value={artist}
                          onChange={handleArtistChange}
                          onBlur={handleArtistBlur}
                          className={`${artistError ? "border-destructive" : ""} ${isArtistLocked ? "bg-muted cursor-not-allowed pr-10" : ""}`}
                          disabled={isArtistLocked}
                          required
                        />
                        {isArtistLocked && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      {isCheckingArtist && (
                        <p className="text-sm text-muted-foreground">Checking availability...</p>
                      )}
                      {artistError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {artistError}
                        </p>
                      )}
                      {isArtistLocked ? (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Artist name locked. Sign out and back in to change it.
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Your artist name will be locked once you upload a song
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="album">Album</Label>
                    {myAlbums && myAlbums.length > 0 ? (
                      <Select value={albumId} onValueChange={setAlbumId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select album (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {myAlbums.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="album"
                        placeholder="Enter album name (optional)"
                        value={album}
                        onChange={(e) => setAlbum(e.target.value)}
                      />
                    )}
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
                    disabled={!audioFile || !title || !artist || !!artistError || uploadMutation.isPending}
                  >
                    <Music className="w-4 h-4" />
                    {uploadMutation.isPending ? "Uploading..." : "Upload Track"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="album">
          <form onSubmit={handleSubmitAlbum}>
            <Card>
              <CardHeader>
                <CardTitle>Album Details</CardTitle>
                <CardDescription>
                  Create a new album to organize your tracks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Album Cover */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div
                    onClick={() => albumCoverInputRef.current?.click()}
                    className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                      albumCoverPreview 
                        ? "border-primary" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      ref={albumCoverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAlbumCoverSelect}
                      className="hidden"
                    />
                    {albumCoverPreview ? (
                      <img
                        src={albumCoverPreview}
                        alt="Album cover preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <>
                        <Disc className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Add Cover</p>
                      </>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="albumTitle">Album Title *</Label>
                      <Input
                        id="albumTitle"
                        placeholder="Enter album title"
                        value={albumTitle}
                        onChange={(e) => setAlbumTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="albumArtist" className="flex items-center gap-2">
                        Artist Name *
                        {isArtistLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </Label>
                      <Input
                        id="albumArtist"
                        placeholder="Enter artist name"
                        value={albumArtist}
                        onChange={(e) => !isArtistLocked && setAlbumArtist(e.target.value)}
                        disabled={isArtistLocked}
                        className={isArtistLocked ? "bg-muted cursor-not-allowed" : ""}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="albumDescription">Description</Label>
                  <Textarea
                    id="albumDescription"
                    placeholder="Enter album description (optional)"
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="albumGenre">Genre</Label>
                    <Select value={albumGenre} onValueChange={setAlbumGenre}>
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

                  <div className="space-y-2">
                    <Label htmlFor="releaseYear">Release Year</Label>
                    <Input
                      id="releaseYear"
                      type="number"
                      placeholder="2024"
                      value={albumReleaseYear}
                      onChange={(e) => setAlbumReleaseYear(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label htmlFor="albumPublic" className="text-base font-medium">
                      Make album public
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Public albums can be discovered by everyone
                    </p>
                  </div>
                  <Switch
                    id="albumPublic"
                    checked={albumIsPublic}
                    onCheckedChange={setAlbumIsPublic}
                  />
                </div>

                <Button
                  type="submit"
                  variant="glow"
                  className="w-full gap-2"
                  disabled={!albumTitle || !albumArtist || createAlbum.isPending}
                >
                  <Disc className="w-4 h-4" />
                  {createAlbum.isPending ? "Creating..." : "Create Album"}
                </Button>
              </CardContent>
            </Card>
          </form>

          {/* My Albums */}
          {myAlbums && myAlbums.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Albums</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {myAlbums.map((album) => (
                    <div key={album.id} className="text-center">
                      <div className="aspect-square rounded-lg bg-muted overflow-hidden mb-2">
                        {album.cover_url ? (
                          <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <Disc className="w-8 h-8 text-primary/50" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{album.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Folder Upload Tab */}
        <TabsContent value="folder">
          <form onSubmit={handleSubmitFolder}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Upload Album from Folder
                </CardTitle>
                <CardDescription>
                  Select a folder containing audio files to create an album automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Folder Selection */}
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
                    /* @ts-ignore */
                    webkitdirectory=""
                    /* @ts-ignore */
                    directory=""
                    multiple
                    onChange={handleFolderSelect}
                    className="hidden"
                  />
                  {folderFiles.length > 0 ? (
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-3">
                        <FolderOpen className="w-6 h-6 text-primary" />
                        <span className="font-medium">{folderFiles.length} audio files selected</span>
                      </div>
                      <ScrollArea className="h-32">
                        <div className="space-y-1">
                          {folderFiles.map((f, index) => (
                            <div key={index} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded text-sm">
                              <span className="truncate flex items-center gap-2">
                                <FileAudio className="w-4 h-4 text-muted-foreground" />
                                {f.name}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFileFromFolder(index);
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <>
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium mb-2">Click to select a folder</p>
                      <p className="text-sm text-muted-foreground">
                        All audio files in the folder will be added to your album
                      </p>
                    </>
                  )}
                </div>

                {folderFiles.length > 0 && (
                  <>
                    {/* Album Cover */}
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
                          <img
                            src={folderCoverPreview}
                            alt="Album cover preview"
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
                          <Label htmlFor="folderAlbumTitle">Album Title *</Label>
                          <Input
                            id="folderAlbumTitle"
                            placeholder="Enter album title"
                            value={folderAlbumTitle}
                            onChange={(e) => setFolderAlbumTitle(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Artist Name *
                            {isArtistLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                          </Label>
                          <Input
                            value={artist}
                            disabled
                            className="bg-muted cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="folderAlbumGenre">Genre</Label>
                        <Select value={folderAlbumGenre} onValueChange={setFolderAlbumGenre}>
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

                      <div className="space-y-2">
                        <Label htmlFor="folderReleaseYear">Release Year</Label>
                        <Input
                          id="folderReleaseYear"
                          type="number"
                          placeholder="2024"
                          value={folderAlbumYear}
                          onChange={(e) => setFolderAlbumYear(e.target.value)}
                        />
                      </div>
                    </div>

                    {isUploadingFolder && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading songs...</span>
                          <span>{folderUploadProgress}%</span>
                        </div>
                        <Progress value={folderUploadProgress} className="h-2" />
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="glow"
                      className="w-full gap-2"
                      disabled={folderFiles.length === 0 || !folderAlbumTitle || !artist || isUploadingFolder}
                    >
                      <FolderOpen className="w-4 h-4" />
                      {isUploadingFolder ? `Uploading... (${folderUploadProgress}%)` : `Upload Album (${folderFiles.length} songs)`}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Upload;
