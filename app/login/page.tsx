import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AuthForm from "@/app/auth/AuthForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const params = await searchParams;
  const callbackError =
    params.error === "verification-failed"
      ? "Your verification link is invalid or has expired."
      : params.error === "profile-creation-failed"
        ? "Your account was verified, but your profile could not be created. Please try signing in again."
        : params.error === "missing-code"
          ? "The verification link is incomplete. Please request a new one."
          : undefined;

  return (
    <AuthForm
      mode="sign-in"
      showVerified={params.verified === "1"}
      callbackError={callbackError}
    />
  );
}

function LoginLoading() {
  return <LoadingScreen />;
}
