import { useState } from "react";
import { auth } from "../../services/api";
import { User, Lock, Mail, Sparkles, ArrowRight, Loader2 } from "lucide-react";

type RegisterProps = {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
};

export default function Register({
  onRegisterSuccess,
  onSwitchToLogin,
}: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await auth.register(username, password, email);
      onRegisterSuccess();
    } catch (err) {
      setError("注册失败，用户名可能已被占用。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-3xl relative z-10 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="p-5 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/30">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            PPT内容扩展智能体
          </h1>
          <p className="text-slate-500 text-3xl font-medium">创建您的账户</p>
        </div>

        {/* Register Form - No Card/Frame */}
        <form onSubmit={handleSubmit} className="w-full space-y-12">
          <div className="space-y-10">
            <div className="group">
              <label className="block text-2xl font-bold text-slate-700 mb-4 ml-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                  <User className="h-10 w-10 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-24 pr-8 py-8 bg-white border-2 border-slate-200 rounded-3xl text-3xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-md"
                  placeholder="设置您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-2xl font-bold text-slate-700 mb-4 ml-2">
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                  <Mail className="h-10 w-10 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="block w-full pl-24 pr-8 py-8 bg-white border-2 border-slate-200 rounded-3xl text-3xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-md"
                  placeholder="your@email.com (可选)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-2xl font-bold text-slate-700 mb-4 ml-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
                  <Lock className="h-10 w-10 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-24 pr-8 py-8 bg-white border-2 border-slate-200 rounded-3xl text-3xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-[6px] focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-md"
                  placeholder="设置您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-3xl bg-red-50 p-6 border-2 border-red-100 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-1">
                <span className="text-red-600 text-lg font-bold">!</span>
              </div>
              <p className="text-xl text-red-600 font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-8 px-10 bg-indigo-600 hover:bg-indigo-700 text-white text-3xl font-bold rounded-3xl shadow-2xl shadow-indigo-600/25 hover:shadow-indigo-600/40 focus:outline-none focus:ring-[6px] focus:ring-indigo-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99] flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : (
              <>
                <span>立即注册</span>
                <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform stroke-[3px]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-slate-500">
            已有账号？{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
