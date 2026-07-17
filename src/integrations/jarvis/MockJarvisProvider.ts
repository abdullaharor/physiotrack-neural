/**
 * MockJarvisProvider — the default provider used for preview and testing.
 *
 * It is NOT Jarvis intelligence. It contains no clinical reasoning model and
 * no exercise algorithms — only deterministic, context-grounded canned
 * replies so the preserved v3 chat UI is fully interactive before the real
 * external Jarvis (Codex) is connected. Swapping it out is one line:
 *
 *     setJarvisProvider(new RemoteJarvisProvider({ endpoint }))
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
import { BrowserVoiceAdapter, NullVoiceAdapter } from "./voice/BrowserVoiceAdapter";

function firstByTime(ctx: ClinicContext) {
  const parse = (appt: string) => {
    const m = /(\d+):(\d+)\s*(AM|PM)/.exec(appt);
    if (!m) return 99;
    let h = +m[1] % 12;
    if (m[3] === "PM") h += 12;
    return h + +m[2] / 60;
  };
  return ctx.patients.slice().sort((a, b) => parse(a.appointment) - parse(b.appointment))[0];
}
function mostBehind(ctx: ClinicContext) {
  return ctx.patients.slice().sort((a, b) => a.sessionsDone - b.sessionsDone)[0];
}

class MockChatAdapter implements JarvisChatAdapter {
  readonly id = "mock-chat";

  async complete(req: JarvisChatRequest): Promise<JarvisChatResponse> {
    // Small, realistic "thinking" latency for the typing indicator.
    await new Promise((r) => setTimeout(r, 620));
    const ctx = req.context;
    const isAr = ctx.lang === "ar";
    const last = [...req.messages].reverse().find((m) => m.role === "user");
    const q = (last?.content || "").toLowerCase();

    const has = (...terms: string[]) => terms.some((t) => q.includes(t.toLowerCase()));

    // Today's schedule
    if (has("schedule", "جدول", "مواعيد", "اليوم", "today")) {
      const f = firstByTime(ctx);
      return {
        text: isAr
          ? `عندك اليوم ${ctx.todaySessions} جلسات. أول مريض ${f.name} — ${f.appointment}. أنبّهك قبل كل موعد بوقت كافٍ.`
          : `You have ${ctx.todaySessions} sessions today. First up is ${f.name} at ${f.appointment}. I'll remind you before each one.`,
      };
    }
    // Reassessment
    if (has("reassess", "إعادة تقييم", "تقييم", "who needs")) {
      const b = mostBehind(ctx);
      const insight = ctx.cdssActiveInsights.find((i) => i.severity === "yellow" || i.severity === "orange");
      return {
        text: isAr
          ? `${b.name} هو الأولى بإعادة التقييم اليوم (${b.sessionsDone}/${b.sessionsTotal} جلسة).${insight ? " ولاحظ لوحة الرؤى: " + insight.insight + "." : ""} القرار النهائي يبقى لكِ.`
          : `${b.name} is the priority for reassessment today (${b.sessionsDone}/${b.sessionsTotal} sessions).${insight ? " Also see the insights panel: " + insight.insight + "." : ""} The final call stays with you.`,
      };
    }
    // Pending invoices
    if (has("invoice", "فواتير", "فاتورة", "payment", "سداد")) {
      const list = ctx.pendingInvoices;
      return {
        text: isAr
          ? list.length
            ? `فيه ${list.length} فواتير معلّقة: ${list.join("، ")}.`
            : "ما فيه فواتير معلّقة حالياً — كلها مسدّدة."
          : list.length
            ? `${list.length} invoices are pending: ${list.join(", ")}.`
            : "No pending invoices right now — all settled.",
      };
    }
    // Summarize the open patient
    if (has("summar", "ملخص", "حالة المريض", "patient")) {
      const p = ctx.openPatient ? ctx.patients.find((x) => x.name === ctx.openPatient) : null;
      if (p) {
        const flag = ctx.cdssActiveInsights.find((i) => i.patient === p.name);
        return {
          text: isAr
            ? `${p.name}، ${p.diagnosis}. أكمل ${p.sessionsDone} من ${p.sessionsTotal} جلسة، والتعافي ~${p.recoveryPct}%.${flag ? " ملاحظة سريرية: " + flag.insight + "." : ""}`
            : `${p.name}, ${p.diagnosis}. ${p.sessionsDone} of ${p.sessionsTotal} sessions done, recovery ~${p.recoveryPct}%.${flag ? " Clinical note: " + flag.insight + "." : ""}`,
        };
      }
      return {
        text: isAr
          ? "افتحي ملف المريض من قائمة المرضى وأقدر ألخّص حالته وتقدّمه."
          : "Open a patient's profile from the Patients list and I'll summarize their case and progress.",
      };
    }
    // Red-flag awareness
    const red = ctx.cdssActiveInsights.find((i) => i.severity === "red");
    if (red && has("flag", "راية", "خطر", "urgent", "عاجل")) {
      return {
        text: isAr
          ? `انتبهي: ${red.insight} — ${red.patient}. راجعي لوحة الرؤى السريرية.`
          : `Heads up: ${red.insight} — ${red.patient}. Please review the Clinical Insights panel.`,
      };
    }

    // Generic grounded fallback (mock — not a reasoning model)
    return {
      text: isAr
        ? "أنا نسخة تجريبية (Mock) من جارفس داخل هذا العرض — أقدر أساعدك بجدول اليوم، من يحتاج إعادة تقييم، والفواتير المعلّقة. عند ربط جارفس الحقيقي من Codex ستصلك إجابات سريرية كاملة."
        : "I'm the mock Jarvis in this preview — I can help with today's schedule, who needs reassessment, and pending invoices. Once the real Jarvis from Codex is connected, you'll get full clinical answers.",
    };
  }
}

export interface MockJarvisOptions {
  /** Force a voice adapter; defaults to browser Web Speech (or null fallback). */
  voice?: JarvisVoiceAdapter;
}

export class MockJarvisProvider implements JarvisProvider {
  readonly id = "mock";
  readonly chat: JarvisChatAdapter;
  readonly voice: JarvisVoiceAdapter;

  constructor(opts: MockJarvisOptions = {}) {
    this.chat = new MockChatAdapter();
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
      mock: true,
    };
  }

  greeting(ctx: ClinicContext): string {
    const isAr = ctx.lang === "ar";
    const first = firstByTime(ctx);
    const behind = mostBehind(ctx);
    const morning = new Date().getHours() < 12;
    const flagged = ctx.cdssActiveInsights.find((i) => i.severity === "red");
    const base = isAr
      ? `${morning ? "صباح الخير" : "مساء الخير"} دكتورة سلمى، عندك اليوم ${ctx.todaySessions} جلسات. أول مريض ${first.name} الساعة ${first.appointment}، وفيه مريض يحتاج إعادة تقييم اليوم: ${behind.name}.`
      : `${morning ? "Good morning" : "Good evening"} Dr. Salma — you have ${ctx.todaySessions} sessions today. First patient is ${first.name} at ${first.appointment}, and one patient needs reassessment today: ${behind.name}.`;
    const flag = flagged
      ? isAr
        ? ` وانتبهي: فيه راية حمراء محتملة على ${flagged.patient} — راجعي لوحة الرؤى السريرية.`
        : ` Also note: a potential red flag on ${flagged.patient} — see the Clinical Insights panel.`
      : "";
    return base + flag;
  }
}
