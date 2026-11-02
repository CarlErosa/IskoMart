import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoadingScreen from "@/components/LoadingScreen";
import MarketplaceFeed from "./MarketplaceFeed";

export default function AccountPage() {
  return <Suspense fallback={<LoadingScreen />}><AccountContent /></Suspense>;
}

async function AccountContent() {
  await connection();
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  const [{ data: profile }, { data: listings, error: listingsError }, { data: needs, error: needsError }, { data: categories, error: categoriesError }, { data: likes, error: likesError }, { data: reposts, error: repostsError }, { data: commentRows, error: commentsError }] = await Promise.all([
    supabase.from("profiles").select("display_name, avatar_url, is_admin").eq("id", authData.user.id).maybeSingle(),
    supabase.from("listings").select("id, seller_id, title, description, price, condition, meetup_location, created_at, profiles!listings_seller_id_fkey(display_name, campus, avatar_url), categories!listings_category_id_fkey(name), listing_images(storage_path, sort_order)").eq("is_available", true).order("created_at", { ascending: false }),
    supabase.from("need_posts").select("id, requester_id, body, created_at, profiles!need_posts_requester_id_fkey(display_name, campus, avatar_url), categories!need_posts_category_id_fkey(name)").order("created_at", { ascending: false }),
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("social_likes").select("user_id, listing_id, need_post_id"),
    supabase.from("social_reposts").select("user_id, listing_id, need_post_id, created_at").order("created_at", { ascending: false }),
    supabase.from("post_comments").select("id, author_id, body, listing_id, need_post_id, created_at").order("created_at", { ascending: true }),
  ]);
  if (listingsError || needsError || categoriesError || likesError || repostsError || commentsError) throw new Error("Unable to load marketplace feed.");
  const commentAuthorIds = [...new Set((commentRows ?? []).map((comment) => comment.author_id))];
  const { data: commentAuthors } = commentAuthorIds.length > 0
    ? await supabase.from("profiles").select("id, display_name").in("id", commentAuthorIds)
    : { data: [] };
  const commentNames = new Map((commentAuthors ?? []).map((author) => [author.id, author.display_name]));
  const repostAuthorIds = [...new Set((reposts ?? []).map((repost) => repost.user_id))];
  const { data: repostAuthors } = repostAuthorIds.length > 0
    ? await supabase.from("profiles").select("id, display_name").in("id", repostAuthorIds)
    : { data: [] };
  const repostNames = new Map((repostAuthors ?? []).map((author) => [author.id, author.display_name]));

  const feedListings = (listings ?? []).map((listing) => {
    const seller = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles;
    const listingCategory = Array.isArray(listing.categories) ? listing.categories[0] : listing.categories;
    const listingImages = Array.isArray(listing.listing_images) ? listing.listing_images : listing.listing_images ? [listing.listing_images] : [];
    const coverPath = listingImages.sort((a, b) => a.sort_order - b.sort_order)[0]?.storage_path ?? null;
    const imageUrl = coverPath ? supabase.storage.from("listing-images").getPublicUrl(coverPath).data.publicUrl : null;
    const listingLikes = (likes ?? []).filter((like) => like.listing_id === listing.id);
    const listingReposts = (reposts ?? []).filter((repost) => repost.listing_id === listing.id);
    const repostedByCurrentUser = listingReposts.some((repost) => repost.user_id === authData.user.id);
    const sharedBy = repostNames.get(listingReposts[0]?.user_id) ?? null;
    return { id: listing.id, sellerId: listing.seller_id, title: listing.title, description: listing.description, price: Number(listing.price), condition: listing.condition, meetupLocation: listing.meetup_location, imageUrl, avatarUrl: seller?.avatar_url ?? null, sellerName: seller?.display_name ?? "PUP student", campus: seller?.campus ?? null, category: listingCategory?.name ?? "Other", createdAt: listing.created_at, likeCount: listingLikes.length, repostCount: listingReposts.length, liked: listingLikes.some((like) => like.user_id === authData.user.id), reposted: repostedByCurrentUser ? true : sharedBy, sharedBy, comments: (commentRows ?? []).filter((comment) => comment.listing_id === listing.id).map((comment) => ({ id: comment.id, body: comment.body, authorName: commentNames.get(comment.author_id) ?? "PUP student" })) };
  });
  const feedNeeds = (needs ?? []).map((need) => {
    const requester = Array.isArray(need.profiles) ? need.profiles[0] : need.profiles;
    const needCategory = Array.isArray(need.categories) ? need.categories[0] : need.categories;
    const needLikes = (likes ?? []).filter((like) => like.need_post_id === need.id);
    const needReposts = (reposts ?? []).filter((repost) => repost.need_post_id === need.id);
    return {
      id: need.id,
      requesterId: need.requester_id,
      body: need.body,
      requesterName: requester?.display_name ?? "PUP student",
      avatarUrl: requester?.avatar_url ?? null,
      campus: requester?.campus ?? null,
      category: needCategory?.name ?? "Looking for",
      createdAt: need.created_at,
      likeCount: needLikes.length,
      repostCount: needReposts.length,
      liked: needLikes.some((like) => like.user_id === authData.user.id),
      reposted: needReposts.some((repost) => repost.user_id === authData.user.id) ? true : repostNames.get(needReposts[0]?.user_id) ?? null,
      sharedBy: null,
      comments: (commentRows ?? []).filter((comment) => comment.need_post_id === need.id).map((comment) => ({ id: comment.id, body: comment.body, authorName: commentNames.get(comment.author_id) ?? "PUP student" })),
    };
  });
  return <MarketplaceFeed displayName={profile?.display_name ?? "Iskolar"} avatarUrl={profile?.avatar_url ?? null} isAdmin={profile?.is_admin ?? false} currentUserId={authData.user.id} listings={feedListings} needs={feedNeeds} categories={(categories ?? []).map((category) => ({ id: category.id, name: category.name }))} />;
}
