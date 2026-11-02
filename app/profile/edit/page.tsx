import ProfileForm from "@/app/profile/ProfileForm";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import LoadingScreen from "@/components/LoadingScreen";

export default async function EditProfilePage() {
  return <Suspense fallback={<LoadingScreen />}><EditProfileContent /></Suspense>;
}

async function EditProfileContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?next=%2Fprofile%2Fedit");
  const { data: profile, error } = await supabase.from("profiles").select("display_name, avatar_url, header_url, bio").eq("id", data.user.id).maybeSingle();
  if (error) throw new Error(`Unable to load your profile: ${error.message}`);
  return <ProfileForm userId={data.user.id} displayName={profile?.display_name ?? "Iskolar"} avatarUrl={profile?.avatar_url ?? null} headerUrl={profile?.header_url ?? null} bio={profile?.bio ?? null} />;
}
