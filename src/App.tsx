import { useEffect, useState } from "react";
import "./App.css";
import OpenAI from "openai";
import { Heart, Clock, ImageIcon, Sparkles } from "lucide-react";
import type { GeneratedImage, HistoryGroup } from "./types";
import GenerateTab from "./components/GenerateTab";
import HistoryTab from "./components/HistoryTabs";
import FavoritesTab from "./components/FavoritesTab";
import { loadHistory, saveHistory, saveImages } from "./utils/db";

type Tab = "generate" | "history" | "favorites";

//replace OPEN_AI_KEY with value
const QueryPrompt = async (prompt: string, n: number) => {
  const openai = new OpenAI({
    apiKey: "OPEN_AI_KEY",
    dangerouslyAllowBrowser: true,
  });
  const result = await openai.images.generate({
    model: "gpt-image-1.5",
    prompt,
    n,
  });
  console.log(result);
  return result.data ?? [];
};

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [n, setN] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentImages, setCurrentImages] = useState<GeneratedImage[]>([]);
  const [history, setHistory] = useState<HistoryGroup[]>([]);
  const [tab, setTab] = useState<Tab>("generate");
  const [historyPage, setHistoryPage] = useState(0);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  useEffect(() => {
    if (history.length > 0) saveHistory(history);
  }, [history]);

  const toggleFavorite = (id: string) => {
    const toggle = (imgs: GeneratedImage[]) =>
      imgs.map((img) =>
        img.id === id ? { ...img, favorite: !img.favorite } : img,
      );
    setCurrentImages((p) => toggle(p));
    setHistory((p) => p.map((g) => ({ ...g, images: toggle(g.images) })));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setTab("generate");
    try {
      const b64List = await QueryPrompt(prompt.trim(), n);

      const newImages: GeneratedImage[] = b64List.map((item) => ({
        id: Math.random().toString(36).slice(2),
        prompt: prompt.trim(),
        b64: item.b64_json ?? "",
        favorite: false,
      }));

      await saveImages(newImages.map((img) => ({ id: img.id, b64: img.b64! })));

      const newGroup: HistoryGroup = {
        id: Math.random().toString(36).slice(2),
        prompt: prompt.trim(),
        n,
        createdAt: Date.now(),
        images: newImages.map(({ b64: _, ...rest }) => rest),
      };

      setCurrentImages(newImages);
      setHistory((prev) => [newGroup, ...prev]);
      setHistoryPage(0);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const favorites = history
    .flatMap((g) => g.images)
    .filter((img) => img.favorite);

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { key: "generate", label: "Generate", icon: <ImageIcon size={12} /> },
    {
      key: "history",
      label: "History",
      icon: <Clock size={12} />,
      badge: history.length || undefined,
    },
    {
      key: "favorites",
      label: "Favorites",
      icon: (
        <Heart size={12} fill={tab === "favorites" ? "currentColor" : "none"} />
      ),
      badge: favorites.length || undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-4xl flex"
        style={{ minHeight: 500 }}
      >
        <form
          onSubmit={handleGenerate}
          className="w-68 flex-shrink-0 flex flex-col gap-5 p-6 border-r border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-800">
            Let's start with your content
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">
              Describe what you want to generate
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Generate Dogs Images"
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-violet-500 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Number of images</label>
            <input
              type="number"
              min={1}
              max={6}
              value={n}
              onChange={(e) =>
                setN(Math.min(6, Math.max(1, Number(e.target.value))))
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-400"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 text-sm font-semibold text-black bg-violet-600 rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={14} />
            {loading ? "Generating…" : "Generate"}
          </button>
        </form>

        <div className="flex-1 flex flex-col">
          <div className="flex border-b border-gray-100 px-5 pt-4">
            {tabs.map(({ key, label, icon, badge }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 mr-5 pb-3 text-xs font-medium border-b-2 transition-colors ${
                  tab === key
                    ? "border-violet-500 text-violet-600"
                    : "border-transparent text-gray-400"
                }`}
              >
                {icon}
                {label}
                {badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${key === "favorites" ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"}`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 p-5">
            {tab === "generate" && (
              <GenerateTab
                loading={loading}
                n={n}
                images={currentImages}
                onFavorite={toggleFavorite}
              />
            )}
            {tab === "history" && (
              <HistoryTab
                history={history}
                page={historyPage}
                onPageChange={setHistoryPage}
                onFavorite={toggleFavorite}
              />
            )}
            {tab === "favorites" && (
              <FavoritesTab favorites={favorites} onFavorite={toggleFavorite} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
