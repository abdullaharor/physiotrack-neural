import { createContext, useContext } from "react";
import type { AppApi } from "./useApp";

/** React context carrying the host controller (state, strings, actions, jarvis). */
export const AppContext = createContext<AppApi | null>(null);

export function useAppCtx(): AppApi {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppCtx must be used within <AppContext.Provider>");
  return ctx;
}
