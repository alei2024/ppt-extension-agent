import { useState } from "react";
import {
  BookOpen,
  Lightbulb,
  Calculator,
  Code,
  CheckCircle,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import MathRenderer from "../MathRenderer/MathRenderer";
import CodeHighlighter from "../CodeHighlighter/CodeHighlighter";

type ExpandedContent = {
  background: string;
  principles: string;
  formulas: string;
  examples: string;
  summary: string;
  references: Array<{
    title: string;
    url: string;
    source?: string;
    authors?: string[];
    year?: string;
    venue?: string;
    citation?: string;
  }>;
};

type ExpansionPanelProps = {
  content: ExpandedContent | null;
  onExport?: (format: "markdown" | "pdf") => void;
};

function ExpansionPanel({ content, onExport }: ExpansionPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "background" | "principles" | "formulas" | "examples" | "summary"
  >("background");
  const [referencesExpanded, setReferencesExpanded] = useState(false);

  const tabs = [
    { id: "background" as const, label: "背景说明", icon: BookOpen },
    { id: "principles" as const, label: "原理阐述", icon: Lightbulb },
    { id: "formulas" as const, label: "公式推导", icon: Calculator },
    { id: "examples" as const, label: "代码示例", icon: Code },
    { id: "summary" as const, label: "要点总结", icon: CheckCircle },
  ];

  if (!content) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 h-full min-h-[600px] flex flex-col items-center justify-center text-center">
        <div className="p-8 bg-gray-50 rounded-full mb-8">
          <Lightbulb className="w-24 h-24 text-gray-400" />
        </div>
        <h3 className="text-3xl font-semibold text-gray-900 mb-6">
          等待扩展内容
        </h3>
        <p className="text-2xl text-gray-500 max-w-lg leading-relaxed">
          在左侧选择一个或多个文本框，然后点击“扩展选中”或“扩展整页”按钮来获取
          AI 生成的深度解析。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      {content && onExport && (
        <div className="border-b border-gray-100 bg-gray-50/50 px-8 py-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-sm">
          <span className="text-xl font-semibold text-gray-700 flex items-center gap-4">
            <Sparkles className="w-8 h-8 text-primary-500" />
            AI 扩展结果
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onExport("markdown")}
              className="flex items-center gap-3 px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
              title="导出为 Markdown"
            >
              <Download className="w-6 h-6" />
              MD
            </button>
            <button
              onClick={() => onExport("pdf")}
              className="flex items-center gap-3 px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
              title="导出为 PDF"
            >
              <Download className="w-6 h-6" />
              PDF
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-100 bg-white sticky top-[80px] z-10">
        <nav className="flex overflow-x-auto scrollbar-hide px-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-10 py-6 text-2xl font-medium transition-all whitespace-nowrap border-b-2 ${
                  isActive
                    ? "text-primary-600 border-primary-600 bg-primary-50/30"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-8 h-8 ${isActive ? "text-primary-500" : "text-gray-400"}`}
                />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-10 flex-1 overflow-y-auto min-h-[400px]">
        {activeTab === "background" && (
          <div className="space-y-8">
            <h4 className="text-3xl font-semibold text-gray-900">背景说明</h4>
            <div className="prose prose-xl max-w-none text-gray-700">
              {content.background || "暂无背景说明"}
            </div>
          </div>
        )}

        {activeTab === "principles" && (
          <div className="space-y-8">
            <h4 className="text-3xl font-semibold text-gray-900">原理阐述</h4>
            <div className="prose prose-xl max-w-none text-gray-700">
              {content.principles || "暂无原理阐述"}
            </div>
          </div>
        )}

        {activeTab === "formulas" && (
          <div className="space-y-8">
            <h4 className="text-3xl font-semibold text-gray-900">公式推导</h4>
            <div className="prose prose-xl max-w-none text-gray-700">
              {content.formulas ? (
                <MathRenderer content={content.formulas} />
              ) : (
                "暂无公式推导"
              )}
            </div>
          </div>
        )}

        {activeTab === "examples" && (
          <div className="space-y-8">
            <h4 className="text-3xl font-semibold text-gray-900">代码示例</h4>
            <div className="prose prose-xl max-w-none text-gray-700">
              {content.examples ? (
                <CodeHighlighter content={content.examples} />
              ) : (
                "暂无代码示例"
              )}
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div className="space-y-8">
            <h4 className="text-3xl font-semibold text-gray-900">要点总结</h4>
            <div className="prose prose-xl max-w-none text-gray-700">
              {content.summary || "暂无要点总结"}
            </div>
          </div>
        )}
      </div>

      {content.references && content.references.length > 0 && (
        <div className="border-t border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <button
            onClick={() => setReferencesExpanded(!referencesExpanded)}
            className="w-full flex items-center justify-between gap-4 p-8 hover:bg-blue-100/50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-8 h-8 text-primary-600" />
              <h4 className="text-2xl font-semibold text-gray-900">参考文献</h4>
              <span className="text-xl text-gray-500">
                ({content.references.length}篇)
              </span>
            </div>
            {referencesExpanded ? (
              <ChevronUp className="w-8 h-8 text-gray-600" />
            ) : (
              <ChevronDown className="w-8 h-8 text-gray-600" />
            )}
          </button>
          {referencesExpanded && (
            <div className="px-8 pb-8 space-y-4">
              {content.references.map((ref, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-base font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h5 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                            {ref.title}
                          </h5>
                          {(ref.citation ||
                            (ref.authors && ref.authors.length > 0)) && (
                            <div className="text-base text-gray-600 space-y-1">
                              {ref.citation ? (
                                <p className="italic">{ref.citation}</p>
                              ) : (
                                <>
                                  {ref.authors && ref.authors.length > 0 && (
                                    <p>
                                      <span className="font-medium">作者:</span>{" "}
                                      {ref.authors.slice(0, 3).join(", ")}
                                      {ref.authors.length > 3 && " et al."}
                                    </p>
                                  )}
                                  {ref.year && (
                                    <p>
                                      <span className="font-medium">年份:</span>{" "}
                                      {ref.year}
                                    </p>
                                  )}
                                  {ref.venue && (
                                    <p>
                                      <span className="font-medium">
                                        期刊/会议:
                                      </span>{" "}
                                      {ref.venue}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {ref.source && (
                        <span className="inline-block ml-11 px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-md">
                          {ref.source}
                        </span>
                      )}
                    </div>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-3 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
                        title="查看原文"
                      >
                        <ExternalLink className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ExpansionPanel;
