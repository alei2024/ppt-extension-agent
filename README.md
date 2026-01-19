# PPT内容扩展智能体（整合版）

基于云原生架构和LLM Agent技术构建的PPT内容扩展学习助手系统。

## 项目简介

本系统能够自动解析PPT文件结构，识别知识点层级，并通过调用大语言模型（基于SiliconFlow的DeepSeek-V3.2-Exp）和外部知识源，为PPT内容补充背景说明、公式推导、代码示例等扩展信息。

**版本特性**：本版本整合了三个分支的核心功能：
- ✅ 文献搜索和参考文件上传（版本1）
- ✅ 图片识别（OCR+视觉模型）（版本2）
- ✅ 现代化前端界面和用户认证系统（版本3）

### 核心价值
- **提高学习效率**：自动补充PPT中缺失的背景知识和深度解释
- **个性化学习路径**：根据用户水平和目标生成定制化学习计划（周/日维度）
- **多维度扩展**：提供背景说明、原理阐述、公式推导、代码示例、要点总结
- **权威知识源**：整合Arxiv、Semantic Scholar、Crossref、OpenAlex等4个学术资源（Wikipedia已禁用）
- **智能图片识别**：使用OCR和视觉模型自动识别PPT中的图片内容
- **智能关键词提取**：使用LLM智能提取搜索关键词，而非简单截取文本
- **智能验证**：内置Check layer机制，防止LLM幻觉
- **用户成长体系**：个人中心记录学习轨迹，可视化展示学习进度和目标
- **高质量文献**：自动过滤和优先展示重要期刊论文
- **性能优化**：并行搜索、智能源选择、超时保护，响应速度提升50-60%
- **智能内容过滤**：自动过滤纯数字、人名等无意义内容，只保留有价值的文本

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

### 前端技术栈
- **React 18 + TypeScript**: 现代化前端框架
- **Tailwind CSS**: 原子化CSS框架，实现响应式布局和深色模式
- **Framer Motion**: 流畅的UI动画交互
- **Recharts**: 数据可视化图表
- **KaTeX**: 数学公式渲染
- **Prism.js**: 代码高亮

### 核心功能模块
- **用户认证系统**: JWT token认证，支持用户注册、登录和权限管理
- **PPT解析**: 使用python-pptx进行文档解析，智能提取标题、表格、备注页文本，确保有可选中内容
- **图片识别**: 使用pytesseract/easyocr进行OCR识别，支持视觉模型内容分析
- **参考文件上传**: 支持上传Word/PDF文件作为扩充依据，智能判断相关性
- **学习计划生成**: 基于LLM生成包含周目标、每日任务、资源链接的结构化学习计划
- **用户成长中心**: 个人Dashboard，管理学习计划、设定学习目标、查看进度统计
- **知识扩充**: LLM驱动的知识扩展，优先使用用户上传的参考文件
- **智能关键词提取**: 使用LLM从选中内容中提取3-5个核心关键词，用于文献检索
- **多维搜索**: 整合Arxiv、Semantic Scholar、Crossref、OpenAlex等4个外部资源（并行执行，带超时保护，Wikipedia已禁用）
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

# 查看日志
docker-compose logs -f ppt-agent
```

**预期输出**：看到 "Application startup complete" 表示启动成功

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

#### 常用命令
```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f ppt-agent

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重建并启动（代码更新后）
docker-compose up -d --build
```

---

## 核心功能

### 1. 用户认证与管理（新增）
- **用户注册/登录**：JWT token认证，安全可靠
- **权限管理**：基于token的API访问控制
- **用户信息管理**：个人资料、学习目标、偏好设置

### 2. 智能学习计划（新增）
- **个性化定制**：输入学习主题、目标周期（周）、当前水平（初/中/高），生成专属计划
- **结构化输出**：自动拆解为"周目标"和"每日任务"，包含具体行动项
- **资源推荐**：针对每个任务推荐相关的学习资料和练习题
- **进度追踪**：在个人中心查看和管理历史学习计划

### 3. 用户成长中心（新增）
- **Dashboard**: 可视化展示学习时长、完成任务数、当前目标
- **个人资料**: 管理用户基本信息和偏好设置
- **计划管理**: 查看、执行和归档历史学习计划
- **响应式设计**: 完美适配桌面大屏、笔记本和平板设备

### 4. PPT解析
- **层级结构识别**：自动识别目录、主标题、子标题、正文
- **文本提取**：提取所有文本框内容，包括标题、表格、备注页
- **智能内容过滤**：自动过滤纯数字、英文人名、页码等无意义内容
- **兜底机制**：确保每页至少有一个可选中内容（优先使用标题）
- **图片和表格解析**：识别PPT中的图片位置和表格数据

### 5. 图片识别（新增）
- **OCR文字识别**：使用pytesseract或easyocr识别图片中的中英文文字
- **视觉模型分析**：基于LLM生成图片内容描述
- **批量识别**：支持批量处理PPT中的多张图片
- **高置信度识别**：自动返回识别置信度，过滤低质量结果

### 6. 参考文件上传
- **多格式支持**：支持上传Word（.docx, .doc）和PDF（.pdf）格式
- **快速解析**：使用python-docx和PyMuPDF快速提取文本内容
- **智能相关性判断**：基于关键词匹配自动判断参考文件内容是否与PPT相关
- **优先使用**：如果参考文件与PPT内容相关，LLM会优先使用参考文件内容进行扩充

### 7. 知识扩充
- **背景说明**：为每个知识点补充背景知识
- **原理阐述**：深入解释核心概念和原理
- **公式推导**：提供数学公式的详细推导过程（LaTeX格式）
- **代码示例**：提供可运行的代码示例
- **要点总结**：提炼关键知识点

### 8. 多维搜索（性能优化）
- **LLM关键词提取**：使用LLM智能提取3-5个核心关键词，而非简单截取文本，提升搜索准确性
- **并行搜索**：使用ThreadPoolExecutor并行执行所有搜索源，速度提升70-80%
- **智能源选择**：有参考文件时只搜索Arxiv（1个源），无参考文件时搜索全部4个源
- **超时保护**：每个搜索源2秒超时，避免单个源阻塞整体流程
- **搜索源**：Arxiv、Semantic Scholar、Crossref、OpenAlex（Wikipedia已禁用，因其太慢且容易失败）
- **期刊过滤**：自动过滤并优先展示高质量期刊论文

### 9. 导出功能
- **Markdown导出**：支持Markdown格式导出，方便后续编辑
- **PDF导出**：支持PDF格式导出（已支持中文字体），方便打印和分享
- **公式渲染**：使用KaTeX渲染数学公式
- **代码高亮**：使用Prism.js高亮代码
- **引用显示**：美观的参考文献展示和引用格式

### 10. 现代化用户界面
- **宽屏适配**：登录/注册页采用左右分栏设计，左侧展示品牌视觉，右侧聚焦表单
- **流畅动画**：页面切换和组件加载增加微交互动画（Fade/Slide）
- **现代化组件**：使用Tailwind CSS重构按钮、卡片、输入框等基础组件
- **进度条优化**：进度条显示在右侧界面最上方，处理完成后自动消失
- **实时进度显示**：显示当前处理阶段（提取关键词、检索文献、生成内容等）
- **进度条动画**：分段显示处理进度，每个阶段完成后进度条增长
- **参考文献折叠**：默认收起，点击展开查看详细内容
- **参考文件管理**：支持上传、查看和删除参考文件，拖拽上传提升体验
- **空状态提示**：当页面没有可选中内容时，显示友好提示信息

---

## API文档

启动服务后，访问以下地址查看API文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要API端点

| 模块 | 端点 | 方法 | 说明 |
|------|------|------|------|
| **认证** | `/api/v1/auth/register` | POST | 用户注册 |
| | `/api/v1/auth/login` | POST | 用户登录（JWT） |
| | `/api/v1/users/me` | GET | 获取当前用户信息 |
| **学习计划** | `/api/v1/plan/generate` | POST | 生成学习计划（LLM） |
| | `/api/v1/plans` | GET | 获取用户所有计划 |
| | `/api/v1/plan/save` | POST | 保存学习计划 |
| | `/api/v1/goals` | GET/POST | 获取/设置学习目标 |
| **PPT处理** | `/api/v1/upload` | POST | 上传PPT文件 |
| | `/api/v1/process-url` | POST | 从URL处理PPT |
| | `/api/v1/expand` | POST | 扩充单个知识点（支持参考文件） |
| | `/api/v1/search` | POST | 多源搜索 |
| | `/api/v1/vector-search` | POST | 向量语义搜索 |
| | `/api/v1/export` | POST | 导出内容（Markdown/PDF） |
| | `/api/v1/download/{filename}` | GET | 下载导出文件 |
| **参考文件** | `/api/v1/upload-reference` | POST | 上传参考文件（Word/PDF） |
| | `/api/v1/reference/{file_id}` | GET | 获取参考文件信息 |
| | `/api/v1/reference/{file_id}` | DELETE | 删除参考文件 |
| **系统** | `/health` | GET | 健康检查 |

---

## 核心功能流程

### 1. PPT上传与解析
```
用户上传PPT → 保存文件 → python-pptx解析 → 提取文本/图片/结构 → 返回结构化数据
```

### 2. 参考文件上传与解析
```
用户上传参考文件（Word/PDF） → 保存文件 → 快速解析（python-docx/PyMuPDF） → 
提取文本内容 → 判断与PPT内容相关性 → 存储解析结果 → 返回文件ID
```

### 3. 知识扩充（性能优化版）
```
选择知识点 → LLM提取关键词（3-5个核心关键词） → 检查是否有参考文件 → 
  ├─ 有参考文件：只搜索Arxiv（并行，1-2秒）
  └─ 无参考文件：搜索全部4个源（并行，2-3秒）
→ 过滤高质量期刊 → 融合参考文件和搜索结果到Prompt（优先使用参考文件） → 
调用LLM（DeepSeek-V3.2-Exp） → 生成扩展内容 → 整合参考文献 → 返回结果
```

### 4. 多维搜索（并行优化）
```
LLM提取关键词 → 并行搜索多个源（ThreadPoolExecutor） → 
超时保护（每个源2秒） → 期刊质量过滤 → 整合结果 → 返回相关资源
```

---

## 目录结构

```
.
├── app/                          # 主应用代码
│   ├── main.py                   # FastAPI应用入口
│   └── config.py                 # 配置管理
├── api/                          # API路由定义
│   ├── routes.py                 # PPT处理相关路由
│   ├── auth_routes.py            # 认证相关路由（新增）
│   └── learning_routes.py        # 学习计划相关路由（新增）
├── services/                      # 业务服务层
│   ├── parser.py                 # PPT解析服务
│   ├── reference_parser.py       # 参考文件解析服务
│   ├── image_recognizer.py       # 图片识别服务（新增）
│   ├── knowledge_expander.py     # 知识扩充服务
│   ├── search_service.py         # 多源搜索服务（并行优化）
│   ├── user_service.py           # 用户管理服务（新增）
│   └── export_service.py         # 导出服务
├── utils/                        # 工具类
│   ├── llm_factory.py           # LLM实例工厂
│   ├── vector_db.py             # 向量数据库工具
│   ├── auth.py                  # JWT认证工具（新增）
│   └── prompts.py               # Prompt模板
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── components/          # React组件
│   │   │   ├── Auth/            # 登录注册组件（新增）
│   │   │   ├── Dashboard/       # 仪表盘组件（新增）
│   │   │   ├── UserProfile/     # 用户中心组件（新增）
│   │   │   ├── PPTFeature/      # PPT功能组件（新增）
│   │   │   └── ...              # 其他组件
│   │   ├── services/            # 前端API服务封装（新增）
│   │   ├── App.tsx             # 主应用组件
│   │   └── main.tsx            # 应用入口
│   └── package.json             # 前端依赖
├── output/                       # 输出文件目录
│   └── users.json               # 用户数据文件（新增）
├── Dockerfile                   # Docker构建文件
├── docker-compose.yml           # Docker Compose配置
├── requirements.txt             # Python依赖
└── README.md                    # 项目说明文档
```

---

## 性能优化说明

### 已实现的优化
1. **LLM关键词提取**：使用LLM智能提取关键词，而非简单截取文本，提升搜索准确性
2. **并行搜索**：使用ThreadPoolExecutor并行执行所有搜索源，从串行5-10秒优化到并行1-3秒
3. **智能源选择**：有参考文件时只搜索1个源（Arxiv），无参考文件时搜索4个源，节省40-60%搜索时间
4. **超时保护**：每个搜索源2秒超时，避免单个源阻塞整体流程
5. **快速验证模式**：优化验证流程，减少LLM调用次数
6. **内容智能过滤**：自动过滤纯数字、人名等无意义内容，提升用户体验
7. **Wikipedia禁用**：因Wikipedia搜索太慢且容易失败，已完全禁用

### 性能提升
- **有参考文件时**：总耗时从10-20秒降至6-10秒（提升约50%）
- **无参考文件时**：总耗时从10-20秒降至8-12秒（提升约40%）
- **搜索阶段**：从5-10秒降至1-3秒（提升约70-80%）
- **关键词提取**：使用LLM提取关键词，虽然增加约1-2秒，但搜索准确性显著提升

---

## 技术说明

### 大语言模型配置
- **模型**: deepseek-ai/DeepSeek-V3.2-Exp
- **API服务**: SiliconFlow (https://api.siliconflow.cn/v1)
- **温度参数**: 0.7
- **最大Token**: 4096

### LLM Agent设计
- **工具链**：PPT解析、知识扩充、验证、多源搜索、向量检索
- **工作流**：输入PPT → 解析结构 → 提取知识点 → 多源搜索 → LLM生成扩展 → 验证准确性 → 输出结果
- **容错机制**：事实验证、逻辑检查、异常处理

---

## 功能检查清单

| 功能 | 状态 | 说明 |
|------|------|------|
| **核心功能（版本1）** | | |
| 语义解析 | ✅ | 使用python-pptx解析PPT层级结构，智能提取标题、表格、备注页 |
| 内容智能过滤 | ✅ | 自动过滤纯数字、人名、页码等无意义内容 |
| 参考文件上传 | ✅ | 支持Word/PDF上传，快速解析，智能相关性判断 |
| LLM关键词提取 | ✅ | 使用LLM智能提取3-5个核心关键词，提升搜索准确性 |
| 知识扩充 | ✅ | LLM驱动，优先使用参考文件 |
| 多维搜索 | ✅ | 整合4个外部资源（Arxiv、Semantic Scholar、Crossref、OpenAlex），并行执行，带超时保护 |
| **图片识别（版本2）** | | |
| OCR文字识别 | ✅ | 支持pytesseract和easyocr，识别中英文文字 |
| 视觉模型分析 | ✅ | 基于LLM生成图片内容描述 |
| 批量识别 | ✅ | 支持批量处理PPT中的多张图片 |
| **用户系统（版本3）** | | |
| 用户注册/登录 | ✅ | JWT token认证，密码加密存储 |
| 权限管理 | ✅ | 基于token的API访问控制 |
| 学习计划生成 | ✅ | LLM生成个性化学习计划，包含周目标和每日任务 |
| 用户成长中心 | ✅ | Dashboard展示学习进度，个人资料管理 |
| 现代化UI | ✅ | 响应式设计，流畅动画，Tailwind CSS |
| **通用功能** | | |
| 期刊过滤 | ✅ | 自动过滤并优先展示高质量期刊论文 |
| 参考文献显示 | ✅ | 美观的参考文献卡片展示，支持折叠/展开 |
| 实时进度显示 | ✅ | 显示当前处理阶段，分段进度条动画 |
| 向量数据库 | ✅ | 使用Milvus进行语义检索 |
| Docker部署 | ✅ | 完整的Dockerfile和docker-compose.yml |
| Prompt工程 | ✅ | 结构化Prompt模板，支持参考文件优先 |
| Check Layer | ✅ | 验证机制防止LLM幻觉 |
| 导出功能 | ✅ | 支持Markdown和PDF导出 |
| 公式渲染 | ✅ | 使用KaTeX渲染数学公式 |
| 代码高亮 | ✅ | 使用Prism.js高亮代码 |

---

## 常见问题

### 问题1：端口被占用
```bash
# 检查端口占用
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# 解决方法：修改docker-compose.yml中的端口映射
```

### 问题2：Docker服务启动失败
```bash
# 查看详细错误日志
docker-compose logs

# 重启Docker服务
sudo systemctl restart docker  # Linux
```

### 问题3：Milvus连接失败
```bash
# 检查Milvus服务状态
docker-compose ps milvus-standalone

# 查看Milvus日志
docker-compose logs milvus-standalone
```

### 问题4：前端启动失败
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 许可证

本项目仅用于课程作业，请勿用于商业用途。

---

## 联系方式

如有问题，请通过GitHub Issues反馈。
