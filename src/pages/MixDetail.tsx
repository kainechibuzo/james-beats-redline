import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useMix } from "@/hooks/useMixes";
import MixPlayer from "@/components/mixes/MixPlayer";
import { Skeleton } from "@/components/ui/skeleton";

const MixDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: mix, isLoading } = useMix(id);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Link
        to="/mixes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" /> All mixes
      </Link>

      {isLoading && <Skeleton className="h-[70vh] w-full rounded-3xl" />}
      {!isLoading && !mix && (
        <div className="rounded-3xl border border-border p-12 text-center text-muted-foreground">
          Mix not found.
        </div>
      )}
      {mix && <MixPlayer mix={mix} />}
    </div>
  );
};

export default MixDetail;