/**
 * RemoteJarvisProvider — the seam for connecting the REAL external Jarvis
 * (developed independently in Codex). It is intentionally a thin transport:
 * it forwards the system framing, messages and clinic context to a configured
 * HTTP endpoint and returns the reply + any structured commands.
 *
 * It is NOT wired to any live service by default and contains NO API keys.
 * Connecting the real Jarvis is a single configuration/DI change:
 *
 *     setJarvisProvider(new RemoteJarvisProvider({ endpoint: JARVIS_API_URL }))
 *
 * Auth is passed by reference (a token the host injects at call time from a
 * secure source) — never hard-coded here.
 */
import type {
  ClinicContext,
  JarvisCapabilities,
  JarvisChatAdapter,
  JarvisChatRequest,
  JarvisChatResponse,
  JarvisProvider,
  JarvisVoiceAdapter,
} from "./types";
import { validateCommands } from "./commandSchema";
import { BrowserVoiceAdapter, NullVoiceAdapter } from "./voice/BrowserVoiceAdapter";

export interface RemoteJarvisOptions {
  /** Base URL of the external Jarvis service (e.g. process.env.JARVIS_API_URL). */
  endpoint: string;
  /** Optional async supplier of an auth token; the host owns the secret. */
  getAuthToken?: () => Promise<string> | string;
  /** Override the voice channel; defaults to browser Web Speech. */
  voice?: JarvisVoiceAdapter;
}

class RemoteChatAdapter implements JarvisChatAdapter {
  readonly id = "remote-chat";
  constructor(private readonly opts: RemoteJarvisOptions) {}

  async complete(req: JarvisChatRequest): Promise<JarvisChatResponse> {
    if (!this.opts.endpoint) throw new Error("RemoteJarvisProvider: no endpoint configured");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.opts.getAuthToken) {
      const token = await this.opts.getAuthToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const res = await fetch(this.opts.endpoint.replace(/\/$/, "") + "/chat", {
      method: "POST",
      headers,
      signal: req.signal,
      body: JSON.stringify({
        system: req.system,
        messages: req.messages,
        context: req.context,
        max_tokens: req.maxTokens ?? 400,
      }),
    });
    if (!res.ok) throw new Error(`Jarvis service error ${res.status}`);
    const data = (await res.json()) as { text?: string; commands?: unknown };
    return {
      text: String(data.text ?? "").trim(),
      commands: validateCommands(data.commands),
    };
  }
}

export class RemoteJarvisProvider implements JarvisProvider {
  readonly id = "remote";
  readonly chat: JarvisChatAdapter;
  readonly voice: JarvisVoiceAdapter;

  constructor(private readonly opts: RemoteJarvisOptions) {
    this.chat = new RemoteChatAdapter(opts);
    const browser = new BrowserVoiceAdapter();
    this.voice =
      opts.voice ??
      (browser.synthesisSupported() || browser.recognitionSupported() ? browser : new NullVoiceAdapter());
  }

  capabilities(): JarvisCapabilities {
    return {
      chat: true,
      voiceOut: this.voice.synthesisSupported(),
      voiceIn: this.voice.recognitionSupported(),
      mock: false,
    };
  }

  greeting(ctx: ClinicContext): string {
    // A real service may generate this; provide a safe grounded default.
    const isAr = ctx.lang === "ar";
    return isAr
      ? `${new Date().getHours() < 12 ? "صباح الخير" : "مساء الخير"} دكتورة سلمى، جاهز لبدء اليوم.`
      : `${new Date().getHours() < 12 ? "Good morning" : "Good evening"} Dr. Salma — ready to start the day.`;
  }
}
