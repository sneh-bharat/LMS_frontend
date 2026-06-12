"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

/**
 * Custom hook to manage a persistent device ID stored in localStorage.
 * Returns null initially to prevent hydration mismatch in Next.js.
 * @returns {string | null} The unique device ID or null if not yet initialized.
 */
export default function useDeviceId(): string | null {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // localStorage is only available in the browser
    if (typeof window === "undefined") return;

    let id = localStorage.getItem("device_id");

    if (!id) {
      id = uuidv4();
      localStorage.setItem("device_id", id);
    }

    setDeviceId(id);
  }, []);

  return deviceId;
}