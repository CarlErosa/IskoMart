import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/app/engagement-actions";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/login?next=%2Fedit-post%2F${id}`);
  const [{ data: listing }, { data: need }] = await Promise.all([
    supabase.from("listings").select("id, description, seller_id").eq("id", id).maybeSingle(),
    supabase.from("need_posts").select("id, body, requester_id").eq("id", id).maybeSingle(),
  ]);
  const post = listing?.seller_id === auth.user.id
    ? { kind: "listing" as const, body: listing.description }
    : need?.requester_id === auth.user.id
      ? { kind: "need" as const, body: need.body }
      : null;
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-10 text-[#281d1e]">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-6 sm:p-10">
        <Link href="/account" className="text-sm font-semibold text-[#7b2432]">← Back to marketplace</Link>
        <p className="mt-8 text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Edit post</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-[#7b2432] sm:text-4xl">Update your post</h1>
        <form action={updatePost} className="mt-8 space-y-4">
          <input type="hidden" name={post.kind === "listing" ? "listingId" : "needPostId"} value={id} />
          <textarea name="body" defaultValue={post.body} required minLength={3} maxLength={post.kind === "listing" ? 5000 : 500} className="min-h-48 w-full resize-y rounded-2xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 text-sm leading-6 outline-none focus:border-[#7b2432]" />
          <button type="submit" className="w-full rounded-full bg-[#7b2432] px-5 py-3 font-bold text-white">Save changes</button>
        </form>
      </div>
    </main>
  );
}
