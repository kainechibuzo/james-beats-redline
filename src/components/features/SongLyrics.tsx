import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2 } from "lucide-react";
import { useLyrics } from "@/hooks/useLyrics";

interface SongLyricsProps {
  songId?: string;
}

const SongLyrics = ({ songId }: SongLyricsProps) => {
  const { data: lyricsData, isLoading } = useLyrics(songId || "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Lyrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : lyricsData ? (
            <div className="space-y-2 text-sm">
              {Array.isArray(lyricsData.content) ? (
                lyricsData.content.map((line: { text: string }, index: number) => (
                  <p key={index} className="leading-relaxed">
                    {line.text}
                  </p>
                ))
              ) : (
                <p className="text-muted-foreground">No lyrics available</p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No lyrics available for this song</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SongLyrics;
