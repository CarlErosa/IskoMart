"use client";

import { useActionState } from "react";
import {
  reportContent,
  toggleBlock,
  type BlockActionState,
  type ReportActionState,
} from "@/app/moderation-actions";

type TargetType = "listing" | "need_post" | "comment" | "message" | "review" | "profile";

export default function ReportMenu({
  targetType,
  targetId,
  authorId,
  authorName,
  isBlocked,
  allowBlock = true,
  inline = false,
}: {
  targetType: TargetType;
  targetId: string;
  authorId: string;
  authorName: string;
  isBlocked: boolean;
  allowBlock?: boolean;
  inline?: boolean;
}) {
  const [reportState, reportAction, reportPending] = useActionState<ReportActionState, FormData>(reportContent, {});
  const [blockState, blockAction, blockPending] = useActionState<BlockActionState, FormData>(toggleBlock, {});

  return (
    <details className="relative shrink-0">
      <summary
        className="cursor-pointer list-none rounded-full px-1.5 py-0.5 text-sm text-[#a4938d] transition hover:bg-[#f5ead8] hover:text-[#7b2432]"
        aria-label={`Report or block ${authorName}`}
      >
        ⋯
      </summary>
      <div className={`${inline ? "relative z-30 mt-2 w-56" : "absolute right-0 top-7 z-30 w-64"} rounded-xl border border-[#e8d9c5] bg-[#fffdf8] p-3 shadow-xl`}>
        {reportState.success ? (
          <p className="rounded-lg bg-[#e4efdf] px-3 py-2 text-xs leading-5 text-[#345b36]">
            Thanks. A moderator will review this.
          </p>
        ) : (
          <form action={reportAction} className="space-y-2">
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <label className="block text-[11px] font-bold tracking-wide text-[#69595a] uppercase">
              Report reason
              <select
                name="reason"
                required
                className="mt-1 w-full rounded-lg border border-[#e8d9c5] bg-[#fbf8f2] px-2 py-1.5 text-xs font-normal normal-case text-[#281d1e] outline-none"
              >
                <option value="spam">Spam</option>
                <option value="harassment">Harassment</option>
                <option value="hate">Hate speech</option>
                <option value="scam">Scam or payment request</option>
                <option value="impersonation">Impersonation</option>
                <option value="other">Other</option>
              </select>
            </label>
            <input
              name="details"
              maxLength={500}
              placeholder="Details (optional)"
              className="w-full rounded-lg border border-[#e8d9c5] bg-[#fbf8f2] px-2 py-1.5 text-xs outline-none"
            />
            {reportState.error && (
              <p role="alert" className="rounded-lg bg-[#f7e5e3] px-2 py-1.5 text-[11px] leading-4 text-[#7b2432]">
                {reportState.error}
              </p>
            )}
            <button
              type="submit"
              disabled={reportPending}
              className="w-full rounded-full bg-[#7b2432] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {reportPending ? "Reporting..." : "Report"}
            </button>
          </form>
        )}

        {allowBlock && (
          <form action={blockAction} className="mt-2 border-t border-[#e8d9c5] pt-2">
            <input type="hidden" name="userId" value={authorId} />
            <input type="hidden" name="action" value={isBlocked ? "unblock" : "block"} />
            <button
              type="submit"
              disabled={blockPending}
              className="w-full rounded-full border border-[#d8c6b5] px-3 py-1.5 text-xs font-semibold text-[#7b2432] disabled:opacity-60"
            >
              {blockPending ? "Saving..." : isBlocked ? `Unblock ${authorName}` : `Block ${authorName}`}
            </button>
            {blockState.error && (
              <p role="alert" className="mt-1 rounded-lg bg-[#f7e5e3] px-2 py-1.5 text-[11px] leading-4 text-[#7b2432]">
                {blockState.error}
              </p>
            )}
          </form>
        )}
      </div>
    </details>
  );
}
