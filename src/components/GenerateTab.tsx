import { ImageIcon } from "lucide-react";
import type { GeneratedImage } from "../types";
import ImageCard from "./ImageCard";

interface Props {
  loading: boolean;
  n: number;
  images: GeneratedImage[];
  onFavorite: (id: string) => void;
}

export default function GenerateTab({ loading, n, images, onFavorite }: Props) {
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <p className="text-xs text-gray-400">
          Generating {n} image{n > 1 ? "s" : ""}…
        </p>
      </div>
    );

  if (images.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
        <ImageIcon size={32} strokeWidth={1} />
        <p className="text-xs">Enter a prompt and hit Generate</p>
      </div>
    );

  const cols =
    images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3";

  return (
    <div className={`grid ${cols} gap-2`}>
      {images.map((img, i) => (
        <ImageCard
          key={img.id}
          img={img}
          index={i}
          onFavorite={() => onFavorite(img.id)}
        />
      ))}
    </div>
  );
}
