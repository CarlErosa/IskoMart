"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
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
    <main className="min-h-screen bg-[#fbf8f2] px-5 py-8 text-[#281d1e]">
      <Link href="/" className="mx-auto block w-fit">
        <Image
          src="/logos/logo-removebg-preview.png"
          alt="IskoMart"
          width={112}
          height={64}
          priority
          className="h-20 w-36 object-contain"
        />
      </Link>
      <section className="mx-auto mt-8 max-w-md rounded-3xl border border-[#e8d9c5] bg-[#fffdf8] p-7 shadow-[8px_8px_0_#f1dfbd] sm:p-9">
        <p className="text-xs font-bold tracking-[0.2em] text-[#b07b1d] uppercase">
          Community access
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-[-0.04em] text-[#7b2432]">
          {isSignUp ? "Join the IskoMart community." : "Welcome back, Iskolar."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#69595a]">
          {isSignUp
            ? "Create your account with your personal Gmail address to buy and sell on campus."
            : "Sign in with your verified Gmail address to continue."}
        </p>

        {showCheckEmail && (
          <p className="mt-5 rounded-xl bg-[#f5ead8] px-4 py-3 text-sm leading-6 text-[#7b2432]">
            Check your Gmail inbox to verify your email. After confirming, you&apos;ll be sent to the login page.
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
