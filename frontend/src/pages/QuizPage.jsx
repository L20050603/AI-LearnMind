import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getQuiz, getQuizHistory, submitQuiz } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import QuizHistoryPanel from "../components/quiz/QuizHistoryPanel.jsx";
import QuizPanel from "../components/quiz/QuizPanel.jsx";
import QuizResultPanel from "../components/quiz/QuizResultPanel.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function QuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { refreshAll } = useAppData();
  const { showToast } = useToast();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);

  async function loadQuiz() {
    const [quizData, historyData] = await Promise.all([getQuiz(quizId), getQuizHistory()]);
    setQuiz(quizData);
    setHistory(historyData || []);
  }

  useEffect(() => {
    setAnswers({});
    setResult(null);
    loadQuiz().catch((error) => showToast(error?.response?.data?.detail || "测验读取失败。", "error"));
  }, [quizId]);

  function setAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function answeredCount() {
    return Object.values(answers).filter((value) => (Array.isArray(value) ? value.length > 0 : String(value || "").trim())).length;
  }

  async function handleSubmit() {
    if (!quiz?.questions?.length) return;
    if (answeredCount() < quiz.questions.length) {
      showToast("还有题目未作答，请完成后再提交。", "error");
      return;
    }
    setBusy(true);
    try {
      const data = await submitQuiz(quizId, answers);
      setResult(data);
      await refreshAll();
      setHistory(await getQuizHistory());
      showToast("测验已评分，掌握度、XP、风险和学习地图已刷新。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "提交测验失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer
      eyebrow="学习测验"
      title="测验闭环"
      description="答题结果会写入学习记录，并影响掌握度、XP、风险评分和学习地图状态。"
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <QuizPanel quiz={quiz} answers={answers} setAnswer={setAnswer} onSubmit={handleSubmit} busy={busy} result={result} />
          <QuizResultPanel result={result} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate("/resources")} className="action-button">
              返回资源猎手
            </button>
            <button type="button" onClick={() => navigate("/map")} className="action-button">
              查看学习地图
            </button>
          </div>
        </div>
        <QuizHistoryPanel history={history} />
      </div>
    </PageContainer>
  );
}
