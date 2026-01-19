import { useState, useRef } from "react";
import { Upload as UploadIcon, Link as LinkIcon } from "lucide-react";

type PPTData = {
  metadata: {
    file_name: string;
    slide_count: number;
  };
  slides: any[];
};

type UploadAreaProps = {
  onUpload: (data: PPTData) => void;
};

function UploadArea({ onUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const pptFile = files.find(
      (f) => f.name.endsWith(".pptx") || f.name.endsWith(".ppt"),
    );

    if (pptFile) {
      await uploadFile(pptFile);
    } else {
      alert("请上传 .pptx 或 .ppt 格式的文件");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      onUpload(data.ppt_data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("上传失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleURLSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/process-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("处理失败");
      }

      const data = await response.json();
      onUpload(data.ppt_data);
    } catch (error) {
      console.error("URL processing failed:", error);
      alert("处理失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 transition-all hover:shadow-md">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group border-4 border-dashed rounded-3xl p-24 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-primary-500 bg-primary-50/50 scale-[1.02]"
              : "border-gray-200 hover:border-primary-400 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pptx,.ppt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="mb-10 p-8 bg-primary-50 text-primary-600 rounded-full w-32 h-32 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <UploadIcon className="w-16 h-16" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            点击或拖拽文件上传
          </h3>
          <p className="text-gray-500 text-2xl">
            支持 .pptx 和 .ppt 格式（最大 50MB）
          </p>
        </div>

        <div className="mt-16 mb-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-8 bg-white text-gray-400 text-xl font-medium">
                或者通过 URL 导入
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleURLSubmit} className="mt-10">
          <div className="flex gap-6">
            <div className="flex-1 relative group">
              <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="输入 PPT 文件公开链接"
                className="w-full pl-20 pr-8 py-8 border-2 border-gray-200 rounded-3xl text-2xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all bg-gray-50 focus:bg-white placeholder:text-xl"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="px-12 py-8 bg-primary-600 text-white text-2xl rounded-3xl hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-bold shadow-lg hover:shadow-xl active:scale-95 whitespace-nowrap"
            >
              {isLoading ? "解析中..." : "开始解析"}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-[6px] border-gray-100 border-t-primary-600 mb-6"></div>
            <p className="text-2xl font-bold text-gray-700 mb-2">
              正在深入分析 PPT 内容...
            </p>
            <p className="text-xl text-gray-500">
              文件较大时可能需要几分钟，请耐心等待
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadArea;
