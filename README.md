# PhysioTrack — Clinic Platform (host application)

منصة العيادة للعلاج الطبيعي (عربي RTL + English) — **أُعيد إنشاؤها بأمانة من صفحة
Claude Design «PhysioTrack v3»** كتطبيق مضيف مستقل (React + Vite + TypeScript)، مع حدود
تكامل قابلة للاستبدال لـ **Jarvis** و**أطلس التشريح ثلاثي الأبعاد** و**الأجهزة الطبية**.

> **Jarvis نظام خارجي.** لا يحتوي هذا المستودع على ذكاء Jarvis أو منطق سريري خاص به —
> فقط فيشة تكامل (Adapter/Provider). يبقى القرار السريري النهائي دائماً للمعالج.

## المصدر (source of truth)

الواجهة، التفاعلات، الحركات، تخطيط RTL، وواجهة Jarvis كلها منقولة بأمانة من
`design-reference/PhysioTrack v3.dc.html` (تصدير Claude Design بصيغة dc-runtime). نظام
التصميم **Nocturne** منقول **حرفياً** إلى `src/styles/nocturne.css`.

## التشغيل

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build
npm run typecheck  # فحص الأنواع فقط
```

اللغة الافتراضية: العربية (RTL). زر اللغة في الشريط الجانبي يبدّل إلى الإنجليزية فوراً.

## ربط Jarvis الحقيقي (لاحقاً — بلا إعادة تصميم)

Jarvis يُطوَّر خارجياً في Codex. للربط، غيّر **الإعداد فقط** (بلا مفاتيح API في الكود):

```bash
# .env
VITE_JARVIS_PROVIDER=remote
VITE_JARVIS_API_URL=https://your-jarvis-service.example.com
```

أو برمجياً — سطر واحد، والواجهة نفسها بلا تغيير:

```ts
import { setJarvisProvider } from "./integrations/jarvis/provider";
import { RemoteJarvisProvider } from "./integrations/jarvis/RemoteJarvisProvider";

setJarvisProvider(new RemoteJarvisProvider({ endpoint: process.env.JARVIS_API_URL }));
```

حتى ذلك الحين، يعمل `MockJarvisProvider` لتشغيل واجهة الدردشة والصوت في المعاينة
(ردود تجريبية مبنية على بيانات العيادة — بلا ذكاء سريري).

## حدود التكامل (Integration boundaries)

```
src/integrations/
├─ config.ts                         ← اختيار المزوّدين بالإعداد (mock/remote)
├─ jarvis/
│  ├─ types.ts                       ← JarvisProvider · JarvisChatAdapter · JarvisVoiceAdapter
│  ├─ commandSchema.ts               ← مخطط الأوامر المنظّم + التحقق
│  ├─ confirmation.ts                ← بوابة تأكيد المعالج قبل تعديل بيانات المريض
│  ├─ contextBridge.ts               ← بناء سياق العيادة (قراءة فقط) لـ Jarvis
│  ├─ provider.ts                    ← DI: setJarvisProvider / getJarvisProvider
│  ├─ MockJarvisProvider.ts          ← المزوّد الافتراضي (معاينة/اختبار)
│  ├─ RemoteJarvisProvider.ts        ← فيشة ربط Jarvis الخارجي (Codex)
│  └─ voice/BrowserVoiceAdapter.ts   ← صوت (Web Speech): نطق + استماع
├─ anatomy/  (AnatomyAtlasProvider — أطلس 3D خارجي، «قريباً»)
└─ devices/  (MedicalDeviceProvider — أجهزة عبر بنية إضافات)
```

كل حد له عقد (interface) + Mock + مُسجِّل DI. استبدال أي Mock بمزوّد حقيقي = سطر واحد،
بلا أي تغيير في واجهة المستخدم.

### الأمان
- **تأكيد المعالج:** أي أمر من Jarvis يعدّل بيانات مريض/سجل يمرّ عبر `confirmation.ts`
  ويتطلب موافقة صريحة (fail-closed). الأوامر للقراءة فقط (تنقّل/فتح ملف) تمرّ مباشرة.
- **حدّ آمن:** `RemoteJarvisProvider` ينقل فقط (system + messages + context) لنقطة نهاية
  مُعدّة؛ التوكن يُحقن وقت الطلب من مصدر آمن، ولا مفاتيح في الكود.
- **مخطط أوامر منظّم:** `commandSchema.ts` يتحقق من كل أمر قبل عرضه للتأكيد.

## البنية

```
src/
├─ main.tsx · App(PhysioTrackApp)      ← نقطة الدخول + جذر التطبيق (RTL)
├─ styles/ (nocturne.css حرفياً · global.css: keyframes منقولة)
├─ lib/    (sx: محوّل CSS-string→style · Box: hover/active/focus · icons)
├─ i18n/   (strings.ts — عربي/إنجليزي)
├─ data/   (registries.ts · seed.ts)
├─ cdss/   (engine.ts — دعم القرار السريري: قواعد حتمية على السجل)
├─ integrations/ (حدود Jarvis / Anatomy / Devices — أعلاه)
└─ app/
   ├─ useApp.tsx (المتحكّم — حالة + منطق + ربط Jarvis عبر المزوّد)
   ├─ Sidebar · Header · ScreenArea
   ├─ screens/ (Dashboard · Patients · Appointments · Invoices · Team · Anatomy · Devices)
   ├─ modals/  (Profile · AddPatient · PickArea · Assessment · Report · InsightCard · ConfirmHost)
   └─ jarvis/  (JarvisLayer — لوحة الدردشة + الزر · BootOS — تسلسل «JARVIS OS»)
design-reference/  ← تصدير v3 الأصلي (مرجع فقط — لا يُبنى)
```

## ملاحظات
- CDSS (رؤى سريرية) طبقة دعم قرار حتمية داخل المضيف (جزء من v3 المحفوظ)، ليست Jarvis؛
  يمكن لاحقاً تغذيتها من Jarvis عبر نفس الحد دون تغيير عقدها.
- لا ميزات جديدة أُضيفت — إعادة إنشاء أمينة + حدود تكامل فقط.
- التفاصيل الكاملة للهجرة في `MIGRATION.md`.
