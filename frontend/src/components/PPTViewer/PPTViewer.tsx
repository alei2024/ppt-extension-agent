import { ChevronLeft, ChevronRight } from 'lucide-react'

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

type PPTViewerProps = {
  slides: Slide[]
  currentSlide: number
  onSlideChange: (index: number) => void
  selectedTextBoxes: number[]
  onTextBoxSelect: (id: number) => void
}

function PPTViewer({
  slides,
  currentSlide,
  onSlideChange,
  selectedTextBoxes,
  onTextBoxSelect,
}: PPTViewerProps) {
  const slide = slides[currentSlide]

  if (!slide) return null

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 min-h-[400px] relative">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {slide.title || `第 ${slide.page_number} 页`}
        </h3>

        <div className="space-y-3">
          {slide.text_boxes.map((textBox) => (
            <div
              key={textBox.id}
              onClick={() => onTextBoxSelect(textBox.id)}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedTextBoxes.includes(textBox.id)
                  ? 'bg-primary-100 border-2 border-primary-500 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-primary-300 hover:shadow-sm'
              }`}
            >
              <p
                className={`text-sm ${
                  textBox.is_title
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-700'
                }`}
              >
                {textBox.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          上一页
        </button>

        <div className="text-sm text-gray-600">
          {currentSlide + 1} / {slides.length}
        </div>

        <button
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default PPTViewer
