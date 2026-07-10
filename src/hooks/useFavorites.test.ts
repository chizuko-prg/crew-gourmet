import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useFavorites } from "./useFavorites";

const STORAGE_KEY = "crew-gourmet:favorites:v1";

describe("useFavorites", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty when nothing stored", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids).toEqual([]);
  });

  it("adds and removes an id, persisting to localStorage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggle("1"));
    expect(result.current.isFavorite("1")).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual(["1"]);

    act(() => result.current.toggle("1"));
    expect(result.current.isFavorite("1")).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });

  it("restores favorites saved in a previous session", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["3", "5"]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.ids.sort()).toEqual(["3", "5"]);
  });

  it("cleans up ids that no longer exist in the current data set", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["1", "2", "999"]));
    const { result } = renderHook(() => useFavorites(new Set(["1", "2"])));

    expect(result.current.ids.sort()).toEqual(["1", "2"]);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]").sort()).toEqual([
      "1",
      "2",
    ]);
  });
});
