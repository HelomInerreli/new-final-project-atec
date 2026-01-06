import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolver?: (value: boolean) => void;
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    message: "",
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        ...options,
        resolver: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    confirmState.resolver?.(true);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolver]);

  const handleCancel = useCallback(() => {
    confirmState.resolver?.(false);
    setConfirmState((prev) => ({ ...prev, isOpen: false }));
  }, [confirmState.resolver]);

  return {
    confirm,
    confirmState,
    handleConfirm,
    handleCancel,
  };
}
