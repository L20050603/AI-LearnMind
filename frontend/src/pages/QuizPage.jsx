import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getQuiz, submitQuiz } from "../api/client.js";
import QuizPanel from "../components/quiz/QuizPanel.jsx";
import QuizResultPanel from "../components/quiz/QuizResultPanel.jsx";
import { useToast } from "../components/common/ToastProvider.jsx";
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
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getQuiz(quizId).then(setQuiz).catch(() => showToast("测验读取失败。", "error"));
  }, [quizId, showToast]);

  function setAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleSubmit() {
    setBusy(true);
    try {
      const data = await submitQuiz(quizId, { answers });
      setResult(data);
      await refreshAll();
      showToast("测验已评分，学习状态已刷新。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "提交测验失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="学习测验" title="测验闭环" description="答题结果会写入学习记录，并影响掌握度、XP、风险评分和学习地图状态。">
      <QuizPanel quiz={quiz} answers={answers} setAnswer={setAnswer} onSubmit={handleSubmit} busy={busy} />
      <QuizResultPanel result={result} />
      <button type="button" onClick={() => navigate("/resources")} className="action-button">返回资源猎手</button>
    </PageContainer>
  );
}
