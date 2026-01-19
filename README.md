# PPT内容扩展智能体

基于云原生架构和LLM Agent技术构建的PPT内容扩展学习助手系统。

## 项目简介

本系统能够自动解析PPT文件结构，识别知识点层级，并通过调用大语言模型（基于SiliconFlow的DeepSeek-V3.2-Exp）和外部知识源，为PPT内容补充背景说明、公式推导、代码示例等扩展信息。

**最新功能**：新增个性化学习计划生成、用户成长中心、多端适配的现代化UI界面。

### 核心价值

- **提高学习效率**：自动补充PPT中缺失的背景知识和深度解释
- **个性化学习路径**：根据用户水平和目标生成定制化学习计划（周/日维度）
- **多维度扩展**：提供背景说明、原理阐述、公式推导、代码示例、要点总结
- **权威知识源**：整合Arxiv、Semantic Scholar、Crossref、OpenAlex等4个学术资源
- **智能验证**：内置Check layer机制，防止LLM幻觉
- **用户成长体系**：个人中心记录学习轨迹，可视化展示学习进度和目标
- **性能优化**：并行搜索、智能源选择、超时保护，响应速度提升50-60%

---

## 技术架构

### 云原生组件

- **Docker**: 容器化部署，确保环境一致性
- **Docker Compose**: 多服务编排，一键启动
- **Redis**: 缓存和任务队列，提升性能
- **Milvus**: 向量数据库，实现语义检索

### LLM Agent技术栈

- **LangChain**: Agent框架，提供工具链支持
- **SiliconFlow API**: 大语言模型接口（使用DeepSeek-V3.2-Exp模型）
- **Prompt Engineering**: 结构化Prompt设计，确保输出JSON格式的稳定计划

### 前端技术栈

- **React 18 + TypeScript**: 现代化前端框架
- **Tailwind CSS**: 原子化CSS框架，实现响应式布局和深色模式
- **Framer Motion**: 流畅的UI动画交互
- **Recharts**: 数据可视化图表
- **KaTeX**: 数学公式渲染
- **Prism.js**: 代码高亮

### 核心功能模块

- **PPT解析**: 智能提取标题、表格、备注页文本，构建知识图谱
- **学习计划生成**: 基于LLM生成包含周目标、每日任务、资源链接的结构化学习计划
- **用户中心**: 个人Dashboard，管理学习计划、设定学习目标、查看进度统计
- **知识扩充**: 多源搜索驱动的知识扩展，支持用户上传参考文件
- **多维搜索**: 整合4大权威学术资源（并行执行，带超时保护）
- **导出功能**: 支持Markdown和PDF格式导出

---

## 快速开始

### 📋 前置检查

确保已安装：

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 18（前端开发）

### 🚀 Docker Compose 一键启动（推荐）

#### 步骤 1：克隆项目

```bash
git clone https://github.com/alei2024/ppt-extension-agent.git
cd ppt-extension-agent
```

#### 步骤 2：配置环境变量（可选）

```bash
# 项目已内置默认API配置，可直接运行
# 如需自定义，复制并编辑：
cp env.example .env
```

#### 步骤 3：启动后端服务

```bash
# 构建镜像并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps
```

#### 步骤 4：启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 **http://localhost:3000** 查看前端界面。

#### 步骤 5：验证服务

```bash
# 健康检查
curl http://localhost:8000/health

# API文档
# 浏览器打开：http://localhost:8000/docs
```

---

## 核心功能

### 1. 智能学习计划 (New)

- **个性化定制**：输入学习主题、目标周期（周）、当前水平（初/中/高），生成专属计划
- **结构化输出**：自动拆解为“周目标”和“每日任务”，包含具体行动项
- **资源推荐**：针对每个任务推荐相关的学习资料和练习题
- **进度追踪**：在个人中心查看和管理历史学习计划

### 2. 用户成长中心 (New)

- **Dashboard**: 可视化展示学习时长、完成任务数、当前目标
- **个人资料**: 管理用户基本信息和偏好设置
- **计划管理**: 查看、执行和归档历史学习计划
- **响应式设计**: 完美适配桌面大屏、笔记本和平板设备

### 3. UI/UX 体验优化 (New)

- **宽屏适配**: 登录/注册页采用左右分栏设计，左侧展示品牌视觉，右侧聚焦表单
- **流畅动画**: 页面切换和组件加载增加微交互动画（Fade/Slide）
- **现代化组件**: 使用Tailwind CSS重构按钮、卡片、输入框等基础组件
- **交互反馈**: 增加加载状态骨架屏、操作成功/失败的Toast提示

### 4. PPT解析与知识扩充

- **层级结构识别**：自动识别目录、主标题、子标题、正文
- **多源并行搜索**：同时检索Arxiv, Semantic Scholar, Crossref, OpenAlex
- **智能内容过滤**：自动过滤纯数字、页码等无意义内容
- **参考文件支持**：支持上传Word/PDF作为扩充依据，LLM优先引用

### 5. 导出功能

- **Markdown导出**：支持Markdown格式导出，方便后续编辑
- **PDF导出**：支持PDF格式导出（已支持中文字体），方便打印和分享
- **公式/代码渲染**：完美支持LaTeX公式和代码高亮

---

## API文档

启动服务后，访问以下地址查看完整API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要API端点

| 模块         | 端点                       | 方法 | 说明               |
| ------------ | -------------------------- | ---- | ------------------ |
| **认证**     | `/api/v1/auth/register`    | POST | 用户注册           |
|              | `/api/v1/auth/login`       | POST | 用户登录 (JWT)     |
|              | `/api/v1/auth/me`          | GET  | 获取当前用户信息   |
| **学习计划** | `/api/v1/plan/generate`    | POST | 生成学习计划 (LLM) |
|              | `/api/v1/plans`            | GET  | 获取用户所有计划   |
|              | `/api/v1/plan/save`        | POST | 保存学习计划       |
| **PPT处理**  | `/api/v1/upload`           | POST | 上传PPT文件        |
|              | `/api/v1/expand`           | POST | 扩充单个知识点     |
|              | `/api/v1/search`           | POST | 多源搜索           |
|              | `/api/v1/export`           | POST | 导出内容           |
| **参考文件** | `/api/v1/upload-reference` | POST | 上传参考文件       |

---

## 目录结构

```
.
├── api/                          # API路由定义 (New Structure)
│   ├── main.py                   # FastAPI应用入口 & 路由注册
│   ├── auth_routes.py            # 认证相关路由
│   ├── learning_routes.py        # 学习计划相关路由
│   └── routes.py                 # PPT处理相关路由
├── services/                     # 业务逻辑层
│   ├── user_service.py           # 用户管理与数据存储
│   ├── parser.py                 # PPT解析服务
│   ├── knowledge_expander.py     # 知识扩充服务
│   └── search_service.py         # 搜索服务
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── components/
│   │   │   ├── UserProfile/      # 用户中心组件 (New)
│   │   │   ├── Dashboard/        # 仪表盘组件 (New)
│   │   │   ├── Login/            # 登录注册组件 (Redesigned)
│   │   │   └── ...
│   │   ├── services/             # 前端API服务封装
│   │   └── App.tsx               # 主应用组件
├── data/                         # 数据存储
│   └── users.json                # 用户数据文件 (JSON DB)
├── Dockerfile                    # Docker构建文件
├── docker-compose.yml            # Docker Compose配置
└── requirements.txt              # Python依赖
```

---

## 性能优化说明

- **并行搜索**: 使用ThreadPoolExecutor并行执行所有搜索源，响应速度提升50%+
- **智能源选择**: 根据是否有参考文件动态调整搜索策略
- **前端优化**: 路由懒加载、组件按需渲染、静态资源缓存
