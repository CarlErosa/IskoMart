export default function ModerationBadge({ status }: { status?: string | null }) {
  if (!status || status === "visible") return null;

  const label = status === "flagged"
    ? "Under review"
    : status === "hidden"
      ? "Hidden from others"
      : status === "removed"
        ? "Removed by moderator"
        : "Under review";

  const tone = status === "flagged"
    ? "bg-[#f5ead8] text-[#8a5a00]"
    : status === "removed"
      ? "bg-[#eee7e2] text-[#69595a]"
      : "bg-[#f7e5e3] text-[#7b2432]";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${tone}`}>
      {label}
    </span>
  );
}
