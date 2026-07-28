"use client";

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import toast from "react-hot-toast";

// 10 minutes in milliseconds
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; 

export function IdleTimeout() {
  const { status } = useSession();
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only track idle time for logged in users
    if (status !== "authenticated") return;

    const resetTimer = () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      
      timeoutIdRef.current = setTimeout(() => {
        // Auto-logout the user after 10 minutes of inactivity
        toast.error("You have been logged out due to inactivity", { duration: 5000 });
        signOut({ callbackUrl: "/login" });
      }, IDLE_TIMEOUT_MS);
    };

    // Initialize timer immediately
    resetTimer();

    // List of events that prove the user is still active
    const events = [
      "mousemove",
      "keydown",
      "wheel",
      "mousedown",
      "touchstart",
      "touchmove",
      "click"
    ];

    // We use a throttled listener so we don't call clearTimeout/setTimeout 60 times a second (e.g. on mousemove)
    let throttleTimer: NodeJS.Timeout | null = null;
    const throttledResetTimer = () => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        resetTimer();
        throttleTimer = null;
      }, 500); // Only process activity at most once every 500ms
    };

    events.forEach((event) => {
      window.addEventListener(event, throttledResetTimer, { passive: true });
    });

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (throttleTimer) clearTimeout(throttleTimer);
      events.forEach((event) => {
        window.removeEventListener(event, throttledResetTimer);
      });
    };
  }, [status]);

  return null;
}
