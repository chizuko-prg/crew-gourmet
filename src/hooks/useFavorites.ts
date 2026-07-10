import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "crew-gourmet:favorites:v1";

function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeStoredIds(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorageが使えない環境（プライベートブラウズ等）では何もしない
  }
}

export function useFavorites(validIds?: Set<string>) {
  const [ids, setIds] = useState<string[]>(() => readStoredIds());

  // データ更新で削除されたidを保存値から掃除する
  useEffect(() => {
    if (!validIds) return;
    setIds((prev) => {
      const cleaned = prev.filter((id) => validIds.has(id));
      if (cleaned.length !== prev.length) {
        writeStoredIds(cleaned);
        return cleaned;
      }
      return prev;
    });
  }, [validIds]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((existing) => existing !== id)
        : [...prev, id];
      writeStoredIds(next);
      return next;
    });
  }, []);

  return { ids, isFavorite, toggle };
}
