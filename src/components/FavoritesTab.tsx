import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { GeneratedImage } from "../types";
import { loadImages } from "../utils/db";
import ImageCard from "./ImageCard";

interface Props {
  favorites: GeneratedImage[];
  onFavorite: (id: string) => void;
}

export default function FavoritesTab({ favorites, onFavorite }: Props) {
  const [displayImages, setDisplayImages] = useState<GeneratedImage[]>([]);

  useEffect(() => {
    if (!favorites.length) { setDisplayImages([]); return; }
    loadImages(favorites.map((img) => img.id)).then((map) => {
      setDisplayImages(favorites.map((img) => ({ ...img, b64: map[img.id] })));
    });
  }, [favorites]);

  if (favorites.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
      <Heart size={32} strokeWidth={1} />
      <p className="text-xs">No favorites yet</p>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayImages.map((img, i) => (
        <ImageCard key={img.id} img={img} index={i} onFavorite={() => onFavorite(img.id)} />
      ))}
    </div>
  );
}