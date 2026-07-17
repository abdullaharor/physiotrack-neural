/**
 * BrowserVoiceAdapter — JarvisVoiceAdapter backed by the browser Web Speech
 * API (speechSynthesis for voice out, SpeechRecognition for voice in).
 *
 * Voice is a transport concern, kept separate from the chat/reasoning
 * channel so a real Jarvis provider can pair its own streaming TTS/STT while
 * reusing this in preview. Ported from v3's `_speakRaw` / `toggleListening`.
 */
import type { JarvisVoiceAdapter, Lang } from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyWin = typeof window & {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
};

export class BrowserVoiceAdapter implements JarvisVoiceAdapter {
  readonly id = "browser-webspeech";
  private rec: any = null;

  recognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    const w = window as AnyWin;
    return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
  }

  synthesisSupported(): boolean {
    return typeof speechSynthesis !== "undefined";
  }

  speak(text: string, opts: { lang: Lang; onStart?: () => void; onEnd?: () => void }): void {
    if (!this.synthesisSupported()) { opts.onEnd?.(); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const want = opts.lang === "ar" ? "ar" : "en";
      const voices = speechSynthesis.getVoices() || [];
      const v =
        voices.find((x) => x.lang && x.lang.toLowerCase().replace("_", "-") === (want === "ar" ? "ar-sa" : "en-us")) ||
        voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(want));
      if (v) u.voice = v;
      u.lang = v ? v.lang : want === "ar" ? "ar-SA" : "en-US";
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => opts.onStart?.();
      u.onend = () => opts.onEnd?.();
      u.onerror = () => opts.onEnd?.();
      speechSynthesis.speak(u);
    } catch {
      opts.onEnd?.();
    }
  }

  cancelSpeech(): void {
    try { speechSynthesis.cancel(); } catch { /* noop */ }
  }

  startListening(opts: {
    lang: Lang;
    onResult: (transcript: string) => void;
    onEnd?: () => void;
    onError?: () => void;
  }): { stop: () => void } {
    const w = window as AnyWin;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { opts.onError?.(); return { stop: () => {} }; }
    try {
      this.cancelSpeech();
      const r = new SR();
      r.lang = opts.lang === "ar" ? "ar-SA" : "en-US";
      r.interimResults = false;
      r.maxAlternatives = 1;
      r.onresult = (e: any) => {
        const txt = e.results?.[0]?.[0]?.transcript ?? "";
        if (txt) opts.onResult(txt);
      };
      r.onend = () => opts.onEnd?.();
      r.onerror = () => opts.onError?.();
      this.rec = r;
      r.start();
      return { stop: () => { try { r.stop(); } catch { /* noop */ } } };
    } catch {
      opts.onError?.();
      return { stop: () => {} };
    }
  }
}

/** Fallback voice adapter for environments with no Web Speech API. */
export class NullVoiceAdapter implements JarvisVoiceAdapter {
  readonly id = "null-voice";
  recognitionSupported(): boolean { return false; }
  synthesisSupported(): boolean { return false; }
  speak(_t: string, o: { onEnd?: () => void }): void { o.onEnd?.(); }
  cancelSpeech(): void { /* noop */ }
  startListening(o: { onError?: () => void }): { stop: () => void } { o.onError?.(); return { stop: () => {} }; }
}
