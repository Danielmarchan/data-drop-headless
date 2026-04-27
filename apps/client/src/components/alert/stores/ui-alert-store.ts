import { create } from 'zustand';
import type { AlertVariant } from '@/components/alert/alert';

type AlertInput = {
  variant: AlertVariant;
  title: string;
  message?: string;
  autoCloseMs?: number;
  persistOnNavigation?: boolean;
};

export type ActiveAlert = AlertInput & {
  id: number;
  persistOnNavigation: boolean;
};

type AlertStore = {
  activeAlert: ActiveAlert | null;
  topOffset: number;
  showAlert: (alert: AlertInput) => void;
  dismissAlert: () => void;
  setTopOffset: (height: number) => void;
};

let nextAlertId = 1;

export const useAlertStore = create<AlertStore>((set) => ({
  activeAlert: null,
  topOffset: 0,
  showAlert: (alert) =>
    set({
      activeAlert: {
        ...alert,
        id: nextAlertId++,
        persistOnNavigation: alert.persistOnNavigation ?? false,
      },
    }),
  dismissAlert: () => set({ activeAlert: null }),
  setTopOffset: (height) => set({ topOffset: Math.max(0, height) }),
}));
