import { useEffect, useMemo, useState } from "react";

import { getKnowledgeStarMap } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import GalaxyControls from "../components/galaxy/GalaxyControls.jsx";
import GalaxyLegend from "../components/galaxy/GalaxyLegend.jsx";
import GalaxyMiniMap from "../components/galaxy/GalaxyMiniMap.jsx";
import GalaxySidePanel from "../components/galaxy/GalaxySidePanel.jsx";
import KnowledgeGalaxyCanvas from "../components/galaxy/KnowledgeGalaxyCanvas.jsx";
import WebGLFallback from "../components/galaxy/WebGLFallback.jsx";
import { useAppData } from "../context/AppDataContext.jsx";

function supportsWebGL() {
  // 三维星图依赖 WebGL，检测失败时显示 2D 兜底页面。
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export default function KnowledgeGalaxyPage() {
  // 星图把知识点、前置关系、资源、测验和风险汇总成一个可漫游的三维视图。
  const { selectedLevel, setSelectedLevel, learningMap, refreshAll } = useAppData();
  const { showToast } = useToast();
  const [starMap, setStarMap] = useState({ courses: [], nodes: [], links: [] });
  const [selectedStar, setSelectedStar] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [webglError, setWebglError] = useState("");
  const canUseWebGL = useMemo(() => supportsWebGL(), []);

  async function loadStarMap() {
    setLoading(true);
    try {
      const data = await getKnowledgeStarMap();
      setStarMap(data);
      const selected = data.nodes?.find((node) => node.id === selectedLevel?.id) || data.nodes?.find((node) => node.type === "boss") || data.nodes?.[0] || null;
      setSelectedStar((current) => data.nodes?.find((node) => node.id === current?.id) || selected);
      if (!flyTarget && selected) setFlyTarget({ ...selected, nonce: Date.now() });
    } catch (error) {
      showToast(error?.response?.data?.detail || "知识星图加载失败。", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStarMap();
  }, []);

  useEffect(() => {
    if (!selectedLevel?.id || !starMap.nodes?.length) return;
    const node = starMap.nodes.find((item) => item.id === selectedLevel.id);
    if (node) setSelectedStar(node);
  }, [selectedLevel?.id, starMap.nodes]);

  function selectNode(node) {
    // 点击星体会同步全局 selectedLevel，后续资源、AI 导师和专注页都能接着使用。
    setSelectedStar(node);
    setSelectedLevel(learningMap.find((item) => item.id === node.id) || node);
  }

  async function reloadAfterAction() {
    await refreshAll();
    await loadStarMap();
  }

  function flyTo(node, toastText = "") {
    if (!node) return;
    selectNode(node);
    setFlyTarget({ ...node, nonce: Date.now() });
    if (toastText) showToast(toastText, "success");
  }

  function flyToCurrent() {
    const node = starMap.nodes.find((item) => item.id === selectedLevel?.id) || selectedStar;
    flyTo(node, node ? `已飞到 ${node.title}` : "");
  }

  function flyToBoss() {
    flyTo(starMap.nodes.find((item) => item.type === "boss" && item.status === "boss") || starMap.nodes.find((item) => item.type === "boss"));
  }

  function flyToWeak() {
    flyTo([...starMap.nodes].filter((item) => item.unlocked).sort((a, b) => a.mastery - b.mastery)[0]);
  }

  function flyToRisk() {
    flyTo([...starMap.nodes].sort((a, b) => b.risk - a.risk)[0]);
  }

  if (!canUseWebGL || webglError) return <WebGLFallback reason={webglError} />;

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 p-4 shadow-[0_0_80px_rgba(34,211,238,.10)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_75%_30%,rgba(168,85,247,.16),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(244,63,94,.12),transparent_34%)]" />

      <div className="relative z-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-950/72 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/70">Knowledge Galaxy</p>
            <h1 className="mt-2 text-3xl font-black text-white">Knowledge Galaxy · 知识星图</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              把课程、章节、知识点、前置关系、资源和测验记录放进同一片可漫游的三维学习星系。
            </p>
          </div>

          <div className="relative min-h-[680px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70">
            {loading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center text-slate-300">正在生成知识星系...</div>
            ) : (
              <KnowledgeGalaxyCanvas
                nodes={starMap.nodes}
                links={starMap.links}
                selectedNode={selectedStar}
                flyTarget={flyTarget}
                filter={filter}
                onSelectNode={selectNode}
                onError={setWebglError}
              />
            )}
          </div>

          <GalaxyControls
            filter={filter}
            setFilter={setFilter}
            onFlyCurrent={flyToCurrent}
            onFlyBoss={flyToBoss}
            onFlyWeak={flyToWeak}
            onFlyRisk={flyToRisk}
            disabled={!starMap.nodes.length}
          />

          <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
            <GalaxyMiniMap nodes={starMap.nodes} selectedNode={selectedStar} onSelect={(node) => flyTo(node)} />
            <GalaxyLegend />
          </div>
        </div>

        <div className="min-w-0 xl:sticky xl:top-4 xl:self-start">
          <GalaxySidePanel node={selectedStar} onClose={() => setSelectedStar(null)} onCompleted={reloadAfterAction} setSelectedLevel={setSelectedLevel} />
        </div>
      </div>
    </section>
  );
}
