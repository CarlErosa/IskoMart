import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import UpdatePasswordForm from "./UpdatePasswordForm";

export const metadata = {
  title: "Choose a new password — IskoMart",
};

export default async function ResetPasswordPage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth/reset?expired=1");

  return (
    <main className="min-h-screen bg-[#fbf8f2] px-4 py-6 text-[#281d1e] sm:px-5 sm:py-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-4">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </div>
      <Link href="/" className="mx-auto mt-3 block w-fit sm:mt-0">
        <Image
          src="/logos/logo-removebg-preview.png"
          alt="IskoMart"
          width={112}
          height={64}
          priority
          className="h-16 w-28 object-contain sm:h-20 sm:w-36"
        />
      </Link>
      <section className="mx-auto mt-5 max-w-md rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-5 shadow-[8px_8px_0_#f1dfbd] sm:mt-8 sm:p-9">
        <p className="text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">
          Account recovery
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] text-[#7b2432] sm:text-4xl">
          Choose a new password.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#69595a]">
          Use at least 8 characters. You&apos;ll be signed in after saving.
        </p>

        <UpdatePasswordForm />
      </section>
    </main>
  );
}
