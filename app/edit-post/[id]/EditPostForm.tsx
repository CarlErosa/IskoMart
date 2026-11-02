"use client";

import { useActionState } from "react";
import { updatePost, type PostActionState } from "@/app/engagement-actions";

export default function EditPostForm({
  id,
  kind,
  body,
}: {
  id: string;
  kind: "listing" | "need";
  body: string;
}) {
  const [state, action, pending] = useActionState<PostActionState, FormData>(updatePost, {});

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name={kind === "listing" ? "listingId" : "needPostId"} value={id} />
      <textarea
        name="body"
        defaultValue={body}
        required
        minLength={3}
        maxLength={kind === "listing" ? 5000 : 500}
        className="min-h-48 w-full resize-y rounded-2xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 text-sm leading-6 outline-none focus:border-[#7b2432]"
      />
      {state.error && (
        <p role="alert" className="rounded-xl bg-[#f7e5e3] px-4 py-3 text-sm text-[#7b2432]">{state.error}</p>
      )}
      <p className="text-xs leading-5 text-[#a4938d]">
        No phone numbers, emails, links, or payment-app details. Arrange meetups in chat.
      </p>
      <button type="submit" disabled={pending} className="w-full rounded-full bg-[#7b2432] px-5 py-3 font-bold text-white disabled:opacity-60">
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
