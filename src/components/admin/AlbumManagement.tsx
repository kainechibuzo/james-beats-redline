import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Disc, Star, Music, Trash2 } from "lucide-react";
import { useAlbums, useDeleteAlbum } from "@/hooks/useAlbums";
import { useToggleAlbumFeatured } from "@/hooks/useArtistPromotion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AlbumManagement = () => {
  const { data: albums } = useAlbums();
  const toggleFeatured = useToggleAlbumFeatured();
  const deleteAlbum = useDeleteAlbum();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Disc className="w-5 h-5 text-primary" />
          Album Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {albums?.map((album) => (
              <div
                key={album.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 overflow-hidden">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{album.title}</p>
                      {album.is_featured && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="w-3 h-3" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{album.artist}</p>
                    {album.genre && (
                      <p className="text-xs text-muted-foreground">{album.genre}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Featured</span>
                  <Switch
                    checked={album.is_featured}
                    onCheckedChange={(checked) =>
                      toggleFeatured.mutate({ albumId: album.id, isFeatured: checked })
                    }
                    disabled={toggleFeatured.isPending}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Album</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{album.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAlbum.mutate(album.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {!albums?.length && (
              <p className="text-center py-8 text-muted-foreground">
                No albums found
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlbumManagement;
