export default function ResourceScoreBadge({ score = 0, label = "质量" }) {
  const tone = score >= 85 ? "text-emerald-100 bg-emerald-400/15 border-emerald-200/25" : score >= 70 ? "text-cyan-100 bg-cyan-400/15 border-cyan-200/25" : "text-amber-100 bg-amber-400/15 border-amber-200/25";
  return <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{label} {score}</span>;
}
