import type { HistoryGroup } from "../types";

const DB_NAME = "image_store";
const IMG_STORE = "images";
const HIST_STORE = "history";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IMG_STORE, { keyPath: "id" });
      req.result.createObjectStore(HIST_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveImages(images: { id: string; b64: string }[]) {
  const db = await openDB();
  const tx = db.transaction(IMG_STORE, "readwrite");
  const store = tx.objectStore(IMG_STORE);
  images.forEach((img) => store.put(img));
}

export async function loadImages(
  ids: string[],
): Promise<Record<string, string>> {
  const db = await openDB();
  const tx = db.transaction(IMG_STORE, "readonly");
  const store = tx.objectStore(IMG_STORE);
  const result: Record<string, string> = {};
  await Promise.all(
    ids.map(
      (id) =>
        new Promise<void>((res) => {
          const req = store.get(id);
          req.onsuccess = () => {
            if (req.result) result[id] = req.result.b64;
            res();
          };
          req.onerror = () => res();
        }),
    ),
  );
  return result;
}

export async function saveHistory(groups: HistoryGroup[]) {
  const db = await openDB();
  const tx = db.transaction(HIST_STORE, "readwrite");
  const store = tx.objectStore(HIST_STORE);
  store.clear();
  groups.forEach((g) => store.put(g));
}

export async function loadHistory(): Promise<HistoryGroup[]> {
  const db = await openDB();
  const tx = db.transaction(HIST_STORE, "readonly");
  const store = tx.objectStore(HIST_STORE);
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const sorted = (req.result as HistoryGroup[]).sort((a, b) => b.createdAt - a.createdAt);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
  });
}

