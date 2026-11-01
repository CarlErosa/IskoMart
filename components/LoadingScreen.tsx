import Image from "next/image";

export default function LoadingScreen() {
  return (
    <main className="loading-screen flex min-h-screen items-center justify-center px-5">
      <div className="flex w-full max-w-xs flex-col items-center">
        <Image
          src="/logos/logo-removebg-preview.png"
          alt="IskoMart"
          width={112}
          height={64}
          priority
          className="loading-logo h-32 w-64 object-contain"
        />
        <div
          aria-label="Loading"
          className="mt-7 h-1 w-52 overflow-hidden rounded-full bg-[#ead9bd]"
          role="progressbar"
        >
          <div className="loading-bar h-full w-2/5 rounded-full bg-[#7b2432]" />
        </div>
      </div>
    </main>
  );
}
