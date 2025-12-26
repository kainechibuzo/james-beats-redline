import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Star, Tag, MessageSquare, Bookmark, 
  Clock, Music, Plus, Trash2 
} from "lucide-react";
import { useSongRatings, useSongNotes, useSongTags } from "@/hooks/useLibraryFeatures";
import { useBookmarks } from "@/hooks/useAdvancedAudio";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";

interface SongDetailsPanelProps {
  songId: string;
  onClose: () => void;
}

const SongDetailsPanel = ({ songId, onClose }: SongDetailsPanelProps) => {
  const { currentSong, seek, currentTime } = usePlayer();
  const { getRating, setRating } = useSongRatings();
  const { getNote, setNote } = useSongNotes();
  const { getTags, addTag, removeTag, getAllTags } = useSongTags();
  const { getBookmarksForSong, addBookmark, removeBookmark } = useBookmarks();

  const [newTag, setNewTag] = useState("");
  const [newBookmarkLabel, setNewBookmarkLabel] = useState("");

  const rating = getRating(songId);
  const note = getNote(songId);
  const tags = getTags(songId);
  const bookmarks = getBookmarksForSong(songId);
  const allTags = getAllTags;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(songId, newTag.trim());
      setNewTag("");
    }
  };

  const handleAddBookmark = () => {
    if (newBookmarkLabel.trim()) {
      addBookmark(songId, currentTime, newBookmarkLabel.trim());
      setNewBookmarkLabel("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-x-4 bottom-28 max-w-md mx-auto bg-card border border-border rounded-xl shadow-2xl z-40 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Song Details</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="max-h-96 p-4">
        <div className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Star className="w-4 h-4 text-primary" />
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(songId, star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-6 h-6",
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4 text-primary" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(songId, tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allTags.filter(t => !tags.includes(t)).slice(0, 5).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(songId, tag)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    +{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4 text-primary" />
              Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(songId, e.target.value)}
              placeholder="Add personal notes about this song..."
              className="w-full h-20 p-2 bg-muted rounded-lg border border-border resize-none text-sm"
            />
          </div>

          {/* Bookmarks */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Bookmark className="w-4 h-4 text-primary" />
              Bookmarks
            </label>
            
            <div className="space-y-2">
              {bookmarks.map(bookmark => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-2 bg-muted rounded-lg"
                >
                  <button
                    onClick={() => seek(bookmark.time)}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Clock className="w-3 h-3" />
                    {formatTime(bookmark.time)} - {bookmark.label}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    onClick={() => removeBookmark(bookmark.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Bookmark label..."
                value={newBookmarkLabel}
                onChange={(e) => setNewBookmarkLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddBookmark()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddBookmark}>
                <Plus className="w-4 h-4 mr-1" />
                @ {formatTime(currentTime)}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
};

export default SongDetailsPanel;
