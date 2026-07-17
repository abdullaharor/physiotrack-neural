# MIGRATION.md — من «PhysioTrack v3» (Claude Design) إلى مستودع مضيف

يشرح هذا المستند كيف أُعيد إنشاء صفحة Claude Design **`PhysioTrack v3`** كتطبيق مضيف
مستقل (React + Vite + TypeScript) مع حدود تكامل قابلة للاستبدال، مع الحفاظ على الواجهة
كما هي بالضبط. **لا ميزات جديدة، لا إعادة تصميم، لا دمج، لا تطبيق موازٍ.**

## 1) ما كان عليه المصدر

الأرشيف المُصدَّر يحتوي 5 صفحات `.dc.html` (صيغة dc-runtime: قوالب `<x-dc>` + منطق
`DCLogic`، تُحمّل React/Babel من CDN وقت التشغيل)، بالإضافة إلى مجلد أكواد مستقل
(`uploads/physiotrack-codebase_1/`). **الاختيار:** `PhysioTrack v3` هو مصدر الحقيقة
البصري — يحوي واجهة Jarvis الكاملة، CDSS، و7 شاشات. لم تُستخدم صفحة Neural، ولم يُدمج
تطبيق الأطلس المستقل.

> **تحقّق:** الأرشيف المرفوع حديثاً (17 يوليو) مطابق بايت-ببايت لأرشيف 15 يوليو — لا فرق
> في المحتوى؛ الاختلاف في بيانات الـ zip فقط.

## 2) استراتيجية إعادة الإنشاء (الأمانة البصرية)

dc-runtime يعبّر عن كل عنصر بسلسلة CSS مضمّنة + قوالب `{{}}` + `sc-for`/`sc-if` +
`style-hover`. بدل تحويل مئات السلاسل يدوياً (وخطر انحراف الشكل)، احتُفظ بسلاسل v3 كما هي
وتُحلَّل وقت التشغيل:

| مصدر dc-runtime | المقابل في المستودع |
|---|---|
| سلسلة CSS مضمّنة | `lib/sx.ts` — يحوّل سلسلة CSS → كائن style (يحفظ `var()`/`color-mix()`/المتغيّرات) |
| `style-hover` / `style-active` / `style-focus` | `lib/Box.tsx` — عنصر يدير hover/active/focus ويدمج السلاسل |
| `dangerouslySetInnerHTML` لأيقونات SVG | `lib/icons.ts` + `<Icon/>` (سجل ICONS منقول حرفياً) |
| `{{ }}` mustache | تعبيرات JSX |
| `sc-for` / `sc-if` | `.map()` / `&&` |
| `class Component extends DCLogic` | `app/useApp.tsx` (متحكّم React أمين للحالة والمنطق) |
| `_ds/nocturne-*/styles.css` | `src/styles/nocturne.css` — **نسخ حرفي** |
| `<style>` المضمّن (keyframes، scrollbar، range) | `src/styles/global.css` — منقول حرفياً |
| I18N · NAV · DEVICE · DX · CLINICAL · TEAM · ICONS · seed | `i18n/` · `data/` · `lib/icons` — منقولة حرفياً |
| CDSS rules + `cdssForPatient` | `cdss/engine.ts` — منقول حرفياً |

## 3) نقطة التحوّل الجوهرية: Jarvis خارجي

في v3، الدردشة كانت تنادي `window.claude.complete({system, messages})` — وهذا بالضبط هو
حدّ «Jarvis الخارجي». في المستودع أصبح:

```
useApp._askJarvis()  →  getJarvisProvider().chat.complete({ system, messages, context })
```

- **`contextBridge.ts`** يبني سياق العيادة (المكافئ لـ `_jarvisSystem` في v3) — قراءة فقط.
- **`MockJarvisProvider`** يعطي ردوداً تجريبية مبنية على السياق (بلا ذكاء سريري) لتشغيل
  المعاينة، ويحاكي تحية v3 (`_seedJarvisGreeting`).
- **`BrowserVoiceAdapter`** يغلّف Web Speech (نطق `_speakRaw` + استماع `toggleListening`).
- **`RemoteJarvisProvider`** فيشة الربط الحقيقي — سطر إعداد واحد لاحقاً.
- **بوابة التأكيد** + **مخطط الأوامر** يضمنان أن أي تعديل بيانات من Jarvis يتطلب موافقة
  المعالج (fail-closed).

كل ما هو Jarvis-وارِد (لوحة الدردشة، زر المايك، تسلسل «JARVIS OS» بكل حركاته، لوحات
الـ HUD) **محفوظ بصرياً كما في v3**، لكنه مدفوع بالكامل عبر المزوّد.

## 4) ما حُفظ حرفياً
نظام Nocturne · الهوية البصرية والألوان · RTL · كل `@keyframes` · الشاشات السبع ·
نظام المودالات (ملف، تقييم ROM/MMT، تقرير) · CDSS · واجهة Jarvis وتسلسل الإقلاع · نصوص
i18n · بيانات البذر.

## 5) ما أُضيف (غلاف + حدود فقط — لا ميزات)
سكافولد Vite/TS · `sx`/`Box`/`Icon` (أدوات الأمانة) · طبقة `integrations/*` (العقود +
Mocks + DI + الإعداد + مخطط الأوامر + بوابة التأكيد) · README/هذا الملف.

## 6) التحقّق
تعذّر `npm install` في بيئة الهجرة (لا شبكة لسجل npm)، لذا جُمّع التطبيق بـ esbuild
(React مثبّت محلياً) ورُسم فعلياً في متصفح للتحقق من الأمانة البصرية: تسلسل الإقلاع،
لوحة التحكم RTL مع تحية Jarvis عبر المزوّد، وملف المريض مع بطاقات CDSS — كلها تطابق v3.
على جهازك، شغّل `npm install && npm run dev` (و`npm run typecheck` لفحص الأنواع الكامل).

## 7) Git
المستودع مُهيّأ بأول commit يضمّ كامل الشجرة (باستثناء `.gitignore`). جاهز للنمو في
Claude Code و Cowork.
