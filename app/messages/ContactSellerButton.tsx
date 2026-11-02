"use client";

import { useActionState, useState } from "react";
import { contactSeller, type ContactSellerState } from "./actions";

export default function ContactSellerButton({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState<ContactSellerState, FormData>(contactSeller, {});
  const [dismissed, setDismissed] = useState(false);

  return (
    <>
      <form action={action} onSubmit={() => setDismissed(false)} className="max-w-full">
        <input type="hidden" name="listingId" value={listingId} />
        <button type="submit" disabled={pending} className="whitespace-nowrap rounded-full bg-[#7b2432] px-3 py-1.5 font-semibold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Opening..." : "Contact seller"}
        </button>
      </form>
      {state.error && !dismissed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#281d1e]/45 px-5" role="presentation">
          <div role="alertdialog" aria-modal="true" aria-labelledby="contact-error-title" className="w-full max-w-sm rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f7e5e3] text-lg text-[#7b2432]" aria-hidden="true">!</span>
              <div><h2 id="contact-error-title" className="font-serif text-xl font-bold text-[#7b2432]">We couldn’t open that chat</h2><p className="mt-2 text-sm leading-6 text-[#8b7775]">{state.error}</p></div>
            </div>
            <button type="button" autoFocus onClick={() => setDismissed(true)} className="mt-5 w-full rounded-full bg-[#7b2432] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#641d29]">Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
