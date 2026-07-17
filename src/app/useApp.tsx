/**
 * useApp — the host application controller.
 *
 * This is the faithful port of the v3 dc-runtime `Component`: it owns all
 * app state (patients, view, modals, assessment, CDSS insight status) and the
 * Jarvis chat/voice/boot lifecycle. Crucially, every Jarvis interaction goes
 * through the injected provider boundary (getJarvisProvider()) — no Jarvis
 * intelligence lives here. The chat call that v3 made to `window.claude` is
 * now `provider.chat.complete(...)`; voice is `provider.voice`.
 */
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Lang } from "../i18n/strings";
import { L } from "../i18n/strings";
import {
  CLINICAL_DATA,
  TEAM,
  type DxKey,
  type NavKey,
} from "../data/registries";
import {
  seedPatients,
  easeOutCubic,
  type Patient,
  type AssessmentRecord,
} from "../data/seed";
import { cdssForPatient, SEV_ORDER, type Insight } from "../cdss/engine";
import { getJarvisProvider } from "../integrations/jarvis/provider";
import { buildClinicContext } from "../integrations/jarvis/contextBridge";
import type { JarvisMessage } from "../integrations/jarvis/types";

export type ModalType = "profile" | "add" | "pick" | "assess" | "report";
export type OsPhase = "core" | "hud" | "chat" | "out" | "done";

export interface InsightStatusEntry { status?: "accepted" | "done" | "dismissed"; note?: string }
export interface ChatMsg { role: "user" | "assistant"; text: string }

export interface AppState {
  lang: Lang;
  view: NavKey;
  viewLoading: boolean;
  patients: Patient[];
  uid: number;
  searchQ: string;
  modal: { type: ModalType; closing: boolean } | null;
  profileId: number | null;
  form: { name: string; age: string; gender: "male" | "female"; diag: string; dxKey: DxKey; total: string };
  assess: { dxKey: DxKey; rom: Record<string, number>; mmt: Record<string, number> } | null;
  reportRec: AssessmentRecord | null;
  kpiT: number;
  ringT: number;
  jarvisMounted: boolean;
  jarvisClosing: boolean;
  jarvisUnread: boolean;
  jarvisMsgs: ChatMsg[];
  jarvisBusy: boolean;
  jarvisInput: string;
  voiceOn: boolean;
  expandedInsight: string | null;
  insightStatus: Record<string, InsightStatusEntry>;
  hiddenRules: Record<string, boolean>;
  osPhase: OsPhase;
  hudStep: number;
  bootCaption: string;
  bootCaptionOn: boolean;
  bootVoiceOn: boolean;
  speakingNow: boolean;
  listening: boolean;
  waveHeights: number[];
}

export interface AppProps {
  defaultLanguage?: Lang;
  showIntro?: boolean;
  reducedMotion?: boolean;
}

function initialState(props: AppProps): AppState {
  return {
    lang: props.defaultLanguage || "ar",
    view: "dashboard",
    viewLoading: true,
    patients: seedPatients(),
    uid: 6,
    searchQ: "",
    modal: null,
    profileId: null,
    form: { name: "", age: "", gender: "male", diag: "", dxKey: "lower_back", total: "12" },
    assess: null,
    reportRec: null,
    kpiT: 0,
    ringT: 0,
    jarvisMounted: false,
    jarvisClosing: false,
    jarvisUnread: true,
    jarvisMsgs: [],
    jarvisBusy: false,
    jarvisInput: "",
    voiceOn: false,
    expandedInsight: null,
    insightStatus: {},
    hiddenRules: {},
    osPhase: "core",
    hudStep: 0,
    bootCaption: "",
    bootCaptionOn: false,
    bootVoiceOn: true,
    speakingNow: false,
    listening: false,
    waveHeights: Array(12).fill(0.16),
  };
}

type Patch = Partial<AppState> | ((s: AppState) => Partial<AppState>);
function reducer(s: AppState, patch: Patch): AppState {
  return { ...s, ...(typeof patch === "function" ? patch(s) : patch) };
}

export interface ActiveInsight extends Insight { key: string; status: string | null; note: string }

export function useApp(props: AppProps) {
  const [state, dispatch] = useReducer(reducer, props, initialState);
  const setState = dispatch as (patch: Patch) => void;

  // Always-current snapshot for timers/callbacks (v3's `this.state`).
  const ref = useRef(state);
  ref.current = state;

  const timers = useRef<number[]>([]);
  const raf = useRef<number | undefined>(undefined);
  const raf2 = useRef<number | undefined>(undefined);
  const waveInt = useRef<number | undefined>(undefined);
  const msgStamp = useRef<number>(-1);
  const recStop = useRef<(() => void) | null>(null);
  const msgsRef = useRef<HTMLDivElement | null>(null);
  const srOk = useRef<boolean>(false);

  const provider = getJarvisProvider();
  const t = L(state.lang);

  const _t = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  /* ── CDSS active insights ─────────────────────────────────────── */
  const activeInsights = useCallback(
    (patient?: Patient): ActiveInsight[] => {
      const st = ref.current;
      const list = patient ? [patient] : st.patients;
      const out: ActiveInsight[] = [];
      list.forEach((p) =>
        cdssForPatient(p, st.lang).forEach((ins) => {
          const key = p.id + ":" + ins.ruleId;
          const s = st.insightStatus[key] || {};
          if (s.status === "dismissed" || st.hiddenRules[ins.ruleId]) return;
          out.push({ ...ins, key, status: s.status || null, note: s.note || "" });
        }),
      );
      return out.sort((a, b) => SEV_ORDER.indexOf(a.sev) - SEV_ORDER.indexOf(b.sev));
    },
    [],
  );

  /* ── clinic context bridge (for Jarvis) ───────────────────────── */
  const buildContext = useCallback(() => {
    const st = ref.current;
    const open =
      st.modal && st.profileId != null && ["profile", "pick", "assess", "report"].includes(st.modal.type)
        ? st.patients.find((p) => p.id === st.profileId)
        : null;
    return buildClinicContext({
      lang: st.lang,
      patients: st.patients,
      team: TEAM,
      activeInsights: activeInsights().map((i) => ({
        patientName: i.patientName, sev: i.sev, title: i.title, status: i.status,
      })),
      openPatientName: open ? open.name : null,
    });
  }, [activeInsights]);

  /* ── voice waveform sync ──────────────────────────────────────── */
  const syncWave = useCallback(() => {
    const active = ref.current.speakingNow || ref.current.listening;
    if (active && !waveInt.current) {
      waveInt.current = window.setInterval(() => {
        setState({ waveHeights: ref.current.waveHeights.map(() => 0.18 + Math.random() * 0.82) });
      }, 90);
    } else if (!active && waveInt.current) {
      clearInterval(waveInt.current);
      waveInt.current = undefined;
      setState({ waveHeights: ref.current.waveHeights.map(() => 0.16) });
    }
  }, [setState]);

  const setSpeaking = useCallback((on: boolean) => {
    setState({ speakingNow: on });
    // syncWave reads ref which updates next tick; schedule microtask
    window.setTimeout(syncWave, 0);
  }, [setState, syncWave]);

  const speakRaw = useCallback((text: string, onDone?: () => void) => {
    provider.voice.speak(text, {
      lang: ref.current.lang,
      onStart: () => setSpeaking(true),
      onEnd: () => { setSpeaking(false); onDone?.(); },
    });
  }, [provider, setSpeaking]);

  /* ── Jarvis chat (through the provider boundary) ──────────────── */
  const askJarvis = useCallback(async () => {
    let reply: string;
    try {
      const st = ref.current;
      const msgs = st.jarvisMsgs;
      let start = msgs.findIndex((m) => m.role === "user");
      if (start < 0) start = msgs.length;
      const messages: JarvisMessage[] = msgs.slice(start).map((m) => ({ role: m.role, content: m.text }));
      const context = buildContext();
      const res = await provider.chat.complete({
        system: "", // built by the provider from context for remote; ignored by mock
        messages,
        context,
        maxTokens: 400,
      });
      reply = String(res.text || "").trim();
      if (!reply) throw new Error("empty");
      // Structured commands (if any) are gated by clinician confirmation
      // elsewhere; the mock never returns commands.
    } catch {
      reply = L(ref.current.lang).jarvisOffline;
    }
    setState((s) => ({ jarvisMsgs: s.jarvisMsgs.concat([{ role: "assistant", text: reply }]), jarvisBusy: false }));
    const st = ref.current;
    if (st.osPhase !== "done" ? st.bootVoiceOn : st.voiceOn) speakRaw(reply);
  }, [provider, buildContext, setState, speakRaw]);

  const sendJarvis = useCallback((preset?: string) => {
    const st = ref.current;
    const text = (typeof preset === "string" ? preset : st.jarvisInput).trim();
    if (!text || st.jarvisBusy) return;
    setState((s) => ({ jarvisMsgs: s.jarvisMsgs.concat([{ role: "user", text }]), jarvisInput: "", jarvisBusy: true }));
    _t(() => { void askJarvis(); }, 30);
  }, [setState, _t, askJarvis]);

  const seedGreeting = useCallback(() => {
    if (ref.current.jarvisMsgs.length) return;
    const text = provider.greeting(buildContext());
    setState((s) => ({ jarvisMsgs: s.jarvisMsgs.concat([{ role: "assistant", text }]), jarvisUnread: !s.jarvisMounted }));
  }, [provider, buildContext, setState]);

  /* ── boot sequence (JARVIS OS) ────────────────────────────────── */
  const bootEnabled = props.showIntro !== false && !props.reducedMotion;

  const toChat = useCallback(() => {
    if (ref.current.osPhase !== "hud") return;
    const isAr = ref.current.lang === "ar";
    const line = isAr ? "إذا تحبين أراجع أول حالة قبل ما تدخل، أنا جاهز." : "If you'd like, I can review the first case before they come in.";
    setState((s) => ({ osPhase: "chat", jarvisMsgs: s.jarvisMsgs.concat([{ role: "assistant", text: line }]) }));
    if (ref.current.bootVoiceOn) speakRaw(line);
  }, [setState, speakRaw]);

  const toHud = useCallback(() => {
    if (ref.current.osPhase !== "core") return;
    setState({ osPhase: "hud", bootCaptionOn: false });
    [1, 2, 3, 4, 5].forEach((i) =>
      _t(() => { if (ref.current.osPhase === "hud") setState({ hudStep: i }); }, 350 + (i - 1) * 620));
    _t(() => toChat(), 350 + 4 * 620 + 1100);
  }, [setState, _t, toChat]);

  const speakSeq = useCallback((text: string, cb: () => void) => {
    let fired = false;
    const fire = () => { if (!fired) { fired = true; cb(); } };
    if (ref.current.bootVoiceOn) speakRaw(text, fire);
    _t(fire, Math.max(5600, text.length * 100));
  }, [speakRaw, _t]);

  const runOS = useCallback(() => {
    _t(() => {
      if (ref.current.osPhase !== "core") return;
      const isAr = ref.current.lang === "ar";
      const morning = new Date().getHours() < 12;
      const g = isAr
        ? "السلام عليكم دكتورة، " + (morning ? "صباح الخير" : "مساء الخير") + ". جاهز نبدأ يومنا — عندك اليوم خمس جلسات، وأول مريض بعد خمس عشرة دقيقة تقريباً."
        : "Peace be upon you, Doctor. " + (morning ? "Good morning" : "Good evening") + ". Ready to start the day — you have five sessions today, first patient in about fifteen minutes.";
      setState({ bootCaption: g, bootCaptionOn: true });
      speakSeq(g, () => toHud());
    }, 2600);
  }, [_t, setState, speakSeq, toHud]);

  const minimizeOS = useCallback(() => {
    if (ref.current.osPhase === "out" || ref.current.osPhase === "done") return;
    provider.voice.cancelSpeech();
    recStop.current?.();
    setSpeaking(false);
    setState({ osPhase: "out", bootCaptionOn: false });
    _t(() => setState({ osPhase: "done", jarvisMounted: true, jarvisClosing: false, jarvisUnread: false }), 850);
  }, [provider, setSpeaking, setState, _t]);

  const launchOS = useCallback(() => {
    provider.voice.cancelSpeech();
    setState({ osPhase: "chat", hudStep: 5, jarvisMounted: false, jarvisClosing: false, jarvisUnread: false, bootCaptionOn: false });
  }, [provider, setState]);

  const toggleBootVoice = useCallback(() => {
    const on = !ref.current.bootVoiceOn;
    if (!on) { provider.voice.cancelSpeech(); setSpeaking(false); }
    setState({ bootVoiceOn: on });
  }, [provider, setSpeaking, setState]);

  /* ── mount lifecycle ──────────────────────────────────────────── */
  const settle = useCallback((ms: number) => {
    _t(() => {
      setState({ viewLoading: false });
      if (ref.current.view === "dashboard") animKpis();
    }, ms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_t, setState]);

  const animKpis = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const t0 = performance.now(), dur = 950;
    const loop = (now: number) => {
      const tt = Math.min((now - t0) / dur, 1);
      setState({ kpiT: easeOutCubic(tt) });
      if (tt < 1) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [setState]);

  const animRing = useCallback(() => {
    if (raf2.current) cancelAnimationFrame(raf2.current);
    const t0 = performance.now(), dur = 1100;
    const loop = (now: number) => {
      const tt = Math.min((now - t0) / dur, 1);
      setState({ ringT: easeOutCubic(tt) });
      if (tt < 1) raf2.current = requestAnimationFrame(loop);
    };
    raf2.current = requestAnimationFrame(loop);
  }, [setState]);

  useEffect(() => {
    settle(650);
    _t(() => seedGreeting(), 1000);
    srOk.current = provider.voice.recognitionSupported();
    if (typeof speechSynthesis !== "undefined") { try { speechSynthesis.getVoices(); } catch { /* noop */ } }
    if (bootEnabled) runOS();
    else setState({ osPhase: "done" });
    return () => {
      timers.current.forEach(clearTimeout);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (raf2.current) cancelAnimationFrame(raf2.current);
      if (waveInt.current) clearInterval(waveInt.current);
      recStop.current?.();
      provider.voice.cancelSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat on new messages (v3 componentDidUpdate).
  useEffect(() => {
    const el = msgsRef.current;
    if (el) {
      const stamp = state.jarvisMsgs.length + (state.jarvisBusy ? 1 : 0);
      if (stamp !== msgStamp.current) { msgStamp.current = stamp; el.scrollTop = el.scrollHeight; }
    }
  });

  /* ── actions ──────────────────────────────────────────────────── */
  const go = useCallback((view: NavKey) => {
    if (view === ref.current.view && !ref.current.viewLoading) return;
    setState({ view, viewLoading: true, kpiT: 0 });
    settle(430);
  }, [setState, settle]);

  const toggleLang = useCallback(() => setState((s) => ({ lang: s.lang === "ar" ? "en" : "ar" })), [setState]);

  const openModal = useCallback((type: ModalType, extra?: Partial<AppState>) =>
    setState({ modal: { type, closing: false }, ...(extra || {}) }), [setState]);
  const swapModal = openModal;
  const closeModal = useCallback(() => {
    const m = ref.current.modal;
    if (!m || m.closing) return;
    setState((s) => ({ modal: s.modal ? { ...s.modal, closing: true } : null }));
    _t(() => setState({ modal: null, assess: null, reportRec: null }), 260);
  }, [setState, _t]);

  const openProfile = useCallback((id: number) => openModal("profile", { profileId: id }), [openModal]);
  const openAddPatient = useCallback(() =>
    openModal("add", { form: { name: "", age: "", gender: "male", diag: "", dxKey: "lower_back", total: "12" } }), [openModal]);
  const setFormField = useCallback((key: keyof AppState["form"], val: string) =>
    setState((s) => ({ form: { ...s.form, [key]: val } })), [setState]);
  const savePatient = useCallback(() => {
    const f = ref.current.form;
    if (!f.name || !f.name.trim()) return;
    const total = parseInt(f.total, 10) || 12;
    const p: Patient = {
      id: ref.current.uid, name: f.name.trim(), age: f.age, gender: f.gender,
      diag: f.diag.trim() || "General Assessment", dxKey: f.dxKey, done: 0, total,
      apptDay: "—", apptDayAr: "—", apptTime: "—", apptTimeAr: "—", recovery: 0, invoice: "pending", history: [],
      metrics: { romSeries: [], pain: [], hep: 100, missed: 0, flags: [] },
    };
    setState((s) => ({ patients: [p].concat(s.patients), uid: s.uid + 1 }));
    closeModal();
  }, [setState, closeModal]);

  const startAssessment = useCallback(() => swapModal("pick"), [swapModal]);
  const pickDx = useCallback((key: DxKey) => {
    const data = CLINICAL_DATA[key];
    const rom: Record<string, number> = {}, mmt: Record<string, number> = {};
    data.joints.forEach((j, ji) => j.motions.forEach((_m, mi) => { rom[ji + "-" + mi] = 0; }));
    data.muscles.forEach((_m, i) => { mmt[i] = 5; });
    swapModal("assess", { assess: { dxKey: key, rom, mmt } });
  }, [swapModal]);
  const setRom = useCallback((id: string, val: string) =>
    setState((s) => (s.assess ? { assess: { ...s.assess, rom: { ...s.assess.rom, [id]: +val } } } : {})), [setState]);
  const setMmt = useCallback((i: number, val: number) =>
    setState((s) => (s.assess ? { assess: { ...s.assess, mmt: { ...s.assess.mmt, [i]: val } } } : {})), [setState]);

  const finishAssessment = useCallback(() => {
    const st = ref.current;
    if (!st.assess) return;
    const data = CLINICAL_DATA[st.assess.dxKey];
    let sum = 0, n = 0;
    data.joints.forEach((j, ji) => j.motions.forEach((m, mi) => {
      const val = st.assess!.rom[ji + "-" + mi] || 0;
      sum += m.normal > 0 ? Math.min((val / m.normal) * 100, 100) : 100;
      n++;
    }));
    const romPct = Math.round(sum / n);
    const mv = Object.values(st.assess.mmt);
    const mmtAvg = (mv.reduce((a, b) => a + b, 0) / mv.length).toFixed(1);
    const rec: AssessmentRecord = {
      dxKey: st.assess.dxKey,
      date: new Date().toLocaleDateString(st.lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }),
      romPct, mmtAvg, rom: { ...st.assess.rom }, mmt: { ...st.assess.mmt },
    };
    const newPatients = st.patients.map((p) => (p.id !== st.profileId ? p : { ...p, history: [rec].concat(p.history), done: Math.min(p.total, p.done + 1) }));
    setState({ patients: newPatients, reportRec: rec, ringT: 0 });
    swapModal("report");
    animRing();
  }, [setState, swapModal, animRing]);
  const viewReport = useCallback((rec: AssessmentRecord) => {
    setState({ reportRec: rec, ringT: 0 });
    swapModal("report");
    animRing();
  }, [setState, swapModal, animRing]);

  const setInsightStatus = useCallback((key: string, status: "accepted" | "done" | "dismissed") =>
    setState((s) => ({ insightStatus: { ...s.insightStatus, [key]: { ...s.insightStatus[key], status } } })), [setState]);
  const setInsightNote = useCallback((key: string, note: string) =>
    setState((s) => ({ insightStatus: { ...s.insightStatus, [key]: { ...s.insightStatus[key], note } } })), [setState]);
  const hideRule = useCallback((ruleId: string) =>
    setState((s) => ({ hiddenRules: { ...s.hiddenRules, [ruleId]: true } })), [setState]);
  const toggleInsight = useCallback((key: string) =>
    setState((s) => ({ expandedInsight: s.expandedInsight === key ? null : key })), [setState]);

  const toggleJarvis = useCallback(() => {
    const st = ref.current;
    if (st.jarvisMounted && !st.jarvisClosing) {
      setState({ jarvisClosing: true });
      _t(() => setState({ jarvisMounted: false, jarvisClosing: false }), 240);
    } else if (!st.jarvisMounted) {
      setState({ jarvisMounted: true, jarvisClosing: false, jarvisUnread: false });
    }
  }, [setState, _t]);

  const toggleVoice = useCallback(() => {
    const on = !ref.current.voiceOn;
    if (!on) provider.voice.cancelSpeech();
    setState({ voiceOn: on });
  }, [provider, setState]);

  const toggleListening = useCallback(() => {
    if (ref.current.listening) { recStop.current?.(); return; }
    if (!provider.voice.recognitionSupported()) return;
    provider.voice.cancelSpeech();
    setSpeaking(false);
    const handle = provider.voice.startListening({
      lang: ref.current.lang,
      onResult: (txt) => { if (txt) sendJarvis(txt); },
      onEnd: () => { setState({ listening: false }); window.setTimeout(syncWave, 0); },
      onError: () => { setState({ listening: false }); window.setTimeout(syncWave, 0); },
    });
    recStop.current = handle.stop;
    setState({ listening: true });
    window.setTimeout(syncWave, 0);
  }, [provider, setSpeaking, sendJarvis, setState, syncWave]);

  const setSearch = useCallback((v: string) => setState({ searchQ: v }), [setState]);
  const setJarvisInput = useCallback((v: string) => setState({ jarvisInput: v }), [setState]);

  const actions = useMemo(() => ({
    go, toggleLang, openProfile, openAddPatient, setFormField, savePatient,
    startAssessment, pickDx, setRom, setMmt, finishAssessment, viewReport,
    closeModal, setInsightStatus, setInsightNote, hideRule, toggleInsight,
    setSearch,
  }), [go, toggleLang, openProfile, openAddPatient, setFormField, savePatient,
    startAssessment, pickDx, setRom, setMmt, finishAssessment, viewReport,
    closeModal, setInsightStatus, setInsightNote, hideRule, toggleInsight, setSearch]);

  const jarvis = useMemo(() => ({
    send: sendJarvis, setInput: setJarvisInput, toggle: toggleJarvis, toggleVoice,
    mic: toggleListening, expand: launchOS, msgsRef,
    minimizeOS, launchOS, toggleBootVoice,
    srOk: () => srOk.current,
  }), [sendJarvis, setJarvisInput, toggleJarvis, toggleVoice, toggleListening, launchOS, minimizeOS, toggleBootVoice]);

  return { state, t, actions, jarvis, activeInsights, reducedMotion: !!props.reducedMotion };
}

export type AppApi = ReturnType<typeof useApp>;
