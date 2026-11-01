import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SellForm from "./SellForm";

export default async function SellPage() {
  const supabase = await createClient();
  const [{ data: userData }, { data: categories, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("categories").select("id, name").order("name"),
  ]);
  if (!userData.user) redirect("/login?next=%2Fsell");
  if (error) throw new Error("Unable to load listing categories.");

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e] sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/account" className="text-sm font-semibold text-[#7b2432]">← Back to marketplace</Link>
        <div className="mt-8 rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-6 shadow-[0_20px_60px_rgba(123,36,50,0.07)] sm:p-10">
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#b07b1d] uppercase">Sell on IskoMart</p>
          <h1 className="mt-2 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">Give your item a good home.</h1>
          <p className="mt-3 text-sm leading-6 text-[#8b7775]">Add the details your fellow Iskolars need to decide. Listings appear in the marketplace feed after you publish.</p>
          <div className="mt-8"><SellForm categories={categories ?? []} /></div>
        </div>
      </div>
    </main>
  );
}
