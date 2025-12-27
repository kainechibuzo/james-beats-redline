import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Clock, Music, Loader2 } from "lucide-react";
import { useLyrics, LyricLine } from "@/hooks/useLyrics";
import { useCreateLyrics, useUpdateLyrics, useDeleteLyrics } from "@/hooks/useLyricsEditor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface LyricsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  songId: string;
  songTitle: string;
}

const LyricsEditor = ({ open, onOpenChange, songId, songTitle }: LyricsEditorProps) => {
  const { data: existingLyrics, isLoading } = useLyrics(songId);
  const createLyrics = useCreateLyrics();
  const updateLyrics = useUpdateLyrics();
  const deleteLyrics = useDeleteLyrics();

  const [lines, setLines] = useState<LyricLine[]>([{ time: 0, text: "" }]);
  const [synced, setSynced] = useState(true);
  const [behindTheLyrics, setBehindTheLyrics] = useState("");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    if (existingLyrics) {
      setLines(existingLyrics.content.length > 0 ? existingLyrics.content : [{ time: 0, text: "" }]);
      setSynced(existingLyrics.synced);
      setBehindTheLyrics(existingLyrics.behind_the_lyrics || "");
      setLanguage(existingLyrics.language || "en");
    } else {
      setLines([{ time: 0, text: "" }]);
      setSynced(true);
      setBehindTheLyrics("");
      setLanguage("en");
    }
  }, [existingLyrics, open]);

  const addLine = () => {
    const lastTime = lines.length > 0 ? lines[lines.length - 1].time : 0;
    setLines([...lines, { time: lastTime + 3, text: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: "time" | "text", value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const formatTimeInput = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const parseTimeInput = (value: string): number => {
    const match = value.match(/^(\d+):(\d{1,2})(?:\.(\d{1,2}))?$/);
    if (match) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(2, "0"), 10) : 0;
      return mins * 60 + secs + ms / 100;
    }
    return parseFloat(value) || 0;
  };

  const handleSave = () => {
    const validLines = lines.filter((line) => line.text.trim());
    
    if (existingLyrics) {
      updateLyrics.mutate(
        {
          lyricsId: existingLyrics.id,
          songId,
          content: validLines,
          synced,
          behindTheLyrics: behindTheLyrics || undefined,
          language,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createLyrics.mutate(
        {
          songId,
          content: validLines,
          synced,
          behindTheLyrics: behindTheLyrics || undefined,
          language,
        },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const handleDelete = () => {
    if (existingLyrics) {
      deleteLyrics.mutate(
        { lyricsId: existingLyrics.id, songId },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  const isPending = createLyrics.isPending || updateLyrics.isPending || deleteLyrics.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            {existingLyrics ? "Edit Lyrics" : "Add Lyrics"} - {songTitle}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={synced} onCheckedChange={setSynced} id="synced" />
                <Label htmlFor="synced" className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Synced Lyrics
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="language">Language:</Label>
                <Input
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-16"
                  placeholder="en"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 max-h-[40vh] border rounded-lg p-4">
              <div className="space-y-2">
                {lines.map((line, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {synced && (
                      <Input
                        type="text"
                        value={formatTimeInput(line.time)}
                        onChange={(e) => updateLine(index, "time", parseTimeInput(e.target.value))}
                        className="w-24 font-mono text-sm"
                        placeholder="0:00.00"
                      />
                    )}
                    <Input
                      value={line.text}
                      onChange={(e) => updateLine(index, "text", e.target.value)}
                      placeholder={`Line ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Button variant="outline" onClick={addLine} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Line
            </Button>

            <div>
              <Label htmlFor="behind-lyrics">Behind the Lyrics (optional)</Label>
              <Textarea
                id="behind-lyrics"
                value={behindTheLyrics}
                onChange={(e) => setBehindTheLyrics(e.target.value)}
                placeholder="Add context, meaning, or story behind the lyrics..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          {existingLyrics && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lyrics?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the lyrics for this song. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {existingLyrics ? "Update" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LyricsEditor;
