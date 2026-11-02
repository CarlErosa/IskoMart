"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PRIVACY_NOTICE_STORAGE_KEY } from "@/lib/legal/consent";

export default function PrivacyBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/privacy") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      try {
        setVisible(window.localStorage.getItem(PRIVACY_NOTICE_STORAGE_KEY) !== "acknowledged");
      } catch {
        setVisible(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  function acknowledge() {
    try {
      window.localStorage.setItem(PRIVACY_NOTICE_STORAGE_KEY, "acknowledged");
    } catch {
      // If storage is unavailable, dismiss for this page view only.
    }
    setVisible(false);
  }

  if (!visible || pathname === "/privacy") {
    return null;
  }

  return (
    <aside
      aria-label="Privacy notice"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] p-4 text-[#281d1e] shadow-[0_18px_50px_rgba(40,29,30,0.18)] sm:inset-x-5 sm:bottom-5 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#b07b1d] uppercase">Privacy notice</p>
          <p className="mt-1 text-sm leading-6 text-[#45383a]">
            We use cookies and process personal data to run IskoMart. Read our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
            >
              Privacy Policy
            </Link>{" "}
            to learn what we collect and your rights.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/privacy"
            className="rounded-full border border-[#d8c6b5] px-4 py-2 text-xs font-semibold text-[#69595a] transition hover:bg-[#f5ead8]"
          >
            Read notice
          </Link>
          <button
            type="button"
            onClick={acknowledge}
            className="rounded-full bg-[#7b2432] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#641d29]"
          >
            Got it
          </button>
        </div>
      </div>
    </aside>
  );
}
