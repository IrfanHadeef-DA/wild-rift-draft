import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { DraftPick, Role } from "@/types";

interface DraftStore {
  // State
  allyPicks: DraftPick[];
  enemyPicks: DraftPick[];
  userRole: Role;
  isAnalyzing: boolean;

  // Actions
  addAllyPick: (pick: DraftPick) => void;
  removeAllyPick: (championId: string) => void;
  addEnemyPick: (pick: DraftPick) => void;
  removeEnemyPick: (championId: string) => void;
  setUserRole: (role: Role) => void;
  setIsAnalyzing: (val: boolean) => void;
  resetDraft: () => void;
}

const initialState = {
  allyPicks: [] as DraftPick[],
  enemyPicks: [] as DraftPick[],
  userRole: "support" as Role,
  isAnalyzing: false,
};

export const useDraftStore = create<DraftStore>()(
  devtools(
    (set) => ({
      ...initialState,

      addAllyPick: (pick) =>
        set((state) => {
          if (state.allyPicks.length >= 5) return state;
          if (state.allyPicks.some((p) => p.champion_id === pick.champion_id)) return state;
          return { allyPicks: [...state.allyPicks, pick] };
        }),

      removeAllyPick: (championId) =>
        set((state) => ({
          allyPicks: state.allyPicks.filter((p) => p.champion_id !== championId),
        })),

      addEnemyPick: (pick) =>
        set((state) => {
          if (state.enemyPicks.length >= 5) return state;
          if (state.enemyPicks.some((p) => p.champion_id === pick.champion_id)) return state;
          return { enemyPicks: [...state.enemyPicks, pick] };
        }),

      removeEnemyPick: (championId) =>
        set((state) => ({
          enemyPicks: state.enemyPicks.filter((p) => p.champion_id !== championId),
        })),

      setUserRole: (role) => set({ userRole: role }),
      setIsAnalyzing: (val) => set({ isAnalyzing: val }),
      resetDraft: () => set(initialState),
    }),
    { name: "draft-store" }
  )
);
