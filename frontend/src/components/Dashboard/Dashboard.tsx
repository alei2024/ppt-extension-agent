import { useState, useEffect } from "react";
import { learning } from "../../services/api";
import { Target, Book, Calendar, ArrowRight, Loader2 } from "lucide-react";

type DashboardProps = {
  token: string;
  user: any;
  onStartLearning: () => void;
  onLogout: () => void;
};

export default function Dashboard({
  token,
  user,
  onStartLearning,
  onLogout,
}: DashboardProps) {
  const [goals, setGoals] = useState<any>({});
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [planMessage, setPlanMessage] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await learning.getGoals(token);
      setGoals(data.goals || {});
      if (data.goals?.topic) setTopic(data.goals.topic);
      // 如果已经有目标，加载推荐
      if (data.goals?.topic) {
        loadRecommendations(data.goals.topic);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveGoals = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      await learning.setGoals(token, { topic });
      setGoals({ ...goals, topic });
      setSaveMessage("目标已保存！");
      loadRecommendations(topic);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setSaveMessage("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!topic) return;
    setLoadingPlan(true);
    setPlanMessage("");
    try {
      const data = await learning.generatePlan(token, topic, 2, "beginner");
      try {
        // 尝试解析JSON
        let planData = data.plan;
        if (typeof planData === "string") {
          // 清理可能的markdown标记（虽然后端也处理了，前端再保险一次）
          planData = planData
            .replace(/^```json\s*/, "")
            .replace(/^```\s*/, "")
            .replace(/\s*```$/, "");
          const planJson = JSON.parse(planData);
          setPlan(planJson);
        } else {
          setPlan(planData);
        }
        setPlanMessage("");
      } catch (e) {
        // 解析失败，显示原始内容
        console.error("Plan parsing error:", e);
        setPlan({ raw: data.plan });
        setPlanMessage("计划格式非标准JSON，已显示原始内容");
      }
    } catch (e) {
      console.error(e);
      setPlanMessage("生成计划失败，请重试");
    } finally {
      setLoadingPlan(false);
    }
  };

  const loadRecommendations = async (query: string) => {
    if (!query) return;
    setLoadingRecs(true);
    try {
      const data = await learning.getRecommendations(token, query);
      // Flatten results from different sources
      const allRecs: any[] = [];
      if (data.results) {
        Object.keys(data.results).forEach((source) => {
          if (Array.isArray(data.results[source])) {
            allRecs.push(...data.results[source]);
          }
        });
      }
      setRecommendations(allRecs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">学习仪表盘</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">欢迎, {user.username}</span>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              退出登录
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Goals Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold">当前学习目标</h2>
          </div>
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="您想学习什么？（例如：深度学习基础）"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
            />
            <button
              onClick={handleSaveGoals}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? "保存中..." : "保存目标"}
            </button>
            {saveMessage && (
              <span
                className={`text-sm ${saveMessage.includes("失败") ? "text-red-600" : "text-green-600"}`}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">个性化学习计划</h2>
              </div>
              <div className="flex items-center gap-2">
                {planMessage && (
                  <span
                    className={`text-sm ${planMessage.includes("失败") ? "text-red-600" : "text-yellow-600"}`}
                  >
                    {planMessage}
                  </span>
                )}
                <button
                  onClick={handleGeneratePlan}
                  disabled={loadingPlan || !topic}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  {loadingPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                  生成新计划
                </button>
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              {plan ? (
                plan.weeks ? (
                  <div className="space-y-4">
                    {plan.weeks.map((week: any, i: number) => (
                      <div key={i} className="border p-3 rounded">
                        <h3 className="font-bold">第 {week.week} 周</h3>
                        <div className="mt-2">
                          <h4 className="font-semibold text-sm text-gray-700">
                            每日任务:
                          </h4>
                          <ul className="list-disc pl-4 text-gray-600">
                            {week.daily_tasks?.map((task: any, j: number) => (
                              <li key={j}>
                                {typeof task === "object"
                                  ? task.day
                                    ? `${task.day}: ${
                                        task.task ||
                                        task.content ||
                                        task.description ||
                                        task.activity ||
                                        JSON.stringify(task)
                                      }`
                                    : task.task ||
                                      task.content ||
                                      task.description ||
                                      task.activity ||
                                      JSON.stringify(task)
                                  : task}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-2">
                          <h4 className="font-semibold text-sm text-gray-700">
                            目标:
                          </h4>
                          <ul className="list-disc pl-4 text-gray-600">
                            {week.targets?.map((target: any, j: number) => (
                              <li key={j}>
                                {typeof target === "object"
                                  ? target.target ||
                                    target.content ||
                                    JSON.stringify(target)
                                  : target}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                    {typeof plan === "string"
                      ? plan
                      : plan.raw || JSON.stringify(plan, null, 2)}
                  </div>
                )
              ) : (
                <p className="text-gray-500">请先设定目标并生成计划。</p>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Book className="w-6 h-6 text-primary-600" />
                <h2 className="text-xl font-semibold">推荐学习资源</h2>
              </div>
              {loadingRecs && (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              )}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="border-b pb-3 last:border-0 hover:bg-gray-50 p-2 rounded transition-colors"
                  >
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:underline block"
                    >
                      {rec.title}
                    </a>
                    {rec.authors && rec.authors.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        作者: {rec.authors.join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                      {rec.summary}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {rec.published && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                          {rec.published}
                        </span>
                      )}
                      {rec.source && (
                        <span className="text-xs bg-blue-50 px-2 py-0.5 rounded text-blue-500 uppercase">
                          {rec.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">
                  {loadingRecs
                    ? "正在搜索相关资源..."
                    : "保存目标后查看推荐资源。"}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button
            onClick={onStartLearning}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 shadow-lg transition-transform hover:scale-105"
          >
            开始 PPT 学习
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </main>
    </div>
  );
}
