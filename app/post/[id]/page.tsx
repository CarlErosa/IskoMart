import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoadingScreen from "@/components/LoadingScreen";
import ModerationBadge from "@/components/ModerationBadge";
import PostActions, { type PostComment } from "@/components/PostActions";
import PostMenu from "@/components/PostMenu";

type JoinedProfile = { display_name: string; campus: string | null; avatar_url: string | null } | { display_name: string; campus: string | null; avatar_url: string | null }[] | null;
type JoinedCategory = { name: string } | { name: string }[] | null;
type JoinedImage = { storage_path: string; sort_order: number } | { storage_path: string; sort_order: number }[] | null;

function joinedProfile(profile: JoinedProfile) {
  return Array.isArray(profile) ? profile[0] : profile;
}

function joinedCategory(category: JoinedCategory) {
  return Array.isArray(category) ? category[0] : category;
}

function joinedImages(images: JoinedImage) {
  if (!images) return [];
  return Array.isArray(images) ? images : [images];
}

function AuthorAvatar({ name, avatarUrl, tone }: { name: string; avatarUrl: string | null; tone: "gold" | "green" }) {
  return avatarUrl
    ? <Image src={avatarUrl} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" />
    : <span className={`flex size-12 shrink-0 items-center justify-center rounded-full font-serif text-xl font-bold text-[#7b2432] ${tone === "gold" ? "bg-[#f5dfb4]" : "bg-[#d9e2d4]"}`}>{name.charAt(0).toUpperCase()}</span>;
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<LoadingScreen />}><PostContent params={params} /></Suspense>;
}

async function PostContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?next=%2Fpost%2F${id}`);

  const [{ data: listing }, { data: need }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, seller_id, title, description, price, condition, meetup_location, moderation_status, created_at, profiles!listings_seller_id_fkey(display_name, campus, avatar_url), categories!listings_category_id_fkey(name), listing_images(storage_path, sort_order)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("need_posts")
      .select("id, requester_id, body, moderation_status, created_at, profiles!need_posts_requester_id_fkey(display_name, campus, avatar_url), categories!need_posts_category_id_fkey(name)")
      .eq("id", id)
      .maybeSingle(),
  ]);

  // A listing and a need could share an id. The listing wins so shared links
  // always resolve to the same post.
  if (!listing && !need) notFound();

  const targetColumn = listing ? "listing_id" : "need_post_id";
  const [{ data: likes }, { data: reposts }, { data: commentRows }, { data: blocks }, { data: viewer }] = await Promise.all([
    supabase.from("social_likes").select("user_id").eq(targetColumn, id),
    supabase.from("social_reposts").select("user_id, created_at").eq(targetColumn, id).order("created_at", { ascending: false }),
    supabase.from("post_comments").select("id, author_id, body, moderation_status, created_at").eq(targetColumn, id).order("created_at", { ascending: true }),
    supabase.from("user_blocks").select("blocked_id").eq("blocker_id", authData.user.id),
    supabase.from("profiles").select("is_admin").eq("id", authData.user.id).maybeSingle(),
  ]);

  const authorIds = [...new Set((commentRows ?? []).map((comment) => comment.author_id))];
  const repostAuthorIds = [...new Set((reposts ?? []).map((repost) => repost.user_id))];
  const profileIds = [...new Set([...authorIds, ...repostAuthorIds])];
  const { data: profiles } = profileIds.length > 0
    ? await supabase.from("profiles").select("id, display_name").in("id", profileIds)
    : { data: [] };
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));

  const comments: PostComment[] = (commentRows ?? []).map((comment) => ({
    id: comment.id,
    body: comment.body,
    authorId: comment.author_id,
    authorName: names.get(comment.author_id) ?? "PUP student",
    moderationStatus: comment.moderation_status,
  }));

  const liked = (likes ?? []).some((like) => like.user_id === authData.user.id);
  const currentUserReposted = (reposts ?? []).some((repost) => repost.user_id === authData.user.id);
  const sharedBy = names.get((reposts ?? [])[0]?.user_id) ?? null;
  const reposted = currentUserReposted ? true : sharedBy;
  const blockedUserIds = (blocks ?? []).map((block) => block.blocked_id);

  const seller = listing ? joinedProfile(listing.profiles as JoinedProfile) : null;
  const requester = need ? joinedProfile(need.profiles as JoinedProfile) : null;
  const author = listing ? seller : requester;
  const authorId = listing ? listing.seller_id : need!.requester_id;
  const authorName = author?.display_name ?? "PUP student";
  const category = joinedCategory((listing ? listing.categories : need!.categories) as JoinedCategory);
  const createdAt = listing ? listing.created_at : need!.created_at;
  const moderationStatus = listing ? listing.moderation_status : need!.moderation_status;

  const imagePath = listing
    ? joinedImages(listing.listing_images as JoinedImage).sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path ?? null
    : null;
  const imageUrl = imagePath ? supabase.storage.from("listing-images").getPublicUrl(imagePath).data.publicUrl : null;

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-[#281d1e]">
      <header className="sticky top-0 z-20 border-b border-[#e8d9c5]/80 bg-[#fbf8f2]/95 backdrop-blur">
        <div className="mx-auto flex h-[64px] max-w-3xl items-center justify-between gap-3 px-5 lg:px-8">
          <Link href="/account" className="text-xs font-bold text-[#7b2432] sm:text-sm">← Marketplace</Link>
          <Link href="/" aria-label="IskoMart home">
            <Image src="/logos/text_logo.png" alt="IskoMart" width={208} height={56} className="h-9 w-32 object-contain sm:h-12 sm:w-44" />
          </Link>
          <Link href="/profile" className="text-xs font-bold text-[#7b2432] sm:text-sm">Profile</Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-8 lg:px-8">
        <article className="rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <AuthorAvatar name={authorName} avatarUrl={author?.avatar_url ?? null} tone={listing ? "gold" : "green"} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-semibold text-[#281d1e]">{authorName}</h1>
                  <ModerationBadge status={moderationStatus} />
                </div>
                <p className="text-xs text-[#a4938d]">
                  {author?.campus ?? "PUP campus"} · {new Date(createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
            <PostMenu
              postId={id}
              isOwner={authorId === authData.user.id}
              listing={Boolean(listing)}
              authorId={authorId}
              authorName={authorName}
              isBlocked={blockedUserIds.includes(authorId)}
              isAdmin={viewer?.is_admin ?? false}
              returnToAccount
            />
          </div>

          {listing ? (
            <>
              <p className="mt-5 whitespace-pre-line text-[15px] leading-7 text-[#45383a]">{listing.description}</p>
              <div className="mt-5 overflow-hidden rounded-2xl bg-[#f5dfb4]">
                {imageUrl ? (
                  <Image src={imageUrl} alt={listing.title} width={640} height={420} className="h-72 w-full object-cover" unoptimized />
                ) : (
                  <div className="flex min-h-44 flex-col justify-between p-6 sm:min-h-52">
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">
                        {category?.name ?? "Other"}
                      </span>
                      <span className="font-serif text-5xl font-bold text-[#7b2432]/20">
                        {listing.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#7b2432]">{listing.title}</h2>
                      <p className="mt-1 text-lg font-bold text-[#281d1e]">₱{Number(listing.price).toLocaleString("en-PH")}</p>
                    </div>
                  </div>
                )}
              </div>
              {imageUrl && (
                <div className="mt-4">
                  <h2 className="font-serif text-2xl font-bold text-[#7b2432]">{listing.title}</h2>
                  <p className="mt-1 text-lg font-bold text-[#281d1e]">₱{Number(listing.price).toLocaleString("en-PH")}</p>
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8b7775]">
                <span className="rounded-full bg-[#f5ead8] px-3 py-1 font-semibold text-[#7b2432]">{category?.name ?? "Other"}</span>
                <span>{listing.condition?.replace("_", " ") ?? "Condition not specified"}</span>
                {listing.meetup_location && <span>· Meet at {listing.meetup_location}</span>}
                {imageUrl && <span className="ml-auto font-bold text-[#7b2432]">₱{Number(listing.price).toLocaleString("en-PH")}</span>}
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-2xl bg-[#d9e2d4] p-5">
              <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold tracking-wider text-[#7b2432] uppercase">
                Looking for · {category?.name ?? "Community"}
              </span>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-7 text-[#45383a]">{need!.body}</p>
            </div>
          )}

          <PostActions
            listingId={listing?.id}
            sellerId={listing?.seller_id}
            needPostId={listing ? undefined : need?.id}
            likeCount={(likes ?? []).length}
            repostCount={(reposts ?? []).length}
            liked={liked}
            reposted={reposted}
            comments={comments}
            currentUserId={authData.user.id}
            blockedUserIds={blockedUserIds}
          />
        </article>

        <p className="mt-6 text-center text-xs leading-5 text-[#a4938d]">
          Meet in a public place on campus and pay in person. Never send money in advance.
        </p>
      </div>
    </main>
  );
}
