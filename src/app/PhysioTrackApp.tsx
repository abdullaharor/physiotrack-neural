import { useEffect } from "react";
import { AppContext } from "./AppContext";
import { useApp, type AppProps } from "./useApp";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { ScreenArea } from "./ScreenArea";
import { ModalHost } from "./modals/ModalHost";
import { JarvisLayer } from "./jarvis/JarvisLayer";
import { BootOS } from "./jarvis/BootOS";
import { S } from "../lib/Box";

/**
 * PhysioTrackApp — the host clinic platform, a faithful recreation of the
 * PhysioTrack v3 Claude Design page. It owns the RTL/LTR root frame and
 * composes the sidebar, header, active screen, modal system, and the Jarvis
 * layer (chat panel + FAB + boot "OS"). Jarvis is powered entirely through
 * the integration boundary — this component contains no assistant logic.
 */
export function PhysioTrackApp(props: AppProps) {
  const api = useApp(props);
  const { state, reducedMotion } = api;
  const dir = state.lang === "ar" ? "rtl" : "ltr";

  // Keep <html> dir/lang in sync so scrollbars, logical props and fonts match.
  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", state.lang);
  }, [dir, state.lang]);

  const rootSx =
    "height:100vh;display:flex;gap:14px;padding:14px;box-sizing:border-box;color:var(--color-text);font-family:var(--font-body);font-size:15px;overflow:hidden;background:radial-gradient(1100px 600px at 18% -12%, color-mix(in srgb, var(--color-section) 34%, transparent), transparent 62%),radial-gradient(900px 700px at 108% 112%, color-mix(in srgb, var(--color-section-glow) 20%, transparent), transparent 58%),var(--color-bg)";

  return (
    <AppContext.Provider value={api}>
      <S as="div" sx={rootSx} {...{ dir, "data-motion": reducedMotion ? "reduced" : "full" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, gap: 14 }}>
          <Header />
          <ScreenArea />
        </main>
        <ModalHost />
        <JarvisLayer />
        <BootOS />
      </S>
    </AppContext.Provider>
  );
}
