"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PRIVACY_NOTICE_VERSION } from "@/lib/legal/consent";
import { signIn, signUp, type AuthActionState } from "./actions";

const initialState: AuthActionState = {};

export default function AuthForm({
  mode: initialMode,
  showCheckEmail = false,
  showVerified = false,
  callbackError,
}: {
  mode: "sign-in" | "sign-up";
  showCheckEmail?: boolean;
  showVerified?: boolean;
  callbackError?: string;
}) {
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const isSignUp = initialMode === "sign-up";
  const state = isSignUp ? signUpState : signInState;
  const isPending = isSignUp ? signUpPending : signInPending;

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
          Community access
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold tracking-[-0.04em] text-[#7b2432] sm:text-4xl">
          {isSignUp ? "Join the IskoMart community." : "Welcome back, Iskolar."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#69595a]">
          {isSignUp
            ? "Create your account with your personal Gmail address to buy and sell on campus."
            : "Sign in with your verified Gmail address to continue."}
        </p>

        {showCheckEmail && (
          <p className="mt-5 rounded-xl bg-[#f5ead8] px-4 py-3 text-sm leading-6 text-[#7b2432]">
            Check your Gmail inbox, Spam, or Promotions tab to verify your email. After confirming, you&apos;ll be sent to the login page.
          </p>
        )}
        {showVerified && (
          <p className="mt-5 rounded-xl bg-[#e4efdf] px-4 py-3 text-sm leading-6 text-[#345b36]">
            Your email is confirmed. Sign in to continue to IskoMart.
          </p>
        )}
        {(state.error || callbackError) && (
          <p role="alert" className="mt-5 rounded-xl bg-[#f7dfda] px-4 py-3 text-sm leading-6 text-[#7b2432]">
            {state.error ?? callbackError}
          </p>
        )}

        <form action={isSignUp ? signUpAction : signInAction} className="mt-7 space-y-4">
          {isSignUp && (
            <label className="block text-sm font-semibold text-[#69595a]">
              Name
              <input
                name="displayName"
                required
                autoComplete="name"
                className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30"
                placeholder="Juan Dela Cruz"
              />
            </label>
          )}
          <label className="block text-sm font-semibold text-[#69595a]">
            Gmail address
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30"
              placeholder="you@gmail.com"
            />
          </label>
          <label className="block text-sm font-semibold text-[#69595a]">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-2 w-full rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] px-4 py-3 font-normal outline-none transition focus:border-[#7b2432] focus:ring-2 focus:ring-[#d3a445]/30"
              placeholder="At least 8 characters"
            />
          </label>
          {isSignUp && (
            <div className="flex items-start gap-3 rounded-xl border border-[#e8d9c5] bg-[#fbf8f2] p-3">
              <input
                id="privacyConsent"
                name="privacyConsent"
                type="checkbox"
                required
                value="on"
                className="mt-0.5 size-4 shrink-0 accent-[#7b2432]"
              />
              <label htmlFor="privacyConsent" className="text-xs leading-5 text-[#69595a]">
                I have read and consent to the{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#7b2432] underline decoration-[#d3a445] underline-offset-2"
                >
                  Privacy Policy
                </Link>{" "}
                (version {PRIVACY_NOTICE_VERSION}). I understand how IskoMart collects, uses, and retains
                my data.
              </label>
            </div>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-[#7b2432] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#641d29] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Please wait..." : isSignUp ? "Create my account" : "Sign in"}
          </button>
        </form>

        <Link
          href={isSignUp ? "/login" : "/auth"}
          className="mt-6 block w-full text-center text-sm text-[#69595a] underline decoration-[#d3a445] underline-offset-4"
        >
          {isSignUp ? "Already have an account? Sign in" : "New to IskoMart? Create an account"}
        </Link>
      </section>
    </main>
  );
}
