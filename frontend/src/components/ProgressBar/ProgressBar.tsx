type ProgressBarProps = {
  progress: number
}

function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">处理进度</span>
          <span className="text-sm font-medium text-primary-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">
          {progress < 30 && '正在解析PPT...'}
          {progress >= 30 && progress < 60 && '正在生成扩展内容...'}
          {progress >= 60 && progress < 90 && '正在验证内容准确性...'}
          {progress >= 90 && '即将完成...'}
        </p>
      </div>
    </div>
  )
}

export default ProgressBar
