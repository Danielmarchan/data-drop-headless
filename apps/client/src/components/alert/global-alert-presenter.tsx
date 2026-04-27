import { useEffect } from 'react';
import Alert from '@/components/alert/alert';
import { router } from '@/router';
import { useAlertStore } from '@/components/alert/stores/ui-alert-store';

const VIEWPORT_PADDING_PX = 16;
const NAV_GAP_PX = 12;

export default function GlobalAlertPresenter() {
  const activeAlert = useAlertStore((state) => state.activeAlert);
  const topOffset = useAlertStore((state) => state.topOffset);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);

  useEffect(() => {
    let previousLocationKey = router.state.location.key;

    return router.subscribe((state) => {
      if (state.location.key === previousLocationKey) return;

      previousLocationKey = state.location.key;

      const { activeAlert: currentAlert, dismissAlert: clearAlert } =
        useAlertStore.getState();

      if (currentAlert && !currentAlert.persistOnNavigation) {
        clearAlert();
      }
    });
  }, []);

  useEffect(() => {
    if (!activeAlert?.autoCloseMs) return;

    const alertId = activeAlert.id;
    const timeoutId = window.setTimeout(() => {
      const { activeAlert: currentAlert, dismissAlert: clearAlert } =
        useAlertStore.getState();

      if (currentAlert?.id === alertId) {
        clearAlert();
      }
    }, activeAlert.autoCloseMs);

    return () => window.clearTimeout(timeoutId);
  }, [activeAlert?.autoCloseMs, activeAlert?.id]);

  if (!activeAlert) return null;

  const top = topOffset > 0 ? topOffset + NAV_GAP_PX : VIEWPORT_PADDING_PX;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-70 flex justify-center px-4"
      style={{ top }}
    >
      <div className="pointer-events-auto w-full max-w-2xl animate-[global-alert-slide-in_220ms_ease-out] motion-reduce:animate-none">
        <Alert
          variant={activeAlert.variant}
          title={activeAlert.title}
          message={activeAlert.message}
          onDismiss={dismissAlert}
        />
      </div>
    </div>
  );
}
