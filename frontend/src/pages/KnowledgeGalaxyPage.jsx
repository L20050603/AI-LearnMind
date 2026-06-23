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
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

export default function KnowledgeGalaxyPage() {
  const { selectedLevel, setSelectedLevel, learningMap, refreshAll } = useAppData();
  const { showToast } = useToast();
  const [starMap, setStarMap] = useState({ courses: [], nodes: [], links: [] });
  const [selectedStar, setSelectedStar] = useState(null);
  const [focusNode, setFocusNode] = useState(null);
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
      setFocusNode(selected);
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
    if (node) {
      setSelectedStar(node);
      setFocusNode(node);
    }
  }, [selectedLevel?.id, starMap.nodes]);

  function selectNode(node) {
    setSelectedStar(node);
    setFocusNode(node);
    setSelectedLevel(learningMap.find((item) => item.id === node.id) || node);
  }

  async function reloadAfterAction() {
    await refreshAll();
    await loadStarMap();
  }

  function flyToCurrent() {
    const node = starMap.nodes.find((item) => item.id === selectedLevel?.id) || selectedStar;
    if (node) {
      selectNode(node);
      showToast(`已飞到 ${node.title}`, "success");
    }
  }

  function flyToBoss() {
    const node = starMap.nodes.find((item) => item.type === "boss" && item.status === "boss") || starMap.nodes.find((item) => item.type === "boss");
    if (node) selectNode(node);
  }

  function flyToWeak() {
    const node = [...starMap.nodes].filter((item) => item.unlocked).sort((a, b) => a.mastery - b.mastery)[0];
    if (node) selectNode(node);
  }

  function flyToRisk() {
    const node = [...starMap.nodes].sort((a, b) => b.risk - a.risk)[0];
    if (node) selectNode(node);
  }

  if (!canUseWebGL || webglError) return <WebGLFallback reason={webglError} />;

  return (
    <section className="relative min-h-[1180px] overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-[0_0_80px_rgba(34,211,238,.10)] md:min-h-[calc(100vh-104px)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,.18),transparent_30%),radial-gradient(circle_at_75%_30%,rgba(168,85,247,.16),transparent_32%),radial-gradient(circle_at_60%_80%,rgba(244,63,94,.12),transparent_34%)]" />

      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-slate-300">正在生成知识星系...</div>
      ) : (
        <KnowledgeGalaxyCanvas
          nodes={starMap.nodes}
          links={starMap.links}
          selectedNode={selectedStar}
          focusNode={focusNode}
          filter={filter}
          onSelectNode={selectNode}
          onError={setWebglError}
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-3 xl:flex-row xl:items-start xl:justify-between xl:gap-4 xl:p-4">
        <div className="pointer-events-auto max-w-2xl rounded-3xl border border-white/10 bg-slate-950/72 p-4 backdrop-blur-xl xl:p-5">
          <p className="text-xs uppercase tracking-[0.34em] text-cyan-200/70">Knowledge Galaxy</p>
          <h1 className="mt-2 text-3xl font-black text-white">Knowledge Galaxy · 知识星图</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            把课程、章节、知识点、前置关系、资源和测验记录放进同一片可漫游的三维学习星系。
          </p>
        </div>
        <GalaxySidePanel node={selectedStar} onClose={() => setSelectedStar(null)} onCompleted={reloadAfterAction} setSelectedLevel={setSelectedLevel} />
      </div>

      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-20 hidden max-h-[44vh] gap-3 overflow-y-auto pr-1 modal-scrollbar md:grid xl:bottom-4 xl:left-4 xl:right-4 xl:max-h-none xl:grid-cols-[minmax(0,1fr)_250px_250px] xl:gap-4 xl:overflow-visible xl:pr-0">
        <GalaxyControls
          filter={filter}
          setFilter={setFilter}
          onFlyCurrent={flyToCurrent}
          onFlyBoss={flyToBoss}
          onFlyWeak={flyToWeak}
          onFlyRisk={flyToRisk}
          disabled={!starMap.nodes.length}
        />
        <GalaxyMiniMap nodes={starMap.nodes} selectedNode={selectedStar} onSelect={selectNode} />
        <GalaxyLegend />
      </div>
    </section>
  );
}
