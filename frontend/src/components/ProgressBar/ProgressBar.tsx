type ProgressBarProps = {
  status?: string
  progress: number
}

function ProgressBar({ status = '处理中...', progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 hidden">处理状态</span>
        <div className="flex items-center gap-2 hidden">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span className="text-sm font-medium text-primary-600">{status}</span>
        </div>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
          style={{ width: `${progress}%` }}
        >
            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] border-t border-white/10"></div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
            <span>{status}</span>
        </div>
        <span className="font-medium text-gray-700">{progress}%</span>
      </div>
    </div>
  )
}

export default ProgressBar
