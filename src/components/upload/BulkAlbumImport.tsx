import * as React from "react";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Upload, CheckCircle2, XCircle, AlertCircle, Download, Loader2 } from "lucide-react";
import { useCreateAlbum } from "@/hooks/useAlbums";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ParsedAlbum {
  title: string;
  artist: string;
  description?: string;
  genre?: string;
  release_year?: number;
  is_public: boolean;
  status: "pending" | "success" | "error";
  error?: string;
}

const BulkAlbumImport = () => {
  const { user } = useAuth();
  const createAlbum = useCreateAlbum();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedAlbums, setParsedAlbums] = useState<ParsedAlbum[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = `title,artist,description,genre,release_year,is_public
My First Album,Artist Name,A great album,Pop,2024,true
Summer Vibes,DJ Cool,Beach party hits,Electronic,2024,true
Classical Collection,Orchestra,Timeless classics,Classical,2023,false`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "album_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): ParsedAlbum[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const albums: ParsedAlbum[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < 2) continue;

      const album: ParsedAlbum = {
        title: getValue(headers, values, "title") || "",
        artist: getValue(headers, values, "artist") || "",
        description: getValue(headers, values, "description") || undefined,
        genre: getValue(headers, values, "genre") || undefined,
        release_year: parseInt(getValue(headers, values, "release_year") || "") || undefined,
        is_public: getValue(headers, values, "is_public")?.toLowerCase() !== "false",
        status: "pending",
      };

      if (!album.title || !album.artist) {
        album.status = "error";
        album.error = "Missing required fields (title, artist)";
      }

      albums.push(album);
    }

    return albums;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const getValue = (headers: string[], values: string[], key: string): string => {
    const index = headers.indexOf(key);
    return index >= 0 ? values[index] || "" : "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const albums = parseCSV(text);
      setParsedAlbums(albums);

      if (albums.length === 0) {
        toast.error("No valid albums found in CSV");
      } else {
        toast.success(`Found ${albums.length} albums to import`);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!user) {
      toast.error("Must be logged in");
      return;
    }

    const validAlbums = parsedAlbums.filter((a) => a.status === "pending");
    if (validAlbums.length === 0) {
      toast.error("No valid albums to import");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < parsedAlbums.length; i++) {
      const album = parsedAlbums[i];
      if (album.status !== "pending") continue;

      try {
        await createAlbum.mutateAsync({
          title: album.title,
          artist: album.artist,
          description: album.description,
          genre: album.genre,
          release_year: album.release_year,
          is_public: album.is_public,
          is_featured: false,
        });

        setParsedAlbums((prev) =>
          prev.map((a, idx) => (idx === i ? { ...a, status: "success" } : a))
        );
        successCount++;
      } catch (error: any) {
        setParsedAlbums((prev) =>
          prev.map((a, idx) =>
            idx === i ? { ...a, status: "error", error: error.message } : a
          )
        );
        errorCount++;
      }

      setImportProgress(Math.round(((i + 1) / parsedAlbums.length) * 100));
    }

    setIsImporting(false);
    toast.success(`Import complete: ${successCount} success, ${errorCount} errors`);
  };

  const clearImport = () => {
    setParsedAlbums([]);
    setFileName(null);
    setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const StatusIcon = ({ status }: { status: ParsedAlbum["status"] }) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Bulk Album Import (CSV)
        </CardTitle>
        <CardDescription>
          Import multiple albums at once using a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            fileName ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          {fileName ? (
            <div className="flex items-center justify-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
              <span className="font-medium">{fileName}</span>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Select CSV file</p>
              <p className="text-sm text-muted-foreground">
                or drag and drop
              </p>
            </>
          )}
        </div>

        {parsedAlbums.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <Label>Preview ({parsedAlbums.length} albums)</Label>
              <Button variant="ghost" size="sm" onClick={clearImport}>
                Clear
              </Button>
            </div>

            <ScrollArea className="h-64 border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedAlbums.map((album, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <StatusIcon status={album.status} />
                      </TableCell>
                      <TableCell className="font-medium">{album.title}</TableCell>
                      <TableCell>{album.artist}</TableCell>
                      <TableCell>{album.genre || "-"}</TableCell>
                      <TableCell>{album.release_year || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            {isImporting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing albums...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} />
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={isImporting || parsedAlbums.every((a) => a.status !== "pending")}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedAlbums.filter((a) => a.status === "pending").length} Albums`
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkAlbumImport;