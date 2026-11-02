"use client";

import { useActionState } from "react";
import { sendMessage, type MessageActionState } from "./actions";

export default function MessageForm({ conversationId }: { conversationId: string }) {
  const [state, action, pending] = useActionState<MessageActionState, FormData>(sendMessage, {});

  return (
    <form action={action} className="border-t border-[#e8d9c5]">
      <div className="flex items-end gap-2 p-3 sm:p-4">
        <input type="hidden" name="conversationId" value={conversationId} />
        <input
          name="body"
          required
          maxLength={2000}
          autoComplete="off"
          placeholder="Ask about size, availability, or meetup..."
          className="min-w-0 flex-1 rounded-2xl bg-[#fbf8f2] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#d3a445]/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-[#7b2432] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending..." : "Send"}
        </button>
      </div>
      <div className="space-y-1 px-3 pb-3 sm:px-4">
        {state.error && (
          <p role="alert" className="rounded-xl bg-[#f7e5e3] px-3 py-2 text-xs leading-5 text-[#7b2432]">
            {state.error}
          </p>
        )}
        {state.success && state.flagged && (
          <p className="rounded-xl bg-[#f5ead8] px-3 py-2 text-xs leading-5 text-[#8a5a00]">
            Sent. This message may be reviewed by a moderator.
          </p>
        )}
        <p className="text-[10px] leading-4 text-[#a4938d]">
          Links and payment details are allowed in chat, but keep payments in person.
        </p>
      </div>
    </form>
  );
}
