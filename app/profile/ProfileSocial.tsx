"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import BlockedUsers from "./BlockedUsers";

type ProfilePost = {
  id: string;
  kind: "listing" | "need";
  title: string;
  body: string;
  meta: string;
  price?: number;
};

export default function ProfileSocial({
  displayName,
  avatarUrl,
  headerUrl,
  bio,
  posts,
  likedPosts,
  blockedUsers,
}: {
  displayName: string;
  avatarUrl: string | null;
  headerUrl: string | null;
  bio: string | null;
  posts: ProfilePost[];
  likedPosts: ProfilePost[];
  blockedUsers: { id: string; name: string; campus: string | null }[];
}) {
  const [tab, setTab] = useState<"posts" | "liked" | "blocked">("posts");
  const visiblePosts = tab === "posts" ? posts : likedPosts;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#281d1e]">
      <header className="border-b border-[#e8d9c5] bg-[#fffdf8]">
        <div className="mx-auto flex h-[64px] max-w-5xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:px-5 lg:px-8">
          <Link href="/account" className="shrink-0 text-xs font-bold text-[#7b2432] sm:text-sm">← Marketplace</Link>
          <Image src="/logos/text_logo.png" alt="IskoMart" width={208} height={56} className="h-9 w-32 object-contain sm:h-14 sm:w-52" />
          <Link href="/profile/edit" className="shrink-0 rounded-full border border-[#7b2432] px-3 py-2 text-[10px] font-bold text-[#7b2432] sm:px-4 sm:text-xs">Edit profile</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 pb-20 lg:px-8">
        <section className="relative overflow-hidden rounded-b-3xl border-x border-b border-[#e8d9c5] bg-[#fffdf8]">
          <div className="h-44 bg-[#7b2432] bg-cover bg-center sm:h-56" style={headerUrl ? { backgroundImage: `url("${headerUrl}")` } : undefined}>
            {!headerUrl && <div className="h-full bg-[radial-gradient(circle_at_75%_30%,rgba(211,164,69,.55),transparent_28%),linear-gradient(135deg,#7b2432,#5b1d28)]" />}
          </div>
          <div className="relative px-4 pb-7 sm:px-10">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-3 sm:-mt-14">
              {avatarUrl ? <Image src={avatarUrl} alt="" width={112} height={112} className="size-28 rounded-full border-4 border-[#fffdf8] object-cover" /> : <span className="flex size-28 items-center justify-center rounded-full border-4 border-[#fffdf8] bg-[#f5dfb4] font-serif text-5xl font-bold text-[#7b2432]">{initial}</span>}
              <span className="mb-2 rounded-full bg-[#f5ead8] px-3 py-1 text-xs font-semibold text-[#7b2432]">PUP Iskolar</span>
            </div>
            <h1 className="mt-4 break-words font-serif text-3xl font-bold text-[#7b2432]">{displayName}</h1>
            <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm leading-6 text-[#69595a]">{bio || "IskoMart community member"}</p>
            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm"><span><strong className="text-[#281d1e]">{posts.length}</strong> posts</span><span><strong className="text-[#281d1e]">{likedPosts.length}</strong> liked</span></div>
          </div>
        </section>

        <section className="mx-auto mt-7 max-w-2xl">
          <div className="flex border-b border-[#e8d9c5]">
            <button type="button" onClick={() => setTab("posts")} className={`flex-1 border-b-2 px-4 py-4 text-sm font-semibold ${tab === "posts" ? "border-[#7b2432] text-[#7b2432]" : "border-transparent text-[#a4938d]"}`}>Posts</button>
            <button type="button" onClick={() => setTab("liked")} className={`flex-1 border-b-2 px-4 py-4 text-sm font-semibold ${tab === "liked" ? "border-[#7b2432] text-[#7b2432]" : "border-transparent text-[#a4938d]"}`}>Liked</button>
            <button type="button" onClick={() => setTab("blocked")} className={`flex-1 border-b-2 px-4 py-4 text-sm font-semibold ${tab === "blocked" ? "border-[#7b2432] text-[#7b2432]" : "border-transparent text-[#a4938d]"}`}>Blocked</button>
          </div>
          {tab === "blocked" ? <BlockedUsers users={blockedUsers} /> : visiblePosts.length ? visiblePosts.map((post) => (
            <article key={`${post.kind}-${post.id}`} className="border-b border-[#e8d9c5]">
              <Link
                href={`/post/${post.id}`}
                className="group block px-2 py-6 transition hover:bg-[#f5ead8]/40"
              >
                <p className="text-[10px] font-bold tracking-[0.18em] text-[#b07b1d] uppercase">{post.kind === "listing" ? "Listing" : "Looking for"}</p>
                <h2 className="mt-2 font-serif text-2xl font-bold text-[#7b2432] group-hover:underline">{post.title}</h2>
                <p className="mt-2 text-[15px] leading-7 text-[#45383a]">{post.body}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#8b7775]">
                  <span>{post.meta}</span>
                  <span className="flex items-center gap-4">
                    {post.price !== undefined && <strong className="text-[#7b2432]">₱{post.price.toLocaleString("en-PH")}</strong>}
                    <span className="font-semibold text-[#7b2432]">View post →</span>
                  </span>
                </div>
              </Link>
            </article>
          )) : <div className="py-16 text-center text-sm text-[#8b7775]">{tab === "posts" ? "Your posts will appear here." : "Posts you like will appear here."}</div>}
        </section>
      </div>
    </main>
  );
}
