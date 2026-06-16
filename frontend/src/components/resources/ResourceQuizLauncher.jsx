export default function ResourceQuizLauncher({ selectedResource, onLaunch, busy }) {
  if (!selectedResource) return null;
  return (
    <div className="glass-panel p-4">
      <h3 className="font-semibold text-white">从资源生成测验</h3>
      <p className="mt-2 text-sm text-slate-300">{selectedResource.title}</p>
      <button type="button" onClick={() => onLaunch(selectedResource)} disabled={busy} className="primary-submit mt-4 max-w-xs">{busy ? "生成中..." : "生成并进入测验"}</button>
    </div>
  );
}
