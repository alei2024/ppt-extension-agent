import { ChevronLeft, ChevronRight } from "lucide-react";

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

type PPTViewerProps = {
  slides: Slide[];
  currentSlide: number;
  onSlideChange: (index: number) => void;
  selectedTextBoxes: number[];
  onTextBoxSelect: (id: number) => void;
};

function PPTViewer({
  slides,
  currentSlide,
  onSlideChange,
  selectedTextBoxes,
  onTextBoxSelect,
}: PPTViewerProps) {
  const slide = slides[currentSlide];

  if (!slide) return null;

  return (
    <div className="space-y-6">
      <div className="relative aspect-[16/9] bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200">
        <div className="absolute inset-0 p-8 overflow-y-auto custom-scrollbar">
          <div className="bg-white min-h-full rounded-lg shadow-sm p-8 border border-gray-100">
            <h3 className="text-4xl font-bold text-gray-900 mb-10 pb-6 border-b border-gray-100">
              {slide.title || `第 ${slide.page_number} 页`}
            </h3>

            {slide.text_boxes.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-10 text-center">
                <p className="text-2xl font-medium text-yellow-800">
                  本页暂无可选中内容。请尝试选择其他页面，或使用"扩展整页"功能。
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {slide.text_boxes.map((textBox) => {
                  const isSelected = selectedTextBoxes.includes(textBox.id);
                  return (
                    <div
                      key={textBox.id}
                      onClick={() => onTextBoxSelect(textBox.id)}
                      className={`group relative p-8 rounded-xl cursor-pointer transition-all duration-200 border text-left ${
                        isSelected
                          ? "bg-primary-50 border-primary-500 shadow-md ring-1 ring-primary-500"
                          : "bg-gray-50 border-gray-200 hover:border-primary-300 hover:bg-white hover:shadow-sm"
                      }`}
                    >
                      <p
                        className={`text-2xl leading-relaxed ${
                          textBox.is_title
                            ? "font-bold text-gray-900 text-3xl"
                            : "text-gray-700"
                        }`}
                      >
                        {textBox.text}
                      </p>

                      {/* Selection Indicator */}
                      <div
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-primary-500 bg-primary-500 scale-100"
                            : "border-gray-300 bg-transparent scale-0 group-hover:scale-100"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg border border-gray-100">
        <button
          onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="flex items-center gap-4 px-8 py-5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xl"
        >
          <ChevronLeft className="w-8 h-8" />
          上一页
        </button>

        <span className="text-xl font-medium text-gray-600 bg-white px-8 py-3 rounded border border-gray-200 shadow-sm">
          第 {currentSlide + 1} / {slides.length} 页
        </span>

        <button
          onClick={() =>
            onSlideChange(Math.min(slides.length - 1, currentSlide + 1))
          }
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-4 px-8 py-5 bg-white text-gray-700 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 hover:text-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xl"
        >
          下一页
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

export default PPTViewer;
