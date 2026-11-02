"use client";

import { useFormStatus } from "react-dom";
import { sendMessage } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-full bg-[#7b2432] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending..." : "Send"}
    </button>
  );
}

export default function MessageForm({ conversationId }: { conversationId: string }) {
  return (
    <form action={sendMessage} className="flex items-end gap-2 border-t border-[#e8d9c5] p-3 sm:p-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      <input
        name="body"
        required
        maxLength={2000}
        placeholder="Ask about size, availability, or meetup..."
        className="min-w-0 flex-1 rounded-2xl bg-[#fbf8f2] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#d3a445]/30"
      />
      <SubmitButton />
    </form>
  );
}
