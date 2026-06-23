import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addResourceToPlan,
  crawlResource,
  generateResourceCard,
  generateResourceQuiz,
  getTodayResourceRecommendations,
  listResources,
  searchResources,
  toggleResourceFavorite,
} from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import ResourceCard from "../components/resources/ResourceCard.jsx";
import ResourceCrawlerPanel from "../components/resources/ResourceCrawlerPanel.jsx";
import ResourceLearningCard from "../components/resources/ResourceLearningCard.jsx";
import ResourceQuizLauncher from "../components/resources/ResourceQuizLauncher.jsx";
import ResourceRecommendationPanel from "../components/resources/ResourceRecommendationPanel.jsx";
import ResourceSearchBox from "../components/resources/ResourceSearchBox.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function ResourceHunter() {
  const navigate = useNavigate();
  const { selectedLevel, setSelectedLevel, learningMap, refreshAll, dashboard } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    query: "",
    course: "操作系统",
    goal: dashboard?.student?.goal || "期末复习",
    resourceTypes: ["article", "exercise", "quiz"],
  });
  const [resources, setResources] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [queryList, setQueryList] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [learningCard, setLearningCard] = useState(null);
  const [busy, setBusy] = useState("");

  async function loadInitialData() {
    const [allResources, todayRecommendations] = await Promise.all([listResources(), getTodayResourceRecommendations()]);
    setResources(allResources || []);
    setRecommendations(todayRecommendations || []);
    setSelectedResource((current) => current || allResources?.[0] || todayRecommendations?.[0] || null);
  }

  async function runSearch() {
    setBusy("search");
    try {
      const result = await searchResources({
        knowledgePointId: selectedLevel?.id,
        course: form.course,
        goal: form.goal,
        resourceTypes: form.resourceTypes,
        query: form.query,
        limit: 8,
      });
      setResources(result.resources || []);
      setQueryList(result.queryList || []);
      setSelectedResource(result.resources?.[0] || null);
      showToast(`找到 ${result.resources?.length || 0} 条学习资源。`, "success");
      await loadInitialData();
    } catch (error) {
      showToast(error?.response?.data?.detail || "资源搜索失败，请检查后端服务。", "error");
    } finally {
      setBusy("");
    }
  }

  async function handleFavorite(resource) {
    try {
      const updated = await toggleResourceFavorite(resource.id);
      setResources((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedResource((current) => (current?.id === updated.id ? updated : current));
      showToast(updated.is_favorite ? "资源已收藏。" : "已取消收藏。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "收藏操作失败。", "error");
    }
  }

  async function handleAddPlan(resource) {
    try {
      await addResourceToPlan(resource.id);
      showToast("资源已加入今日计划，并创建了学习任务。", "success");
      await refreshAll();
      await loadInitialData();
    } catch (error) {
      showToast(error?.response?.data?.detail || "加入今日计划失败。", "error");
    }
  }

  async function handleCard(resource) {
    try {
      const card = await generateResourceCard(resource.id);
      setLearningCard(card);
      setSelectedResource(resource);
      showToast("学习卡片已生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "生成学习卡片失败。", "error");
    }
  }

  async function handleQuiz(resource) {
    setBusy("quiz");
    try {
      const result = await generateResourceQuiz(resource.id);
      showToast("资源测验已生成，正在进入答题页。", "success");
      navigate(`/quiz/${result.quizId}`);
    } catch (error) {
      showToast(error?.response?.data?.detail || "生成测验失败。", "error");
    } finally {
      setBusy("");
    }
  }

  async function handleCrawl(url) {
    setBusy("crawl");
    try {
      const resource = await crawlResource({ url, knowledgePointId: selectedLevel?.id });
      setResources((items) => [resource, ...items]);
      setSelectedResource(resource);
      showToast("URL 摘要抓取成功。", "success");
      await refreshAll();
    } catch (error) {
      showToast(error?.response?.data?.detail || "URL 抓取失败。", "error");
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    loadInitialData().catch(() => {
      setResources([]);
      setRecommendations([]);
    });
  }, []);

  useEffect(() => {
    if (dashboard?.student?.goal) setForm((current) => ({ ...current, goal: dashboard.student.goal }));
  }, [dashboard?.student?.goal]);

  return (
    <PageContainer
      eyebrow="资源检索中心"
      title="学习资源猎手"
      description="围绕当前关卡搜索、收藏、抓取和规划学习资源，并从资源直接生成可评分测验。"
    >
      <div className="glass-panel p-5">
        <p className="text-sm text-slate-400">当前关卡</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{selectedLevel?.title || "尚未选择关卡"}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          {selectedLevel?.strategy || "请先在学习地图或下方选择知识点，再搜索对应学习资源。"}
        </p>
      </div>

      <ResourceSearchBox
        selectedLevel={selectedLevel}
        learningMap={learningMap}
        setSelectedLevel={setSelectedLevel}
        form={form}
        setForm={setForm}
        onSearch={runSearch}
        busy={busy === "search"}
      />

      {!!queryList.length && (
        <div className="glass-panel p-4">
          <p className="mb-2 text-sm font-semibold text-cyan-100">系统生成的检索查询</p>
          <div className="flex flex-wrap gap-2">
            {queryList.map((query) => (
              <span key={query} className="rounded-full border border-cyan-200/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">
                {query}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onFavorite={handleFavorite}
              onAddPlan={handleAddPlan}
              onCard={handleCard}
              onQuiz={handleQuiz}
              onSelect={setSelectedResource}
            />
          ))}
          {!resources.length && (
            <div className="glass-panel p-8 text-center text-slate-400 md:col-span-2">
              还没有资源结果。选择知识点后点击“搜索资源”，系统会保存资源并生成推荐。
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ResourceRecommendationPanel items={recommendations} onSelect={setSelectedResource} />
          <ResourceCrawlerPanel onCrawl={handleCrawl} busy={busy === "crawl"} />
          <ResourceQuizLauncher selectedResource={selectedResource} onLaunch={handleQuiz} busy={busy === "quiz"} />
        </div>
      </div>

      <ResourceLearningCard card={learningCard} />
    </PageContainer>
  );
}
