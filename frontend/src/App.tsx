import { useState, useEffect } from "react";
import UploadArea from "./components/UploadArea/UploadArea";
import PPTViewer from "./components/PPTViewer/PPTViewer";
import ExpansionPanel from "./components/ExpansionPanel/ExpansionPanel";
import ProgressBar from "./components/ProgressBar/ProgressBar";
import ReferenceFileUpload from "./components/ReferenceFileUpload/ReferenceFileUpload";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { auth } from "./services/api";

type Slide = {
  page_number: number;
  title: string;
  text_boxes: Array<{
    id: number;
    text: string;
    position: { left: number; top: number; width: number; height: number };
    is_title: boolean;
  }>;
};

type PPTData = {
  metadata: {
    file_name: string;
    slide_count: number;
  };
  slides: Slide[];
};

type ExpandedContent = {
  background: string;
  principles: string;
  formulas: string;
  examples: string;
  summary: string;
  references: Array<{ title: string; url: string }>;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [view, setView] = useState<"dashboard" | "ppt">("dashboard");

  const [pptData, setPPTData] = useState<PPTData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTextBoxes, setSelectedTextBoxes] = useState<number[]>([]);
  const [expandedContent, setExpandedContent] =
    useState<ExpandedContent | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [referenceFileIds, setReferenceFileIds] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      auth
        .me(token)
        .then((u) => setUser(u))
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    setView("dashboard");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setPPTData(null);
  };

  const handleUpload = (data: PPTData) => {
    setPPTData(data);
    setCurrentSlide(0);
    setSelectedTextBoxes([]);
    setExpandedContent(null);
  };

  const handleTextBoxSelect = (textBoxId: number) => {
    setSelectedTextBoxes((prev) => {
      if (prev.includes(textBoxId)) {
        return prev.filter((id) => id !== textBoxId);
      } else {
        return [...prev, textBoxId];
      }
    });
  };

  const handleExpand = async () => {
    if (!pptData || selectedTextBoxes.length === 0) return;

    setIsExpanding(true);
    setProgress(0);
    setProgressStatus("正在提取关键词...");

    const slide = pptData.slides[currentSlide];
    const selectedTexts = slide.text_boxes
      .filter((tb) => selectedTextBoxes.includes(tb.id))
      .map((tb) => tb.text)
      .join("\n");

    try {
      // 定义搜索阶段和对应的进度值（根据是否有参考文件动态调整）
      // 如果有参考文件，只搜索Arxiv（并行执行，更快）
      // 如果没有参考文件，搜索全部4个源（并行执行，已移除Wikipedia）
      const hasReferenceFiles = referenceFileIds.length > 0;
      const searchStages = hasReferenceFiles
        ? [
            // 有参考文件时：只搜索1个源（Arxiv，约1-2秒）
            { status: "正在提取关键词...", progress: 10 },
            { status: "正在检索 Arxiv...", progress: 20 },
            { status: "正在生成扩展内容...", progress: 70 },
            { status: "正在整合参考文献...", progress: 95 },
          ]
        : [
            // 无参考文件时：搜索4个源（Arxiv、Semantic Scholar、Crossref、OpenAlex，并行，约2-3秒）
            { status: "正在提取关键词...", progress: 10 },
            {
              status: "正在检索 Arxiv、Semantic Scholar、Crossref、OpenAlex...",
              progress: 30,
            },
            { status: "正在过滤高质量期刊论文...", progress: 50 },
            { status: "正在生成扩展内容...", progress: 80 },
            { status: "正在整合参考文献...", progress: 95 },
          ];

      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        if (statusIndex < searchStages.length) {
          const stage = searchStages[statusIndex];
          setProgressStatus(stage.status);
          setProgress(stage.progress);
          statusIndex++;
        }
      }, 600);

      const response = await fetch("/api/v1/expand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: slide.title,
          content: selectedTexts,
          context: { page_number: currentSlide + 1 },
          reference_file_ids:
            referenceFileIds.length > 0 ? referenceFileIds : undefined,
        }),
      });

      clearInterval(statusInterval);
      setProgressStatus("正在完成...");
      setProgress(100);

      const data = await response.json();
      setExpandedContent(data.expanded_content);

      // 处理完成后，延迟隐藏进度条
      setTimeout(() => {
        setProgressStatus("");
        setProgress(0);
        setIsExpanding(false); // 确保进度条消失
      }, 500);
    } catch (error) {
      console.error("Expansion failed:", error);
      setProgressStatus("扩展失败");
      // 失败后也延迟隐藏进度条
      setTimeout(() => {
        setProgressStatus("");
        setProgress(0);
        setIsExpanding(false);
      }, 2000);
    }
  };

  const handleExpandAll = async () => {
    if (!pptData) return;

    setIsExpanding(true);
    setProgress(0);
    setProgressStatus("正在提取关键词...");

    const slide = pptData.slides[currentSlide];
    const allTexts = slide.text_boxes.map((tb) => tb.text).join("\n");

    try {
      // 定义搜索阶段和对应的进度值（根据是否有参考文件动态调整）
      // 如果有参考文件，只搜索Arxiv（并行执行，更快）
      // 如果没有参考文件，搜索全部4个源（并行执行，已移除Wikipedia）
      const hasReferenceFiles = referenceFileIds.length > 0;
      const searchStages = hasReferenceFiles
        ? [
            // 有参考文件时：只搜索1个源（Arxiv，约1-2秒）
            { status: "正在提取关键词...", progress: 10 },
            { status: "正在检索 Arxiv...", progress: 20 },
            { status: "正在扩展内容...", progress: 70 },
            { status: "正在整合内容...", progress: 95 },
          ]
        : [
            // 无参考文件时：搜索4个源（Arxiv、Semantic Scholar、Crossref、OpenAlex，并行，约2-3秒）
            { status: "正在提取关键词...", progress: 10 },
            {
              status: "正在检索 Arxiv、Semantic Scholar、Crossref、OpenAlex...",
              progress: 30,
            },
            { status: "正在过滤高质量期刊论文...", progress: 50 },
            { status: "正在扩展内容...", progress: 80 },
            { status: "正在整合内容...", progress: 95 },
          ];

      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        if (statusIndex < searchStages.length) {
          const stage = searchStages[statusIndex];
          setProgressStatus(stage.status);
          setProgress(stage.progress);
          statusIndex++;
        }
      }, 600);

      const response = await fetch("/api/v1/expand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: slide.title,
          content: allTexts,
          context: { page_number: currentSlide + 1 },
        }),
      });

      clearInterval(statusInterval);
      setProgressStatus("正在完成...");
      setProgress(100);

      const data = await response.json();
      setExpandedContent(data.expanded_content);

      // 处理完成后，延迟隐藏进度条
      setTimeout(() => {
        setProgressStatus("");
        setProgress(0);
        setIsExpanding(false); // 确保进度条消失
      }, 500);
    } catch (error) {
      console.error("Expansion failed:", error);
      setProgressStatus("扩展失败");
      // 失败后也延迟隐藏进度条
      setTimeout(() => {
        setProgressStatus("");
        setProgress(0);
        setIsExpanding(false);
      }, 2000);
    }
  };

  const handleExport = async (format: "markdown" | "pdf") => {
    if (!pptData || !expandedContent) return;

    try {
      // 构建扩展数据：为当前slide的每个text_box创建扩展内容映射
      const slide = pptData.slides[currentSlide];
      const expandedData: Record<string, any> = {};

      // 如果选择了特定text box，只为选中的创建映射
      if (selectedTextBoxes.length > 0) {
        selectedTextBoxes.forEach((boxId) => {
          const key = `slide_${slide.page_number}_box_${boxId}`;
          expandedData[key] = expandedContent;
        });
      } else {
        // 如果没有选择，为所有text box创建映射
        slide.text_boxes.forEach((textBox) => {
          const key = `slide_${slide.page_number}_box_${textBox.id}`;
          expandedData[key] = expandedContent;
        });
      }

      const response = await fetch("/api/v1/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ppt_data: pptData,
          expanded_data: expandedData,
          format,
          page_number: slide.page_number,
        }),
      });

      const data = await response.json();

      if (format === "markdown") {
        const blob = new Blob([data.content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
      } else if (data.download_url) {
        window.open(`${data.download_url}`, "_blank");
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary-600" />
            <h2 className="text-3xl font-extrabold text-gray-900">
              PPT内容扩展智能体
            </h2>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authView === "login" ? "登录您的账户" : "创建新账户"}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {authView === "login" ? (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setAuthView("register")}
              />
            ) : (
              <Register
                onRegisterSuccess={() => setAuthView("login")}
                onSwitchToLogin={() => setAuthView("login")}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 如果有token但没有user信息，显示加载中
  if (token && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载用户信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
                PPT内容扩展智能体
              </h1>
            </div>

            <nav className="flex space-x-4">
              <button
                onClick={() => setView("dashboard")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  view === "dashboard"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                学习仪表盘
              </button>
              <button
                onClick={() => setView("ppt")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  view === "ppt"
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-4 h-4" />
                PPT扩展
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{user.username}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === "dashboard" ? (
          <Dashboard
            token={token}
            user={user}
            onStartLearning={() => setView("ppt")}
            onLogout={handleLogout}
          />
        ) : !pptData ? (
          <UploadArea onUpload={handleUpload} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {pptData.metadata.file_name}
                    </span>
                  </div>
                  <button
                    onClick={() => setPPTData(null)}
                    className="text-sm text-gray-600 hover:text-gray-900 whitespace-nowrap"
                  >
                    重新上传
                  </button>
                </div>

                <PPTViewer
                  slides={pptData.slides}
                  currentSlide={currentSlide}
                  onSlideChange={setCurrentSlide}
                  selectedTextBoxes={selectedTextBoxes}
                  onTextBoxSelect={handleTextBoxSelect}
                />

                <div className="mt-4 border-t pt-4">
                  <ReferenceFileUpload onFilesChange={setReferenceFileIds} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTextBoxes([])}
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      清除选择
                    </button>
                    <button
                      onClick={() =>
                        setSelectedTextBoxes(
                          pptData.slides[currentSlide].text_boxes.map(
                            (tb) => tb.id,
                          ),
                        )
                      }
                      disabled={
                        pptData.slides[currentSlide].text_boxes.length === 0
                      }
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      全选
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExpand}
                      disabled={selectedTextBoxes.length === 0 || isExpanding}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      title={
                        selectedTextBoxes.length === 0
                          ? "请先选择要扩展的内容"
                          : ""
                      }
                    >
                      <Upload className="w-4 h-4" />
                      扩展选中
                    </button>
                    <button
                      onClick={handleExpandAll}
                      disabled={
                        isExpanding ||
                        pptData.slides[currentSlide].text_boxes.length === 0
                      }
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      title={
                        pptData.slides[currentSlide].text_boxes.length === 0
                          ? "本页没有可扩展的内容"
                          : ""
                      }
                    >
                      <Sparkles className="w-4 h-4" />
                      扩展整页
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* 进度条放在右侧最上方 */}
              {isExpanding && (
                <div className="mb-4">
                  <ProgressBar status={progressStatus} progress={progress} />
                </div>
              )}
              <ExpansionPanel
                content={expandedContent}
                onExport={handleExport}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
