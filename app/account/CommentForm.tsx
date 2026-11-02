"use client";

import { useActionState } from "react";
import { addComment, type CommentActionState } from "@/app/engagement-actions";

export default function CommentForm({ listingId, needPostId }: { listingId?: string; needPostId?: string }) {
  const [state, action, pending] = useActionState<CommentActionState, FormData>(addComment, {});

  return (
    <form action={action} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input type="hidden" name="listingId" value={listingId ?? ""} />
        <input type="hidden" name="needPostId" value={needPostId ?? ""} />
        <input
          name="body"
          required
          maxLength={500}
          autoComplete="off"
          placeholder="Write a comment..."
          className="min-w-0 flex-1 rounded-full border border-[#e8d9c5] bg-white px-3 py-2 text-xs outline-none"
        />
        <button type="submit" disabled={pending} className="shrink-0 font-bold text-[#7b2432] disabled:opacity-60">
          {pending ? "Posting..." : "Post"}
        </button>
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-[#f7e5e3] px-2.5 py-1.5 text-[11px] leading-4 text-[#7b2432]">
          {state.error}
        </p>
      )}
      {state.success && state.flagged && (
        <p className="rounded-lg bg-[#f5ead8] px-2.5 py-1.5 text-[11px] leading-4 text-[#8a5a00]">
          Posted. This comment may be reviewed by a moderator.
        </p>
      )}
      <p className="text-[10px] leading-4 text-[#a4938d]">
        No phone numbers, emails, links, or payment-app details. Arrange meetups in chat.
      </p>
    </form>
  );
}
