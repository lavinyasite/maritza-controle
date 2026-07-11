"use client";

import { useEffect } from "react";

interface NotificationToastProps {
  message: string;
  type: "success" | "error" | "info";
  visible: boolean;
  onClose?: () => void;
}

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c8cf8" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

export default function NotificationToast({ message, type, visible, onClose }: NotificationToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => { onClose?.(); }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`toast ${type === "success" ? "toast-success" : type === "error" ? "toast-error" : ""} ${visible ? "show" : ""}`}
    >
      {ICONS[type]}
      <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{message}</span>
    </div>
  );
}
