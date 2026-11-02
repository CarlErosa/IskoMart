"use client";

import { useActionState, useState } from "react";
import { createListing, type SellActionState } from "./actions";

type Category = { id: string; name: string };

export default function SellForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState<SellActionState, FormData>(createListing, {});
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-6">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#281d1e]">Photo <span className="text-[#7b2432]">*</span></span>
        <span className="relative flex min-h-56 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d8c5ac] bg-[#fbf8f2] transition hover:border-[#7b2432]">
          {preview ? <div role="img" aria-label="Listing preview" className="h-56 w-full bg-cover bg-center" style={{ backgroundImage: `url(${preview})` }} /> : <span className="px-8 text-center text-sm leading-6 text-[#8b7775]">Upload a clear photo of your item<br /><span className="text-xs">JPG, PNG, or WebP · up to 5 MB</span></span>}
          <input name="image" type="file" accept="image/*" required aria-label="Upload listing photo" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }} />
        </span>
      </label>

      <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">What are you selling?</span><input name="title" required maxLength={120} placeholder="e.g. PUP hoodie, Calculus notes, banana bread" className="w-full rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30" /></label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">Price</span><div className="flex items-center rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 focus-within:border-[#7b2432]"><span className="text-sm text-[#8b7775]">₱</span><input name="price" required type="number" min="0" step="0.01" placeholder="0.00" className="w-full bg-transparent px-2 py-3 text-sm outline-none" /></div></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">Category</span><select name="categoryId" required className="w-full rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-sm text-[#7b2432] outline-none focus:border-[#7b2432]">{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">Condition</span><select name="condition" required defaultValue="good" className="w-full rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-sm text-[#7b2432] outline-none focus:border-[#7b2432]"><option value="new">Brand new</option><option value="like_new">Like new</option><option value="good">Good</option><option value="fair">Fair</option></select></label>
        <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">Meetup preference <span className="font-normal text-[#a4938d]">(optional)</span></span><input name="meetupLocation" maxLength={120} placeholder="e.g. PUP Main Gate" className="w-full rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-sm outline-none focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30" /></label>
      </div>
      <label className="block"><span className="mb-2 block text-sm font-semibold text-[#281d1e]">Description</span><textarea name="description" required minLength={10} maxLength={5000} placeholder="Share the details buyers should know: size, inclusions, pickup details, and why you’re selling." className="min-h-36 w-full resize-y rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-sm leading-6 outline-none focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30" /></label>
      {state.error && <p role="alert" className="rounded-xl bg-[#f7e5e3] px-4 py-3 text-sm text-[#7b2432]">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-full bg-[#7b2432] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Publishing..." : "Publish listing"}</button>
    </form>
  );
}
