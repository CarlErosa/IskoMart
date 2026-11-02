"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { deletePost } from "@/app/engagement-actions";
import {
  reportContent,
  toggleBlock,
  type BlockActionState,
  type ReportActionState,
} from "@/app/moderation-actions";

export default function PostMenu({
  postId,
  isOwner,
  listing,
  authorId,
  authorName,
  isBlocked,
  returnToAccount = false,
}: {
  postId: string;
  isOwner: boolean;
  listing: boolean;
  authorId: string;
  authorName: string;
  isBlocked: boolean;
  returnToAccount?: boolean;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportState, reportAction, reportPending] = useActionState<ReportActionState, FormData>(reportContent, {});
  const [blockState, blockAction, blockPending] = useActionState<BlockActionState, FormData>(toggleBlock, {});

  return (
    <details className="relative shrink-0">
      <summary
        className="cursor-pointer list-none rounded-full px-1.5 py-0.5 text-[#a4938d] transition hover:bg-[#f5ead8] hover:text-[#7b2432]"
        aria-label={isOwner ? "Post options" : `Options for ${authorName}'s post`}
      >
        ⋯
      </summary>
      <div className="absolute right-0 top-7 z-30 w-64 rounded-xl border border-[#e8d9c5] bg-[#fffdf8] p-2 shadow-xl">
        {isOwner ? (
          <>
            <Link
              href={`/edit-post/${postId}`}
              className="block rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#45383a] transition hover:bg-[#f5ead8]"
            >
              Edit post
            </Link>
            <form
              action={deletePost}
              onSubmit={(event) => {
                if (!window.confirm("Delete this post permanently?")) event.preventDefault();
              }}
            >
              <input type="hidden" name={listing ? "listingId" : "needPostId"} value={postId} />
              {returnToAccount && <input type="hidden" name="returnToAccount" value="1" />}
              <button
                type="submit"
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#7b2432] transition hover:bg-[#f7e5e3]"
              >
                Delete post
              </button>
            </form>
          </>
        ) : (
          <>
            {reportState.success ? (
              <p className="rounded-lg bg-[#e4efdf] px-3 py-2 text-xs leading-5 text-[#345b36]">
                Thanks. A moderator will review this post.
              </p>
            ) : reportOpen ? (
              <form action={reportAction} className="space-y-2">
                <input type="hidden" name="targetType" value={listing ? "listing" : "need_post"} />
                <input type="hidden" name="targetId" value={postId} />
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
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="flex-1 rounded-full border border-[#d8c6b5] px-3 py-1.5 text-xs font-semibold text-[#69595a]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reportPending}
                    className="flex-1 rounded-full bg-[#7b2432] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {reportPending ? "Sending..." : "Send report"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#7b2432] transition hover:bg-[#f7e5e3]"
              >
                Report post
              </button>
            )}

            <form action={blockAction} className="mt-1 border-t border-[#e8d9c5] pt-1">
              <input type="hidden" name="userId" value={authorId} />
              <input type="hidden" name="action" value={isBlocked ? "unblock" : "block"} />
              <button
                type="submit"
                disabled={blockPending}
                className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#69595a] transition hover:bg-[#f5ead8] disabled:opacity-60"
              >
                {blockPending ? "Saving..." : isBlocked ? `Unblock ${authorName}` : `Block ${authorName}`}
              </button>
              {blockState.error && (
                <p role="alert" className="mt-1 rounded-lg bg-[#f7e5e3] px-2 py-1.5 text-[11px] leading-4 text-[#7b2432]">
                  {blockState.error}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </details>
  );
}
