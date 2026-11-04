"use client";

import { useActionState } from "react";
import { requestPasswordReset, type ResetRequestState } from "../actions";

const initialState: ResetRequestState = {};

export default function ResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <p className="mt-7 rounded-xl bg-[#e4efdf] px-4 py-3 text-sm leading-6 text-[#345b36]">
        If an account exists for that Gmail address, we sent a reset link. Check your Inbox, Spam, or Promotions tab.
      </p>
    );
  }

  return (
    <form action={action} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-[#69595a]">
        Gmail address
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@gmail.com"
          className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30"
        />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl bg-[#f7dfda] px-4 py-3 text-sm leading-6 text-[#7b2432]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#7b2432] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
