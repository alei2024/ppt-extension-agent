import { useState } from 'react'
import UploadArea from './components/UploadArea/UploadArea'
import PPTViewer from './components/PPTViewer/PPTViewer'
import ExpansionPanel from './components/ExpansionPanel/ExpansionPanel'
import ProgressBar from './components/ProgressBar/ProgressBar'
import { Upload, FileText, Sparkles, Download } from 'lucide-react'

type Slide = {
  page_number: number
  title: string
  text_boxes: Array<{
    id: number
    text: string
    position: { left: number; top: number; width: number; height: number }
    is_title: boolean
  }>
}

type PPTData = {
  metadata: {
    file_name: string
    slide_count: number
  }
  slides: Slide[]
}

type ExpandedContent = {
  background: string
  principles: string
  formulas: string
  examples: string
  summary: string
  references: Array<{ title: string; url: string }>
}

function App() {
  const [pptData, setPPTData] = useState<PPTData | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedTextBoxes, setSelectedTextBoxes] = useState<number[]>([])
  const [expandedContent, setExpandedContent] = useState<ExpandedContent | null>(null)
  const [isExpanding, setIsExpanding] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = (data: PPTData) => {
    setPPTData(data)
    setCurrentSlide(0)
    setSelectedTextBoxes([])
    setExpandedContent(null)
  }

  const handleTextBoxSelect = (textBoxId: number) => {
    setSelectedTextBoxes((prev) => {
      if (prev.includes(textBoxId)) {
        return prev.filter((id) => id !== textBoxId)
      } else {
        return [...prev, textBoxId]
      }
    })
  }

  const handleExpand = async () => {
    if (!pptData || selectedTextBoxes.length === 0) return

    setIsExpanding(true)
    setProgress(0)

    const slide = pptData.slides[currentSlide]
    const selectedTexts = slide.text_boxes
      .filter((tb) => selectedTextBoxes.includes(tb.id))
      .map((tb) => tb.text)
      .join('\n')

    try {
      const response = await fetch('/api/v1/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: slide.title,
          content: selectedTexts,
          context: { page_number: currentSlide + 1 },
        }),
      })

      const data = await response.json()
      setExpandedContent(data.expanded_content)
      setProgress(100)
    } catch (error) {
      console.error('Expansion failed:', error)
    } finally {
      setIsExpanding(false)
    }
  }

  const handleExpandAll = async () => {
    if (!pptData) return

    setIsExpanding(true)
    setProgress(0)

    const slide = pptData.slides[currentSlide]
    const allTexts = slide.text_boxes.map((tb) => tb.text).join('\n')

    try {
      const response = await fetch('/api/v1/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: slide.title,
          content: allTexts,
          context: { page_number: currentSlide + 1 },
        }),
      })

      const data = await response.json()
      setExpandedContent(data.expanded_content)
      setProgress(100)
    } catch (error) {
      console.error('Expansion failed:', error)
    } finally {
      setIsExpanding(false)
    }
  }

  const handleExport = async (format: 'markdown' | 'pdf') => {
    if (!pptData || !expandedContent) return

    try {
      const response = await fetch('/api/v1/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ppt_data: pptData,
          expanded_data: {
            [`slide_${currentSlide + 1}_box_${selectedTextBoxes.length > 0 ? selectedTextBoxes[0] : ''}`]: expandedContent,
          },
          format,
          page_number: currentSlide + 1,
        }),
      })

      const data = await response.json()

      if (format === 'markdown') {
        const blob = new Blob([data.content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = data.filename
        a.click()
        URL.revokeObjectURL(url)
      } else if (data.download_url) {
        window.open(`http://localhost:8000${data.download_url}`, '_blank')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              PPT内容扩展智能体
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            基于云原生架构和LLM Agent
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!pptData ? (
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
                    className="text-sm text-gray-600 hover:text-gray-900"
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
                          pptData.slides[currentSlide].text_boxes.map((tb) => tb.id)
                        )
                      }
                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      全选
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExpand}
                      disabled={selectedTextBoxes.length === 0 || isExpanding}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      扩展选中
                    </button>
                    <button
                      onClick={handleExpandAll}
                      disabled={isExpanding}
                      className="px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      扩展整页
                    </button>
                  </div>
                </div>
              </div>

              {isExpanding && <ProgressBar progress={progress} />}
            </div>

            <div>
              <ExpansionPanel 
                content={expandedContent} 
                onExport={handleExport}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
