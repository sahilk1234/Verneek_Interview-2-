import { useState } from "react";
import { Heart } from "lucide-react";
import type { GeneratedImage } from "../types";

interface Props {
  img: GeneratedImage;
  index: number;
  onFavorite: () => void;
}

export default function ImageCard({ img, onFavorite }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-gray-100 aspect-square"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {img.b64 ? (
        <img
          src={`data:image/png;base64,${img.b64}`}
          alt={img.prompt}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <p className="text-gray-400 text-[10px] text-center p-3">{img.prompt}</p>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onFavorite(); }}
        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer transition-opacity"
        style={{
          background: img.favorite ? "#ef4444" : "#1f2937",
          opacity: hovered || img.favorite ? 1 : 0,
          zIndex: 10,
        }}
      >
        <Heart
          size={14}
          strokeWidth={2.5}
          style={{ display: "block", flexShrink: 0, stroke: "white", fill: img.favorite ? "white" : "none" }}
        />
      </button>
    </div>
  );
}