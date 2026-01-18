import { useState } from 'react'
import { BookOpen, Lightbulb, Calculator, Code, CheckCircle, ExternalLink, Download } from 'lucide-react'
import MathRenderer from '../MathRenderer/MathRenderer'
import CodeHighlighter from '../CodeHighlighter/CodeHighlighter'

type ExpandedContent = {
  background: string
  principles: string
  formulas: string
  examples: string
  summary: string
  references: Array<{ title: string; url: string }>
}

type ExpansionPanelProps = {
  content: ExpandedContent | null
  onExport?: (format: 'markdown' | 'pdf') => void
}

function ExpansionPanel({ content, onExport }: ExpansionPanelProps) {
  const [activeTab, setActiveTab] = useState<'background' | 'principles' | 'formulas' | 'examples' | 'summary'>('background')

  const tabs = [
    { id: 'background' as const, label: '背景说明', icon: BookOpen },
    { id: 'principles' as const, label: '原理阐述', icon: Lightbulb },
    { id: 'formulas' as const, label: '公式推导', icon: Calculator },
    { id: 'examples' as const, label: '代码示例', icon: Code },
    { id: 'summary' as const, label: '要点总结', icon: CheckCircle },
  ]

  if (!content) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">选择文本框并点击"扩展"按钮查看扩展内容</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {content && onExport && (
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">导出选项</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onExport('markdown')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Markdown
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'background' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">背景说明</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.background || '暂无背景说明'}
            </div>
          </div>
        )}

        {activeTab === 'principles' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">原理阐述</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.principles || '暂无原理阐述'}
            </div>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">公式推导</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.formulas ? <MathRenderer content={content.formulas} /> : '暂无公式推导'}
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">代码示例</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.examples ? <CodeHighlighter content={content.examples} /> : '暂无代码示例'}
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">要点总结</h4>
            <div className="prose prose-sm max-w-none text-gray-700">
              {content.summary || '暂无要点总结'}
            </div>
          </div>
        )}
      </div>

      {content.references && content.references.length > 0 && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">延伸阅读</h4>
          <ul className="space-y-2">
            {content.references.map((ref, index) => (
              <li key={index}>
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="w-4 h-4" />
                  {ref.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ExpansionPanel
