import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoadingScreen from "@/components/LoadingScreen";
import ProfileSocial from "./ProfileSocial";

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
  const posts = [
    ...(listings ?? []).map((item) => ({ id: item.id, kind: "listing" as const, title: item.title, body: item.description, meta: "Marketplace", price: Number(item.price) })),
    ...(needs ?? []).map((item) => ({ id: item.id, kind: "need" as const, title: "Looking for something", body: item.body, meta: "Community" })),
  ];
  const likedListingIds = (likes ?? []).map((like) => like.listing_id).filter(Boolean);
  const likedNeedIds = (likes ?? []).map((like) => like.need_post_id).filter(Boolean);
  const likedPosts = posts.filter((post) => (post.kind === "listing" ? likedListingIds.includes(post.id) : likedNeedIds.includes(post.id)));
  return <ProfileSocial displayName={profile?.display_name ?? "Iskolar"} avatarUrl={profile?.avatar_url ?? null} headerUrl={profile?.header_url ?? null} bio={profile?.bio ?? null} posts={posts} likedPosts={likedPosts} />;
}
