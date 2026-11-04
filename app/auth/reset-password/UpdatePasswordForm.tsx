"use client";

import { useActionState } from "react";
import { updatePassword, type UpdatePasswordState } from "../actions";

const initialState: UpdatePasswordState = {};

export default function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-[#69595a]">
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30"
        />
      </label>
      <label className="block text-sm font-semibold text-[#69595a]">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Type it again"
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
        {pending ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}
