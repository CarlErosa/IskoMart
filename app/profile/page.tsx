import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoadingScreen from "@/components/LoadingScreen";
import ProfileSocial from "./ProfileSocial";

type JoinedProfile = { display_name: string } | { display_name: string }[] | null;

function joinedName(profile: JoinedProfile) {
  const row = Array.isArray(profile) ? profile[0] : profile;
  return row?.display_name ?? "Iskolar";
}

export default function ProfilePage() {
  return <Suspense fallback={<LoadingScreen />}><ProfileContent /></Suspense>;
}

async function ProfileContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=%2Fprofile");
  const [{ data: profile, error: profileError }, { data: listings, error: listingsError }, { data: needs, error: needsError }, { data: likes, error: likesError }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, header_url, bio").eq("id", data.user.id).maybeSingle(),
    supabase.from("listings").select("id, title, description, price, created_at").eq("seller_id", data.user.id).order("created_at", { ascending: false }),
    supabase.from("need_posts").select("id, body, created_at").eq("requester_id", data.user.id).order("created_at", { ascending: false }),
    supabase.from("social_likes").select("listing_id, need_post_id").eq("user_id", data.user.id).order("created_at", { ascending: false }),
  ]);
  if (profileError || listingsError || needsError || likesError) throw new Error("Unable to load your profile.");

  const likedListingIds = (likes ?? [])
    .map((like) => like.listing_id)
    .filter((id): id is string => Boolean(id));
  const likedNeedIds = (likes ?? [])
    .map((like) => like.need_post_id)
    .filter((id): id is string => Boolean(id));

  const [{ data: likedListings, error: likedListingsError }, { data: likedNeeds, error: likedNeedsError }] = await Promise.all([
    likedListingIds.length > 0
      ? supabase
        .from("listings")
        .select("id, title, description, price, profiles!listings_seller_id_fkey(display_name)")
        .in("id", likedListingIds)
      : Promise.resolve({ data: [], error: null }),
    likedNeedIds.length > 0
      ? supabase
        .from("need_posts")
        .select("id, body, profiles!need_posts_requester_id_fkey(display_name)")
        .in("id", likedNeedIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (likedListingsError || likedNeedsError) throw new Error("Unable to load the posts you liked.");

  const likedListingMap = new Map((likedListings ?? []).map((item) => [item.id, item]));
  const likedNeedMap = new Map((likedNeeds ?? []).map((item) => [item.id, item]));

  const posts = [
    ...(listings ?? []).map((item) => ({ id: item.id, kind: "listing" as const, title: item.title, body: item.description, meta: "Marketplace", price: Number(item.price) })),
    ...(needs ?? []).map((item) => ({ id: item.id, kind: "need" as const, title: "Looking for something", body: item.body, meta: "Community" })),
  ];

  // Liked posts belong to other people, so load them by id and keep the most
  // recent like first. RLS still hides anything that is no longer visible.
  const likedPosts: {
    id: string;
    kind: "listing" | "need";
    title: string;
    body: string;
    meta: string;
    price?: number;
  }[] = [];

  for (const like of likes ?? []) {
    if (like.listing_id) {
      const item = likedListingMap.get(like.listing_id);
      if (item) {
        likedPosts.push({
          id: item.id,
          kind: "listing",
          title: item.title,
          body: item.description,
          meta: `Marketplace · ${joinedName(item.profiles)}`,
          price: Number(item.price),
        });
      }
      continue;
    }

    if (like.need_post_id) {
      const item = likedNeedMap.get(like.need_post_id);
      if (item) {
        likedPosts.push({
          id: item.id,
          kind: "need",
          title: "Looking for something",
          body: item.body,
          meta: `Community · ${joinedName(item.profiles)}`,
        });
      }
    }
  }

  return <ProfileSocial displayName={profile?.display_name ?? "Iskolar"} avatarUrl={profile?.avatar_url ?? null} headerUrl={profile?.header_url ?? null} bio={profile?.bio ?? null} posts={posts} likedPosts={likedPosts} />;
}
