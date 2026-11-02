"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { updateProfile, type ProfileActionState } from "./actions";

const initialState: ProfileActionState = {};
const maxAvatarSize = 2 * 1024 * 1024;

export default function ProfileForm({ userId, displayName, avatarUrl, headerUrl, bio }: { userId: string; displayName: string; avatarUrl: string | null; headerUrl: string | null; bio: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  const [selectedAvatar, setSelectedAvatar] = useState(avatarUrl);
  const [selectedHeader, setSelectedHeader] = useState(headerUrl);
  const [uploadError, setUploadError] = useState<string>();
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File | undefined, type: "avatar" | "header") {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUploadError("Choose an image file.");
    if (file.size > maxAvatarSize) return setUploadError("Images must be 2 MB or smaller.");
    setUploadError(undefined);
    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${type}.${extension}`;
    const supabase = createClient();
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600", contentType: file.type });
    if (error) {
      setUploadError(`Unable to upload the picture: ${error.message}`);
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      if (type === "avatar") setSelectedAvatar(publicUrl);
      else setSelectedHeader(publicUrl);
    }
    setUploading(false);
  }

  const avatarStyle = selectedAvatar ? { backgroundImage: `url("${selectedAvatar}")` } : undefined;
  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-10 text-[#281d1e]">
      <div className="mx-auto max-w-xl">
        <Link href="/account" className="text-sm font-bold text-[#7b2432]">← Back to marketplace</Link>
        <section className="mt-6 rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-7 shadow-[8px_8px_0_#f1dfbd] sm:p-9">
          <p className="text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Your IskoMart profile</p>
          <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">Make it yours.</h1>
          <p className="mt-3 text-sm leading-6 text-[#69595a]">This is how fellow Iskolars will see you when you sell or connect.</p>
          {(state.error || uploadError) && <p role="alert" className="mt-5 rounded-xl bg-[#f7dfda] px-4 py-3 text-sm leading-6 text-[#7b2432]">{state.error ?? uploadError}</p>}
          <form action={action} className="mt-7 space-y-6">
            <div><p className="text-sm font-semibold text-[#69595a]">Profile picture</p><div className="mt-3 flex items-center gap-4"><span className="flex size-[72px] items-center justify-center rounded-full bg-[#f5dfb4] bg-cover bg-center font-serif text-3xl font-bold text-[#7b2432]" style={avatarStyle}>{!selectedAvatar && displayName.charAt(0).toUpperCase()}</span><label className="cursor-pointer rounded-full border border-[#7b2432] px-4 py-2.5 text-sm font-bold text-[#7b2432]">{uploading ? "Uploading..." : "Choose picture"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => handleUpload(event.target.files?.[0], "avatar")} className="sr-only" /></label></div></div>
            <div><p className="text-sm font-semibold text-[#69595a]">Profile header</p><div className="mt-3 overflow-hidden rounded-2xl border border-[#e8d9c5]"><div className="h-28 bg-[#7b2432] bg-cover bg-center" style={selectedHeader ? { backgroundImage: `url("${selectedHeader}")` } : undefined} /><label className="block cursor-pointer px-4 py-3 text-center text-sm font-bold text-[#7b2432]">{uploading ? "Uploading..." : "Choose header image"}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} onChange={(event) => handleUpload(event.target.files?.[0], "header")} className="sr-only" /></label></div></div>
            <label className="block text-sm font-semibold text-[#69595a]">Username<input name="displayName" defaultValue={displayName} required minLength={2} maxLength={80} className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30" /></label>
            <label className="block text-sm font-semibold text-[#69595a]">Bio<textarea name="bio" defaultValue={bio ?? ""} maxLength={280} rows={4} placeholder="Tell fellow Iskolars a little about yourself..." className="mt-2 w-full resize-none rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30" /></label>
            <input type="hidden" name="avatarUrl" value={selectedAvatar ?? ""} />
            <input type="hidden" name="headerUrl" value={selectedHeader ?? ""} />
            <button type="submit" disabled={pending || uploading} className="w-full rounded-full bg-[#7b2432] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">{pending ? "Saving profile..." : "Save profile"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
