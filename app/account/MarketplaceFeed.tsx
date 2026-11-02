"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createNeedPost, type NeedPostActionState } from "./actions";
import { signOut } from "@/app/auth/actions";
import ModerationBadge from "@/components/ModerationBadge";
import PostActions, { type PostComment } from "@/components/PostActions";
import PostMenu from "@/components/PostMenu";
import ThemeToggle from "@/components/ThemeToggle";

type FeedListing = {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string | null;
  meetupLocation: string | null;
  imageUrl: string | null;
  avatarUrl: string | null;
  sellerName: string;
  campus: string | null;
  category: string;
  createdAt: string;
  sellerId: string;
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean | string | null;
  sharedBy: string | null;
  moderationStatus: string;
  comments: PostComment[];
};

type FeedCategory = {
  id: string;
  name: string;
};

type FeedNeed = {
  id: string;
  requesterId: string;
  body: string;
  requesterName: string;
  avatarUrl: string | null;
  campus: string | null;
  category: string;
  createdAt: string;
  likeCount: number;
  repostCount: number;
  liked: boolean;
  reposted: boolean | string | null;
  sharedBy: string | null;
  moderationStatus: string;
  comments: PostComment[];
};

const postColors = ["bg-[#f5dfb4]", "bg-[#d9e2d4]", "bg-[#e4d9e8]", "bg-[#dce7ed]"];

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4"><circle cx="8.75" cy="8.75" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m13 13 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}


function AuthorAvatar({ name, avatarUrl, tone }: { name: string; avatarUrl: string | null; tone: "gold" | "green" }) {
  return avatarUrl
    ? <Image src={avatarUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full object-cover" />
    : <span className={`flex size-10 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-[#7b2432] ${tone === "gold" ? "bg-[#f5dfb4]" : "bg-[#d9e2d4]"}`}>{name.charAt(0).toUpperCase()}</span>;
}

export default function MarketplaceFeed({ displayName, avatarUrl, isAdmin, currentUserId, blockedUserIds, listings, needs, categories }: { displayName: string; avatarUrl: string | null; isAdmin: boolean; currentUserId: string; blockedUserIds: string[]; listings: FeedListing[]; needs: FeedNeed[]; categories: FeedCategory[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const router = useRouter();
  const [needState, needAction, needPending] = useActionState<NeedPostActionState, FormData>(createNeedPost, {});
  useEffect(() => {
    if (needState.success) {
      router.refresh();
    }
  }, [needState.success, router]);
  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesCategory = category === "all" || listing.category === category;
      const searchableText = `${listing.title} ${listing.description} ${listing.sellerName} ${listing.category}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, listings, query]);
  const matchingNeeds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return needs.filter((need) => {
      const matchesCategory = category === "all" || need.category === category;
      const searchableText = `${need.body} ${need.requesterName} ${need.category}`.toLowerCase();
      return matchesCategory && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, needs, query]);
  const hasFeedContent = filteredListings.length > 0 || matchingNeeds.length > 0;

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#281d1e]">
      <header className="sticky top-0 z-20 border-b border-[#e8d9c5]/80 bg-[#fbf8f2]/95 backdrop-blur">
        <div className="mx-auto hidden h-[72px] max-w-6xl items-center justify-between gap-5 px-5 md:flex lg:px-8">
          <Link href="/" aria-label="IskoMart home" className="shrink-0"><Image src="/logos/text_logo.png" alt="IskoMart" width={208} height={56} className="h-14 w-52 object-contain" /></Link>
          <div className="flex items-center gap-8 text-sm text-[#8b7775]"><span className="font-semibold text-[#7b2432]">Home</span><Link href="/messages" className="transition hover:text-[#7b2432]">Messages</Link><Link href="/profile" className="transition hover:text-[#7b2432]">Profile</Link></div>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <form action={signOut}><button type="submit" className="whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]">Sign out</button></form>
            <Link href="/sell" className="whitespace-nowrap rounded-full bg-[#7b2432] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#641d29]">Sell something</Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="IskoMart home" className="shrink-0"><Image src="/logos/text_logo.png" alt="IskoMart" width={208} height={56} className="h-10 w-28 object-contain" /></Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/sell" className="rounded-full bg-[#7b2432] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#641d29]">Sell</Link>
            </div>
          </div>
          <nav aria-label="Account navigation" className="grid grid-cols-3 gap-2 border-t border-[#e8d9c5] pt-2 text-center">
            <Link href="/messages" className="rounded-full px-2 py-2 text-xs font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]">Messages</Link>
            <Link href="/profile" className="rounded-full px-2 py-2 text-xs font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]">Profile</Link>
            <form action={signOut}><button type="submit" className="w-full rounded-full px-2 py-2 text-xs font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]">Sign out</button></form>
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-8 lg:grid-cols-[190px_minmax(0,640px)_190px] lg:px-8">
        <aside className="hidden lg:block"><div className="sticky top-28"><p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Your space</p><Link href="/profile" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]"><AuthorAvatar name={displayName} avatarUrl={avatarUrl} tone="gold" />{displayName.split(" ")[0]}</Link><Link href="/messages" className="mt-2 block rounded-xl px-3 py-3 text-sm text-[#8b7775] transition hover:bg-[#f5ead8] hover:text-[#7b2432]">Messages</Link>{isAdmin && <Link href="/admin" className="mt-2 block rounded-xl px-3 py-3 text-sm font-semibold text-[#7b2432] transition hover:bg-[#f5ead8]">Admin moderation</Link>}<Link href="/sell" className="mt-2 block rounded-xl px-3 py-3 text-sm text-[#8b7775] transition hover:bg-[#f5ead8] hover:text-[#7b2432]">＋ Create a listing</Link><form action={signOut} className="mt-2"><button type="submit" className="w-full rounded-xl px-3 py-3 text-left text-sm text-[#8b7775] transition hover:bg-[#f5ead8] hover:text-[#7b2432]">Sign out</button></form></div></aside>

        <section>
          <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">PUP marketplace</p><h1 className="mt-1 font-serif text-3xl font-bold tracking-[-0.04em] text-[#7b2432]">For you</h1></div><span className="rounded-full bg-[#f5ead8] px-3 py-1.5 text-xs font-semibold text-[#7b2432]">Fresh finds</span></div>
          <div className="rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] p-4">
            {!composerOpen ? (
              <button type="button" onClick={() => setComposerOpen(true)} className="flex w-full items-center gap-3 text-left">
                <AuthorAvatar name={displayName} avatarUrl={avatarUrl} tone="gold" />
                <span className="flex-1 rounded-full bg-[#fbf8f2] px-4 py-2.5 text-sm text-[#a4938d] transition hover:bg-[#f5ead8]">What are you looking for, {displayName.split(" ")[0]}?</span>
              </button>
            ) : (
              <form action={needAction} className="space-y-3">
                <div className="flex items-start gap-3">
                  <AuthorAvatar name={displayName} avatarUrl={avatarUrl} tone="gold" />
                  <textarea name="body" required maxLength={500} autoFocus placeholder="Post what you need and let fellow Iskolars help..." className="min-h-24 flex-1 resize-none rounded-xl bg-[#fbf8f2] px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-[#d3a445]/40" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <select name="categoryId" className="rounded-full border border-[#e8d9c5] bg-[#fffdf8] px-3 py-2 text-xs text-[#7b2432] outline-none">
                    <option value="">Choose a topic (optional)</option>
                        {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <div className="flex items-center justify-end gap-3">
                    {needState.error && <p role="alert" className="rounded-lg bg-[#f7e5e3] px-3 py-2 text-xs font-semibold text-[#7b2432]">{needState.error}</p>}
                    {needState.success && <p className="text-xs text-[#345b36]">Posted!</p>}
                    <button type="button" onClick={() => setComposerOpen(false)} className="text-xs font-semibold text-[#8b7775]">Cancel</button>
                    <button type="submit" disabled={needPending} className="rounded-full bg-[#7b2432] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{needPending ? "Posting..." : "Post request"}</button>
                  </div>
                </div>
                {needState.success && needState.flagged && (
                  <p className="rounded-lg bg-[#f5ead8] px-3 py-2 text-xs text-[#8a5a00]">
                    Posted. A moderator may review this request.
                  </p>
                )}
                <p className="text-[10px] leading-4 text-[#a4938d]">
                  No phone numbers, emails, links, or payment-app details. Arrange meetups in chat.
                </p>
              </form>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row"><label className="flex flex-1 items-center gap-3 rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-4 py-3 text-[#8b7775]"><SearchIcon /><span className="sr-only">Search products</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the marketplace" className="w-full bg-transparent text-sm outline-none placeholder:text-[#a4938d]" /></label><label className="flex items-center gap-2 rounded-xl border border-[#e8d9c5] bg-[#fffdf8] px-3 py-3 text-sm font-semibold text-[#7b2432] sm:w-48"><span aria-hidden="true">☷</span><span className="sr-only">Filter by category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full cursor-pointer bg-transparent outline-none"><option value="all">All categories</option>{categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label></div>
          <div className="mt-7 flex border-b border-[#e8d9c5] text-sm"><span className="border-b-2 border-[#7b2432] px-4 pb-3 font-semibold text-[#7b2432]">Latest</span><span className="px-4 pb-3 text-[#a4938d]">Popular</span></div>

          <div className="divide-y divide-[#e8d9c5]">{hasFeedContent ? (
            <>
            {matchingNeeds.map((need) => (
              <article id={`need-${need.id}`} key={`need-${need.id}`} className="scroll-mt-24 py-7">
                <div className="flex gap-3">
                  <AuthorAvatar name={need.requesterName} avatarUrl={need.avatarUrl} tone="green" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold text-[#281d1e]">{need.requesterName}</h2>
                          <ModerationBadge status={need.moderationStatus} />
                        </div>
                        <p className="text-xs text-[#a4938d]">
                          {need.campus ?? "PUP campus"} · {new Date(need.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <PostMenu
                        postId={need.id}
                        isOwner={need.requesterId === currentUserId}
                        listing={false}
                        authorId={need.requesterId}
                        authorName={need.requesterName}
                        isBlocked={blockedUserIds.includes(need.requesterId)}
                      />
                    </div>
                    <div className="mt-4 rounded-2xl bg-[#d9e2d4] p-5">
                      <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">
                        Looking for · {need.category}
                      </span>
                      <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#45383a]">{need.body}</p>
                    </div>
                    <PostActions
                      needPostId={need.id}
                      likeCount={need.likeCount}
                      repostCount={need.repostCount}
                      liked={need.liked}
                      reposted={need.reposted}
                      comments={need.comments}
                      currentUserId={currentUserId}
                      blockedUserIds={blockedUserIds}
                    />
                  </div>
                </div>
              </article>
            ))}
            {filteredListings.map((listing, index) => (
            <article id={`listing-${listing.id}`} key={listing.id} className="scroll-mt-24 py-7">
              <div className="flex gap-3">
                <AuthorAvatar name={listing.sellerName} avatarUrl={listing.avatarUrl} tone="gold" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-[#281d1e]">{listing.sellerName}</h2>
                        <ModerationBadge status={listing.moderationStatus} />
                      </div>
                      <p className="text-xs text-[#a4938d]">
                        {listing.campus ?? "PUP campus"} · {new Date(listing.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <PostMenu
                      postId={listing.id}
                      isOwner={listing.sellerId === currentUserId}
                      listing
                      authorId={listing.sellerId}
                      authorName={listing.sellerName}
                      isBlocked={blockedUserIds.includes(listing.sellerId)}
                    />
                  </div>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#45383a]">{listing.description}</p>
                  <div className={`mt-4 overflow-hidden rounded-2xl ${postColors[index % postColors.length]}`}>
                    {listing.imageUrl ? (
                      <Image
                        src={listing.imageUrl}
                        alt={listing.title}
                        width={640}
                        height={420}
                        className="h-64 w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex min-h-44 flex-col justify-between p-6 sm:min-h-52">
                        <div className="flex items-start justify-between">
                          <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">
                            {listing.category}
                          </span>
                          <span className="font-serif text-5xl font-bold text-[#7b2432]/20">
                            {listing.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-[#7b2432]">{listing.title}</h3>
                          <p className="mt-1 text-lg font-bold text-[#281d1e]">₱{listing.price.toLocaleString("en-PH")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8b7775]">
                    <span className="rounded-full bg-[#f5ead8] px-3 py-1 font-semibold text-[#7b2432]">{listing.category}</span>
                    <span>{listing.condition?.replace("_", " ") ?? "Condition not specified"}</span>
                    {listing.meetupLocation && <span>· Meet at {listing.meetupLocation}</span>}
                    <span className="ml-auto font-bold text-[#7b2432]">₱{listing.price.toLocaleString("en-PH")}</span>
                  </div>
                  <PostActions
                    listingId={listing.id}
                    sellerId={listing.sellerId}
                    likeCount={listing.likeCount}
                    repostCount={listing.repostCount}
                    liked={listing.liked}
                    reposted={listing.reposted}
                    comments={listing.comments}
                    currentUserId={currentUserId}
                    blockedUserIds={blockedUserIds}
                  />
                </div>
              </div>
            </article>
            ))}
            </>
          ) : <div className="py-20 text-center"><p className="text-4xl text-[#d3a445]">✦</p><h2 className="mt-4 font-serif text-2xl font-bold text-[#7b2432]">{listings.length === 0 && needs.length === 0 ? "The marketplace is just getting started." : "No posts match that search."}</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8b7775]">{listings.length === 0 && needs.length === 0 ? "Be the first Iskolar to put something up for sale or ask the community for help." : "Try another keyword or choose a different category."}</p></div>}</div>
        </section>

        <aside className="hidden lg:block"><div className="sticky top-28 rounded-2xl border border-[#e8d9c5] bg-[#fffdf8] p-4"><p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Explore topics</p><div className="mt-3 flex flex-wrap gap-2">{categories.slice(0, 5).map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.name)} className="rounded-full bg-[#f5ead8] px-3 py-1.5 text-xs text-[#7b2432] transition hover:bg-[#f1dfbd]">{item.name}</button>)}</div></div></aside>
      </div>
    </main>
  );
}
