import { useAppCtx } from "../AppContext";
import { Box } from "../../lib/Box";
import { sx } from "../../lib/sx";
import { ProfileModal } from "./ProfileModal";
import { AddPatientModal } from "./AddPatientModal";
import { PickAreaModal } from "./PickAreaModal";
import { AssessmentModal } from "./AssessmentModal";
import { ReportModal } from "./ReportModal";
import { ConfirmHost } from "./ConfirmHost";

const WIDTHS: Record<string, string> = { profile: "600px", add: "460px", pick: "540px", assess: "660px", report: "640px" };

/** Morphing modal system — backdrop + resizing panel that hosts the profile,
 *  add-patient, area-pick, assessment and report flows. v3 lines 379–612. */
export function ModalHost() {
  const { state, actions } = useAppCtx();
  const modal = state.modal;

  return (
    <>
      {modal && (
        <Box
          onClick={actions.closeModal}
          sx={`position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:24px;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:${modal.closing ? "ptFadeOut" : "ptFadeIn"} .3s ease both`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            data-screen-label={modal.type}
            data-pt-panel="1"
            style={sx(`width:${WIDTHS[modal.type] || "560px"};max-width:94vw;max-height:86vh;overflow-y:auto;overflow-x:hidden;display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-6);border-radius:var(--radius-lg);background:color-mix(in srgb, var(--color-surface) 94%, var(--color-section-glow));border:1px solid color-mix(in srgb, var(--color-text) 14%, transparent);box-shadow:var(--shadow-lg);animation:${modal.closing ? "ptDialogOut" : "ptDialogIn"} .42s cubic-bezier(.3,1.25,.5,1) both;transition:width .45s cubic-bezier(.3,1.2,.5,1)`)}
          >
            {modal.type === "profile" && <ProfileModal />}
            {modal.type === "add" && <AddPatientModal />}
            {modal.type === "pick" && <PickAreaModal />}
            {modal.type === "assess" && <AssessmentModal />}
            {modal.type === "report" && <ReportModal />}
          </div>
        </Box>
      )}
      <ConfirmHost />
    </>
  );
}
