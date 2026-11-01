import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";
import AuthForm from "./AuthForm";

export default function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ "check-email"?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthContent({
  searchParams,
}: {
  searchParams: Promise<{ "check-email"?: string; error?: string }>;
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
      mode="sign-up"
      showCheckEmail={params["check-email"] === "1"}
      callbackError={callbackError}
    />
  );
}

function AuthLoading() {
  return <LoadingScreen />;
}
