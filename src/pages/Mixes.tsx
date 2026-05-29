import { Link } from "react-router-dom";
import { Play, Sparkles } from "lucide-react";
import { useMixes } from "@/hooks/useMixes";
import { Skeleton } from "@/components/ui/skeleton";

const Mixes = () => {
  const { data: mixes, isLoading } = useMixes();

  return (
    <div className="p-4 md:p-8 space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> YouTube-powered
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mt-2">Mixes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Single-stream compilations with instant timestamp jumps. Powered by YouTube.
          </p>
        </div>
      </header>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && (!mixes || mixes.length === 0) && (
        <div className="rounded-3xl border border-border bg-card/40 backdrop-blur p-12 text-center">
          <p className="text-muted-foreground">No mixes yet.</p>
        </div>
      )}

      {mixes && mixes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mixes.map((m) => (
            <Link
              key={m.id}
              to={`/mixes/${m.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card/60 backdrop-blur hover:border-white/20 transition-all"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={
                    m.thumbnail ??
                    `https://i.ytimg.com/vi/${m.youtube_video_id}/hqdefault.jpg`
                  }
                  alt={m.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                <div className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-xl">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                {m.tracks?.length > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-black/60 backdrop-blur px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                    {m.tracks.length} tracks
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold truncate">{m.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.artist ?? "James Beats"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mixes;