"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "./ui";

interface ConfirmDialogProps {
  /** Opens the dialog when set; undefined keeps it closed */
  message?: string;
  /** Label of the confirming button, e.g. "Delete topic" */
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * "Are you sure?" popup for destructive actions, drawn by the app instead of `window.confirm`
 * (which some embedded browsers block). Esc or a click outside cancels; Cancel has focus first.
 */
export function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (message && !dialog.open) {
      dialog.showModal();
      // Cancel is the first button, so Enter doesn't delete by accident
      dialog.querySelector("button")?.focus();
    }
    if (!message && dialog.open) dialog.close();
  }, [message]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      aria-describedby={messageId}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-border bg-background p-0 text-foreground backdrop:bg-black/60"
    >
      <div className="grid gap-5 p-5">
        <p id={messageId}>{message}</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
