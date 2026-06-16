import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { evaluateRisk } from "../api/client.js";
import ChartPanel from "../components/ChartPanel.jsx";
import RiskCenter from "../components/RiskCenter.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

export default function RiskCenterPage() {
  const { risk, charts, refreshAll } = useAppData();
  const [busy, setBusy] = useState(false);

  async function reevaluate() {
    setBusy(true);
    try {
      await evaluateRisk({});
      await refreshAll();
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer
      eyebrow="Risk Diagnosis"
      title="风险诊断中心"
      description="展示风险仪表盘、触发规则、原因解释、建议和历史趋势。"
      actions={
        <button type="button" onClick={reevaluate} className="action-button">
          <RefreshCw className={busy ? "animate-spin" : ""} size={16} />
          重新评估
        </button>
      }
    >
      <RiskCenter risk={risk} />
      <ChartPanel charts={charts} />
    </PageContainer>
  );
}
