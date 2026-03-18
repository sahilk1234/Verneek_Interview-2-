import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { HistoryGroup, GeneratedImage } from "../types";
import { loadImages } from "../utils/db";
import ImageCard from "./ImageCard";

interface Props {
  history: HistoryGroup[];
  page: number;
  onPageChange: (page: number) => void;
  onFavorite: (id: string) => void;
}

export default function HistoryTab({
  history,
  page,
  onPageChange,
  onFavorite,
}: Props) {
  const [displayImages, setDisplayImages] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    const group = history[page];
    if (!group) return;
    const ids = group.images.map((img) => img.id);
    loadImages(ids).then((map) => {
      setDisplayImages(
        group.images.map((img) => ({ ...img, b64: map[img.id] })),
      );
    });
  }, [page, history]);

  if (history.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
        <Clock size={32} strokeWidth={1} />
        <p className="text-xs">No history yet</p>
      </div>
    );

  const group = history[page];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 italic truncate">"{group.prompt}"</p>
      <div className="grid grid-cols-3 gap-2">
        {displayImages.map((img, i) => (
          <ImageCard
            key={img.id}
            img={img}
            index={i}
            onFavorite={() => onFavorite(img.id)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= history.length - 1}
          className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-violet-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={12} /> Older
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-violet-400 hover:text-violet-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Newer <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
