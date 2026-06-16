import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { motion } from "framer-motion";

function useChart(option) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !option) return undefined;

    const chart = echarts.init(ref.current, null, { renderer: "canvas" });
    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [option]);

  return ref;
}

function ChartBox({ title, option, delay }) {
  const ref = useChart(option);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-panel min-h-[310px] p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-cyan-100">{title}</h3>
      <div ref={ref} className="h-[250px] w-full" />
    </motion.div>
  );
}

const textColor = "#cbd5e1";
const grid = { left: 36, right: 18, top: 36, bottom: 32 };

export default function ChartPanel({ charts }) {
  if (!charts) {
    return (
      <section className="glass-panel p-5 text-center">
        <p className="text-sm text-slate-300">暂无图表数据，请添加学习记录后刷新。</p>
      </section>
    );
  }

  const weeklyOption = {
    color: ["#22d3ee", "#a78bfa"],
    tooltip: { trigger: "axis", backgroundColor: "#020617", borderColor: "#334155", textStyle: { color: textColor } },
    legend: { top: 0, textStyle: { color: textColor } },
    grid,
    xAxis: { type: "category", data: charts.weeklyTrend.days, axisLabel: { color: textColor } },
    yAxis: { type: "value", axisLabel: { color: textColor }, splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } } },
    series: [
      { name: "学习分钟", type: "line", smooth: true, data: charts.weeklyTrend.studyMinutes, areaStyle: { opacity: 0.15 } },
      { name: "专注评分", type: "line", smooth: true, data: charts.weeklyTrend.focusScore },
    ],
  };

  const radarOption = {
    color: ["#22c55e"],
    tooltip: { backgroundColor: "#020617", borderColor: "#334155", textStyle: { color: textColor } },
    radar: {
      indicator: charts.masteryRadar.subjects.map((name) => ({ name, max: 100 })),
      axisName: { color: textColor },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.16)" } },
      splitArea: { areaStyle: { color: ["rgba(34,211,238,0.05)", "rgba(168,85,247,0.04)"] } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.2)" } },
    },
    series: [
      {
        type: "radar",
        data: [{ value: charts.masteryRadar.values, name: "掌握度" }],
        areaStyle: { opacity: 0.22 },
      },
    ],
  };

  const emotionOption = {
    color: ["#fb7185", "#34d399"],
    tooltip: { trigger: "axis", backgroundColor: "#020617", borderColor: "#334155", textStyle: { color: textColor } },
    legend: { top: 0, textStyle: { color: textColor } },
    grid,
    xAxis: { type: "category", data: charts.emotionTrend.days, axisLabel: { color: textColor } },
    yAxis: { type: "value", axisLabel: { color: textColor }, splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } } },
    series: [
      { name: "压力", type: "bar", data: charts.emotionTrend.stress, barWidth: 14, itemStyle: { borderRadius: [8, 8, 0, 0] } },
      { name: "精力", type: "line", smooth: true, data: charts.emotionTrend.energy },
    ],
  };

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <ChartBox title="本周学习趋势" option={weeklyOption} delay={0.1} />
      <ChartBox title="知识掌握雷达图" option={radarOption} delay={0.18} />
      <ChartBox title="情绪压力变化图" option={emotionOption} delay={0.26} />
    </section>
  );
}
