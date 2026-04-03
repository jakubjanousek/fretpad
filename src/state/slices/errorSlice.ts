import type { StateCreator } from "zustand";
import type { ErrorInfo } from "@/lib/errors";
import { toErrorInfo } from "@/lib/errors";
import type { AppState } from "../useAppStore";

export interface ErrorSlice {
  error: ErrorInfo | null;

  setError: (error: unknown) => void;
  clearError: () => void;
}

export const createErrorSlice: StateCreator<AppState, [], [], ErrorSlice> = (
  set,
) => ({
  error: null,

  setError: (error) => {
    set({ error: toErrorInfo(error) });
  },

  clearError: () => {
    set({ error: null });
  },
});
