export interface GeneratedImage {
  id: string;
  prompt: string;
  b64?: string;
  favorite: boolean;
}

export interface HistoryGroup {
  id: string;
  prompt: string;
  n: number;
  createdAt: number;
  images: GeneratedImage[];
}
