/**
 * CDSS — Clinical Decision Support engine.
 *
 * Ported verbatim from PhysioTrack v3. Pure functions over the patient
 * record; every rule returns either null or an insight card. Rules never
 * diagnose and never override the therapist — they suggest, with reasoning
 * and a confidence level. This is the host app's existing deterministic
 * decision-support layer (NOT the external Jarvis AI): it runs entirely on
 * the local record and ships as part of the preserved v3 experience. A real
 * Jarvis service can later augment or supersede these suggestions through
 * the Jarvis integration boundary without changing this module's contract.
 */
import type { Lang } from "../i18n/strings";
import type { DxKey } from "../data/registries";
import type { Patient } from "../data/seed";

export type Severity = "red" | "orange" | "yellow" | "blue" | "green";

export const SEV_META: Record<Severity, { color: string; labelKey: string }> = {
  red:    { color: "oklch(0.66 0.13 25)",  labelKey: "sevRed" },
  orange: { color: "oklch(0.72 0.11 55)",  labelKey: "sevOrange" },
  yellow: { color: "oklch(0.79 0.09 95)",  labelKey: "sevYellow" },
  blue:   { color: "var(--color-accent)",  labelKey: "sevBlue" },
  green:  { color: "oklch(0.74 0.10 155)", labelKey: "sevGreen" },
};
export const SEV_ORDER: Severity[] = ["red", "orange", "yellow", "blue", "green"];

const SPECIAL_TESTS: Record<DxKey, string[]> = {
  shoulder: ["Neer", "Hawkins-Kennedy", "Empty Can", "Drop Arm", "External Rotation Lag", "Speed's Test", "Yergason's Test"],
  knee: ["Lachman", "Anterior Drawer", "Posterior Drawer", "McMurray", "Thessaly", "Valgus Stress", "Varus Stress", "Effusion / girth measurement"],
  lower_back: ["SLR", "Slump Test", "Repeated Movement Testing", "Prone Instability Test"],
  brain: ["Myotomes", "Dermatomes", "Reflexes", "Coordination", "Berg Balance re-test", "10m Walk Test"],
};
const DIFFERENTIALS: Record<DxKey, string[]> = {
  shoulder: ["Rotator cuff re-tear", "Frozen shoulder", "Cervical radiculopathy", "Labral pathology", "Biceps tendinopathy"],
  knee: ["Arthrofibrosis", "Persistent effusion", "Patellofemoral dysfunction", "CRPS", "Low-grade infection (refer)"],
  lower_back: ["Lumbar stenosis", "Radiculopathy", "SIJ dysfunction", "Hip OA referral pattern", "Peripheral neuropathy"],
  brain: ["Medication timing effect", "Orthostatic hypotension", "Depression / apathy", "New vascular event (refer)"],
};
const PROGRESSIONS: Record<DxKey, string[]> = {
  shoulder: ["Rotator cuff loading progression", "Functional reaching patterns", "Closed-chain scapular work", "Sport-specific throwing prep"],
  knee: ["Single-leg squat", "Bulgarian split squat", "Single-leg RDL", "Hop training", "Agility ladder", "Perturbation training", "Running progression"],
  lower_back: ["Core endurance blocks", "Motor control drills", "Functional lifting", "Anti-rotation training", "Movement variability"],
  brain: ["Dynamic balance", "Dual-task gait", "Obstacle negotiation", "Weight shifting", "Upper-limb functional tasks", "Amplitude-based training"],
};
const RTS_TESTS = ["Hop test battery", "Y-Balance Test", "Strength symmetry (>90% LSI)", "Sport-specific drills under fatigue"];
const HISTORY_QUESTIONS = ["Pain location change", "Pain intensity change", "Recent trauma", "New symptoms", "Night pain", "Numbness / tingling", "Weakness", "Fever", "Weight loss", "Medication changes", "New imaging", "Falls", "Work / activity changes", "HEP compliance", "Sleep quality", "Psychological stress", "Fear avoidance"];
const REASSESS_ITEMS = ["Pain (NPRS)", "ROM", "MMT", "Functional outcome measures", "Gait", "Balance", "Swelling", "Special tests", "Posture", "Movement quality"];
const COMPLIANCE_STRATEGIES = ["Review exercise technique", "Simplify the program", "Improve education", "Address barriers", "Motivational interviewing"];
const DISCHARGE_ITEMS = ["Final reassessment", "Outcome measures", "Independent HEP", "Education", "Follow-up plan"];
const PLATEAU_STRATEGIES = ["Change exercise strategy", "Increase exercise variability", "Review diagnosis", "Reassess goals", "Review compliance"];

const RED_FLAG_LABELS: Record<string, { en: string; ar: string }> = {
  night_pain: { en: "Night pain", ar: "ألم ليلي" },
  weight_loss: { en: "Unexplained weight loss", ar: "فقدان وزن غير مبرر" },
  fever: { en: "Fever", ar: "حمّى" },
  neuro_deficit: { en: "Progressive neurological deficit", ar: "عجز عصبي متفاقم" },
};
const EXPECTED_RATE: Record<DxKey, number> = { brain: 5, knee: 8, shoulder: 8, lower_back: 9 };

export interface InsightGroup { key: string; items: string[] }
export interface Insight {
  title: string; why: string; findings: string[]; groups: InsightGroup[];
  ruleId: string; sev: Severity; confKey: string; patientId: number; patientName: string;
}
interface RuleCtx { isAr: boolean; series: number[]; delta: number; painDelta: number }

function romSeries(p: Patient): number[] {
  const hist = (p.history || []).slice().reverse().map((h) => h.romPct);
  return (p.metrics.romSeries || []).concat(hist);
}
function trendDelta(series: number[], n: number): number {
  if (series.length < 2) return 0;
  const window = series.slice(-Math.min(n, series.length));
  return window[window.length - 1] - window[0];
}

type Rule = {
  id: string; sev: Severity; conf: string;
  test(p: Patient, c: RuleCtx): Omit<Insight, "ruleId" | "sev" | "confKey" | "patientId" | "patientName"> | null;
};

const CDSS_RULES: Rule[] = [
  { id: "red_flag", sev: "red", conf: "confHigh",
    test(p, c) {
      const flags = p.metrics.flags || [];
      if (!flags.length) return null;
      const names = flags.map((f) => (RED_FLAG_LABELS[f] ? RED_FLAG_LABELS[f][c.isAr ? "ar" : "en"] : f));
      return {
        title: c.isAr ? "احتمال راية حمراء — يُنصح بمراجعة طبية عاجلة" : "Potential red flag — urgent medical review advised",
        why: c.isAr
          ? "سُجّلت مؤشرات (" + names.join("، ") + ") لا تُفسَّر بالحالة العضلية الهيكلية الحالية. هذا النمط يستدعي استبعاد أسباب جدية قبل الاستمرار في الخطة."
          : "Recorded indicators (" + names.join(", ") + ") are not explained by the current musculoskeletal presentation. This pattern warrants excluding serious pathology before continuing the plan.",
        findings: names.concat([(c.isAr ? "الالتزام بالبرنامج المنزلي " : "HEP adherence ") + p.metrics.hep + "%"]),
        groups: [{ key: "grpHistory", items: ["Fever", "Weight loss", "Night pain pattern", "New imaging", "Medication changes"] }],
      };
    } },
  { id: "regression", sev: "orange", conf: "confHigh",
    test(p, c) {
      if (c.delta >= -3 && c.painDelta <= 1) return null;
      if (c.delta >= 0) return null;
      return {
        title: c.isAr ? "مؤشرات تراجع في الحالة" : "Condition appears to be deteriorating",
        why: c.isAr
          ? "المدى الحركي انخفض " + Math.abs(c.delta) + " نقاط مع عدم تحسن الألم عبر الجلسات الأخيرة. يُنصح بإعادة تقييم فورية ومراجعة الخطة وخفض شدة التمارين."
          : "ROM dropped " + Math.abs(c.delta) + " points with no pain improvement across recent sessions. Immediate reassessment, plan review and reduced exercise intensity are advised.",
        findings: [(c.isAr ? "اتجاه المدى الحركي: " : "ROM trend: ") + c.series.slice(-3).join(" → ") + "%", (c.isAr ? "الألم NPRS: " : "Pain NPRS: ") + p.metrics.pain.join(" → ")],
        groups: [{ key: "grpReassess", items: REASSESS_ITEMS.slice(0, 6) }, { key: "grpDiff", items: DIFFERENTIALS[p.dxKey] || [] }],
      };
    } },
  { id: "plateau", sev: "yellow", conf: "confMod",
    test(p, c) {
      if (c.series.length < 3) return null;
      const last3 = c.series.slice(-3);
      if (Math.max.apply(null, last3) - Math.min.apply(null, last3) > 1) return null;
      return {
        title: c.isAr ? "ثبات في التقدّم (Plateau)" : "Progress plateau detected",
        why: c.isAr
          ? "المدى الحركي مستقر عند ~" + last3[2] + "% عبر آخر ثلاث قياسات دون تغيّر ذي دلالة. تغيير الاستراتيجية أو مراجعة الأهداف قد يعيد التقدّم."
          : "ROM has held at ~" + last3[2] + "% across the last three measurements with no meaningful change. A strategy change or goal review may restart progress.",
        findings: [(c.isAr ? "آخر ثلاث قياسات: " : "Last three measurements: ") + last3.join(" → ") + "%"],
        groups: [{ key: "grpStrategy", items: PLATEAU_STRATEGIES }, { key: "grpProgress", items: (PROGRESSIONS[p.dxKey] || []).slice(0, 3) }],
      };
    } },
  { id: "slow_progress", sev: "yellow", conf: "confMod",
    test(p, c) {
      const expected = EXPECTED_RATE[p.dxKey] || 8;
      if (c.delta <= 0 || c.delta >= expected * 0.5) return null;
      return {
        title: c.isAr ? "التقدّم أبطأ من المتوقع — يُقترح إعادة تقييم شاملة" : "Progress slower than expected — consider comprehensive reassessment",
        why: c.isAr
          ? "التحسن " + c.delta + " نقاط عبر آخر ثلاث جلسات، بينما المتوقع لهذه المرحلة من " + p.diag + " نحو " + expected + " نقاط. قبل مواصلة الخطة الحالية، يُنصح بإعادة تقييم شاملة وتحديث التاريخ المرضي."
          : "Improvement is " + c.delta + " points over the last three sessions versus ~" + expected + " expected for this stage of " + p.diag + ". Before continuing the current plan, a comprehensive reassessment and history update are advised.",
        findings: [(c.isAr ? "اتجاه المدى الحركي: " : "ROM trend: ") + c.series.slice(-3).join(" → ") + "%", (c.isAr ? "الألم NPRS: " : "Pain NPRS: ") + p.metrics.pain.join(" → "), (c.isAr ? "مواعيد فائتة: " : "Missed appointments: ") + p.metrics.missed],
        groups: [
          { key: "grpReassess", items: REASSESS_ITEMS },
          { key: "grpHistory", items: HISTORY_QUESTIONS.slice(0, 10) },
          { key: "grpTests", items: SPECIAL_TESTS[p.dxKey] || [] },
          { key: "grpDiff", items: DIFFERENTIALS[p.dxKey] || [] },
        ],
      };
    } },
  { id: "compliance", sev: "orange", conf: "confHigh",
    test(p, c) {
      if ((p.metrics.hep || 100) >= 60) return null;
      return {
        title: c.isAr ? "التزام منخفض بالبرنامج المنزلي" : "Low home-exercise adherence",
        why: c.isAr
          ? "الالتزام المسجّل " + p.metrics.hep + "% مع " + p.metrics.missed + " مواعيد فائتة. معالجة العوائق وتبسيط البرنامج غالباً أجدى من تعديل التمارين نفسها."
          : "Recorded adherence is " + p.metrics.hep + "% with " + p.metrics.missed + " missed appointments. Addressing barriers and simplifying the program usually beats changing the exercises themselves.",
        findings: [(c.isAr ? "الالتزام: " : "Adherence: ") + p.metrics.hep + "%", (c.isAr ? "مواعيد فائتة: " : "Missed appointments: ") + p.metrics.missed],
        groups: [{ key: "grpCompliance", items: COMPLIANCE_STRATEGIES }],
      };
    } },
  { id: "progression", sev: "green", conf: "confHigh",
    test(p, c) {
      const expected = EXPECTED_RATE[p.dxKey] || 8;
      if (c.delta < expected * 0.5) return null;
      const rapid = c.delta >= expected * 1.5;
      return {
        title: c.isAr ? (rapid ? "تحسّن سريع — جاهز للتدرّج" : "تقدّم مُرضٍ — يُقترح تدرّج العلاج") : (rapid ? "Rapid improvement — ready to progress" : "Satisfactory progression — consider advancing the plan"),
        why: c.isAr
          ? "المدى الحركي تحسّن " + c.delta + " نقاط عبر آخر ثلاث قياسات مع انخفاض الألم من " + p.metrics.pain[0] + " إلى " + p.metrics.pain[p.metrics.pain.length - 1] + ". النمط يدعم زيادة الحمل والتعقيد الوظيفي — التدرّج أدناه خاص بتشخيص " + p.diag + "."
          : "ROM improved " + c.delta + " points across the last three measurements while pain fell from " + p.metrics.pain[0] + " to " + p.metrics.pain[p.metrics.pain.length - 1] + ". The pattern supports increased load and functional demand — the progression below is specific to " + p.diag + ".",
        findings: [(c.isAr ? "اتجاه المدى الحركي: " : "ROM trend: ") + c.series.slice(-3).join(" → ") + "%", (c.isAr ? "الألم NPRS: " : "Pain NPRS: ") + p.metrics.pain.join(" → "), (c.isAr ? "الالتزام: " : "Adherence: ") + p.metrics.hep + "%"],
        groups: [{ key: "grpProgress", items: PROGRESSIONS[p.dxKey] || [] }],
      };
    } },
  { id: "rts", sev: "blue", conf: "confMod",
    test(p, c) {
      if (p.dxKey !== "knee" && p.dxKey !== "shoulder") return null;
      const expected = EXPECTED_RATE[p.dxKey] || 8;
      if (c.delta < expected * 0.5 || (p.age && Number(p.age) > 50)) return null;
      return {
        title: c.isAr ? "قبل العودة للرياضة — اختبارات موضوعية" : "Before return to sport — objective testing",
        why: c.isAr
          ? "مع استمرار هذا المعدل من التحسن، يُنصح بإتمام اختبارات موضوعية قبل أي سماح بالعودة للنشاط الرياضي بدلاً من الاعتماد على الزمن وحده."
          : "At this rate of improvement, complete objective testing before any return-to-sport clearance rather than relying on time alone.",
        findings: [(c.isAr ? "العمر: " : "Age: ") + p.age, (c.isAr ? "المنطقة: " : "Region: ") + p.dxKey],
        groups: [{ key: "grpRts", items: RTS_TESTS }],
      };
    } },
  { id: "discharge", sev: "blue", conf: "confMod",
    test(p, c) {
      const last = c.series[c.series.length - 1] || 0;
      if (p.done / p.total < 0.85 || last < 85) return null;
      return {
        title: c.isAr ? "قد يكون مناسباً للخروج من البرنامج" : "May be appropriate for discharge",
        why: c.isAr
          ? "اكتملت " + p.done + " من " + p.total + " جلسة والمدى الحركي عند " + last + "%. إن تحققت الأهداف الوظيفية، جهّز خطة الخروج أدناه."
          : p.done + " of " + p.total + " sessions are complete and ROM sits at " + last + "%. If functional goals are met, prepare the discharge plan below.",
        findings: [(c.isAr ? "الجلسات: " : "Sessions: ") + p.done + "/" + p.total, "ROM " + last + "%"],
        groups: [{ key: "grpDischarge", items: DISCHARGE_ITEMS }],
      };
    } },
];

export function cdssForPatient(p: Patient, lang: Lang): Insight[] {
  if (!p.metrics) return [];
  const isAr = lang === "ar";
  const series = romSeries(p);
  const pain = p.metrics.pain || [];
  const ctx: RuleCtx = {
    isAr, series,
    delta: trendDelta(series, 3),
    painDelta: pain.length > 1 ? pain[pain.length - 1] - pain[0] : 0,
  };
  let out: Insight[] = [];
  CDSS_RULES.forEach((rule) => {
    const hit = rule.test(p, ctx);
    if (hit) out.push(Object.assign({ ruleId: rule.id, sev: rule.sev, confKey: rule.conf, patientId: p.id, patientName: p.name }, hit));
  });
  if (out.some((i) => i.ruleId === "plateau")) out = out.filter((i) => i.ruleId !== "slow_progress");
  if (out.some((i) => i.ruleId === "red_flag" || i.ruleId === "regression"))
    out = out.filter((i) => !["progression", "rts", "discharge"].includes(i.ruleId));
  return out.sort((a, b) => SEV_ORDER.indexOf(a.sev) - SEV_ORDER.indexOf(b.sev)).slice(0, 3);
}
