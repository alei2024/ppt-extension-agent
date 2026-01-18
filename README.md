# PPT内容扩展智能体

基于云原生架构和LLM Agent技术构建的PPT内容扩展学习助手系统。

## 项目简介

本系统能够自动解析PPT文件结构，识别知识点层级，并通过调用大语言模型（基于SiliconFlow的DeepSeek-V3.2-Exp）和外部知识源，为PPT内容补充背景说明、公式推导、代码示例等扩展信息。

### 核心价值
- **提高学习效率**：自动补充PPT中缺失的背景知识和深度解释
- **多维度扩展**：提供背景说明、原理阐述、公式推导、代码示例、要点总结
- **权威知识源**：整合Wikipedia、Arxiv等外部学术资源
- **智能验证**：内置Check layer机制，防止LLM幻觉

---

## 技术架构

### 云原生组件
- **Docker**: 容器化部署，确保环境一致性
- **Docker Compose**: 多服务编排，一键启动
- **Redis**: 缓存和任务队列，提升性能
- **Milvus**: 向量数据库，实现语义检索

### LLM Agent技术栈
- **LangChain**: Agent框架，提供工具链支持
- **LangGraph**: 工作流编排，实现复杂推理链路
- **SiliconFlow API**: 大语言模型接口（使用DeepSeek-V3.2-Exp模型）

### 前端技术栈
- **React 18**: 现代化前端框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 快速样式开发
- **KaTeX**: 数学公式渲染
- **Prism.js**: 代码高亮

### 核心功能模块
- **PPT解析**: 使用python-pptx进行文档解析
- **语义分析**: 基于向量数据库的相似度检索
- **知识扩充**: LLM驱动的知识扩展
- **多维搜索**: 整合Wikipedia、Arxiv等外部资源
- **导出功能**: 支持Markdown和PDF格式导出

---

## 目录结构

```
.
├── app/                          # 主应用代码
│   ├── __init__.py
│   ├── main.py                   # FastAPI应用入口
│   └── config.py                 # 配置管理（使用Pydantic Settings）
│
├── agents/                       # LLM Agent模块
│   ├── __init__.py
│   └── ppt_agent.py             # PPT处理智能体（LangGraph工作流）
│
├── services/                     # 业务服务层
│   ├── __init__.py
│   ├── parser.py                # PPT解析服务（python-pptx）
│   ├── knowledge_expander.py    # 知识扩充服务（LLM驱动）
│   ├── search_service.py        # 多源搜索服务（Wikipedia + Arxiv）
│   └── export_service.py       # 导出服务（Markdown + PDF）
│
├── utils/                        # 工具类
│   ├── __init__.py
│   ├── llm_factory.py           # LLM实例工厂（统一管理模型配置）
│   ├── vector_db.py             # 向量数据库工具（Milvus）
│   └── prompts.py               # Prompt模板（结构化提示词）
│
├── api/                          # API路由
│   ├── __init__.py
│   └── routes.py                # 路由定义（所有API端点）
│
├── frontend/                     # 前端应用
│   ├── src/
│   │   ├── components/          # React组件
│   │   │   ├── UploadArea/     # 上传区域组件
│   │   │   ├── PPTViewer/      # PPT查看器组件
│   │   │   ├── ExpansionPanel/  # 扩展内容面板组件
│   │   │   ├── ProgressBar/    # 进度条组件
│   │   │   ├── MathRenderer/    # 数学公式渲染组件（KaTeX）
│   │   │   └── CodeHighlighter/ # 代码高亮组件（Prism.js）
│   │   ├── App.tsx             # 主应用组件
│   │   ├── main.tsx            # 应用入口
│   │   └── index.css           # 全局样式
│   ├── package.json             # 前端依赖
│   ├── vite.config.ts          # Vite配置
│   └── tailwind.config.js      # Tailwind CSS配置
│
├── uploads/                     # 上传文件存储目录
├── output/                      # 导出文件存储目录
├── logs/                        # 日志文件目录
│
├── Dockerfile                   # Docker构建文件
├── docker-compose.yml           # Docker Compose配置
├── requirements.txt             # Python依赖
├── .env                        # 环境变量配置（需自行创建）
├── env.example                 # 环境变量模板
├── .gitignore                  # Git忽略文件
└── README.md                   # 项目说明文档
```

---

## 核心功能

### 1. PPT语义解析
- **层级结构识别**：自动识别目录、主标题、子标题、正文
- **文本提取**：提取所有文本框内容
- **图片描述**：识别PPT中的图片位置和描述
- **表格解析**：提取表格数据

### 2. 知识扩充
- **背景说明**：为每个知识点补充背景知识
- **原理阐述**：深入解释核心概念和原理
- **公式推导**：提供数学公式的详细推导过程
- **代码示例**：提供可运行的代码示例
- **要点总结**：提炼关键知识点

### 3. 多维搜索
- **Wikipedia搜索**：获取权威百科知识
- **Arxiv搜索**：获取最新学术论文
- **语义检索**：基于向量数据库的相关内容检索

### 4. 导出功能
- **Markdown导出**：支持Markdown格式导出，方便后续编辑
- **PDF导出**：支持PDF格式导出，方便打印和分享
- **公式渲染**：使用KaTeX渲染数学公式
- **代码高亮**：使用Prism.js高亮代码

### 5. 智能验证
- **Check layer机制**：验证LLM生成内容的准确性
- **多源验证**：通过多个知识源交叉验证
- **异常处理**：处理LLM幻觉和错误输出

---

## 快速开始

### 📋 前置检查

在开始之前，请确保你的系统已安装：

```bash
# 检查Docker版本（需要 >= 20.10）
docker --version

# 检查Docker Compose版本（需要 >= 2.0）
docker-compose --version

# 检查Node.js版本（需要 >= 18，用于前端开发）
node --version

# 如果没有安装，请访问：
# Docker: https://docs.docker.com/get-docker/
# Docker Compose: https://docs.docker.com/compose/install/
# Node.js: https://nodejs.org/
```

### 🚀 方式一：Docker Compose 一键启动（推荐）

**适用于：** 快速体验、生产部署

#### 步骤 1：克隆项目

```bash
# 从GitHub克隆项目
git clone https://github.com/alei2024/ppt-extension-agent.git
cd ppt-extension-agent
```

#### 步骤 2：配置环境变量（可选）

**注意：** 项目代码中已内置默认API配置，**即使不创建.env文件也可以直接运行**。

如需自定义配置或修改环境变量：

```bash
# 创建环境变量文件（从模板复制）
cp env.example .env

# 编辑环境变量（可选，默认配置即可使用）
# Windows: notepad .env
# Mac/Linux: nano .env 或 vim .env
```

**配置说明：**
- `env.example` 文件包含完整的配置模板和默认值
- 默认已配置好 SiliconFlow API 密钥，可直接使用
- 如需使用自己的API密钥，修改 `.env` 文件中的 `LLM_API_KEY` 即可

#### 步骤 3：启动所有服务

```bash
# 构建镜像并启动所有服务（首次运行会下载镜像，需要几分钟）
docker-compose up -d --build

# 查看服务启动状态
docker-compose ps

# 等待所有服务启动完成（约30-60秒），查看日志确认
docker-compose logs -f ppt-agent
```

**预期输出：** 看到 "Application startup complete" 表示启动成功

#### 步骤 4：启动前端

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次运行）
npm install

# 启动前端开发服务器
npm run dev
```

访问 **http://localhost:3000** 查看前端界面。

#### 步骤 5：验证服务

```bash
# 访问健康检查端点
curl http://localhost:8000/health

# 或访问API文档（推荐）
# 浏览器打开：http://localhost:8000/docs
```

#### 常用命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看主服务日志
docker-compose logs -f ppt-agent

# 查看所有服务日志
docker-compose logs -f

# 停止所有服务
docker-compose down

# 停止并删除数据卷（清理数据）
docker-compose down -v

# 重启服务
docker-compose restart

# 重建并启动（代码更新后）
docker-compose up -d --build
```

---

### 💻 方式二：本地开发模式

**适用于：** 代码开发、调试

#### 步骤 1：克隆项目

```bash
git clone <your-repo-url>
cd FinalProj
```

#### 步骤 2：创建Python虚拟环境

```bash
# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

#### 步骤 3：安装Python依赖

```bash
# 升级pip
pip install --upgrade pip

# 安装项目依赖（可能需要几分钟）
pip install -r requirements.txt
```

#### 步骤 4：配置环境变量

**注意：** 项目代码中已内置默认API配置，**即使不创建.env文件也可以直接运行**。

如需自定义配置：

```bash
# 创建环境变量文件（从模板复制）
cp env.example .env

# 编辑环境变量（可选，默认配置即可使用）
# 默认已配置好 SiliconFlow API 密钥
# Windows: notepad .env
# Mac/Linux: nano .env
```

#### 步骤 5：启动依赖服务（Redis、Milvus等）

```bash
# 只启动依赖服务，不启动主应用
docker-compose up -d redis milvus-standalone etcd minio

# 等待服务启动（约30秒）
docker-compose ps
```

#### 步骤 6：启动主应用

```bash
# 启动FastAPI应用（开发模式，支持热重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 看到以下输出表示启动成功：
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

#### 步骤 7：启动前端

```bash
# 进入前端目录
cd frontend

# 安装依赖（首次运行）
npm install

# 启动前端开发服务器
npm run dev
```

访问 **http://localhost:3000** 查看前端界面。

#### 步骤 8：验证服务

浏览器访问：**http://localhost:8000/docs**

---

### ⚠️ 常见问题排查

#### 问题1：端口被占用

```bash
# 检查8000端口是否被占用
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# 解决方法1：修改docker-compose.yml中的端口映射
# 将 "8000:8000" 改为 "8001:8000"

# 解决方法2：停止占用端口的进程
```

#### 问题2：Docker服务启动失败

```bash
# 查看详细错误日志
docker-compose logs

# 检查Docker是否运行
docker ps

# 重启Docker服务
sudo systemctl restart docker  # Linux
```

#### 问题3：Milvus连接失败

```bash
# 检查Milvus服务状态
docker-compose ps milvus-standalone

# 查看Milvus日志
docker-compose logs milvus-standalone

# 重启Milvus服务
docker-compose restart milvus-standalone
```

#### 问题4：API调用失败

```bash
# 检查API密钥配置
cat .env | grep LLM_API_KEY

# 测试API连接
curl -X GET "http://localhost:8000/health"
```

#### 问题5：依赖安装失败

```bash
# 使用国内镜像源加速
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

# 或单独安装失败的包
pip install <package-name> -i https://pypi.tuna.tsinghua.edu.cn/simple
```

#### 问题6：前端启动失败

```bash
# 清除缓存重新安装
cd frontend
rm -rf node_modules package-lock.json
npm install

# 或使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

---

### ✅ 启动成功检查清单

- [ ] Docker和Docker Compose已安装并运行
- [ ] 项目已克隆到本地
- [ ] 环境变量文件已配置（或使用默认配置）
- [ ] 所有Docker服务状态为 `Up`（`docker-compose ps`）
- [ ] 主服务日志显示 "Application startup complete"
- [ ] 可以访问 http://localhost:8000/docs 看到API文档
- [ ] 可以访问 http://localhost:3000 看到前端界面
- [ ] 健康检查端点返回 `{"status":"healthy"}`

---

## API文档

启动服务后，访问以下地址查看API文档：
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 主要API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/v1/upload` | POST | 上传PPT文件 |
| `/api/v1/process-url` | POST | 从URL处理PPT |
| `/api/v1/expand` | POST | 扩充单个知识点 |
| `/api/v1/expand-with-validation` | POST | 带验证的知识扩充 |
| `/api/v1/batch-expand` | POST | 批量扩充知识点 |
| `/api/v1/search` | POST | 多源搜索 |
| `/api/v1/vector-search` | POST | 向量语义搜索 |
| `/api/v1/export` | POST | 导出内容（Markdown/PDF） |
| `/api/v1/download/{filename}` | GET | 下载导出文件 |
| `/api/v1/health` | GET | 健康检查 |

---

## 核心功能流程

### 1. PPT上传与解析
```
用户上传PPT → 保存文件 → python-pptx解析 → 提取文本/图片/结构 → 返回结构化数据
```

### 2. 语义分析与存储
```
PPT切片 → sentence-transformers向量化 → 存储到Milvus → 建立索引
```

### 3. 知识扩充
```
选择知识点 → 调用LLM（DeepSeek-V3.2-Exp） → 生成扩展内容 → 验证准确性 → 返回结果
```

### 4. 多维搜索
```
提取关键词 → 调用Wikipedia API → 调用Arxiv API → 整合结果 → 返回相关资源
```

### 5. 结果整合与导出
```
合并原始内容与扩展信息 → 生成结构化笔记 → 导出Markdown/PDF → 下载文件
```

---

## 智能体策略

### Prompt工程

本项目使用结构化的Prompt模板，确保LLM生成高质量内容。

#### 知识扩充Prompt模板
```python
KNOWLEDGE_EXPANSION_PROMPT = """
你是一个专业的知识扩充助手，擅长为PPT内容补充详细的学习资料。

任务：为以下知识点生成扩展内容

知识点标题：{title}
知识点内容：{content}
上下文信息：{context}

请按照以下结构生成扩展内容：

1. 背景说明
   - 介绍该知识点的起源和发展背景
   - 说明其在相关领域的重要性
   - 提供相关的历史信息

2. 原理阐述
   - 详细解释核心概念和原理
   - 使用通俗易懂的语言
   - 提供实际应用场景

3. 公式推导
   - 如果涉及数学公式，提供完整的推导过程
   - 解释每个符号的含义
   - 说明公式的物理意义

4. 代码示例
   - 提供可运行的代码示例
   - 添加详细的注释
   - 说明代码的输入输出

5. 要点总结
   - 提炼3-5个关键要点
   - 使用简洁的语言
   - 便于记忆和理解

注意事项：
- 确保内容的准确性和权威性
- 避免编造不存在的信息
- 如果不确定某些信息，请明确说明
- 使用Markdown格式输出
"""
```

#### 验证Prompt模板
```python
VALIDATION_PROMPT = """
你是一个严格的内容验证专家，负责检查LLM生成内容的准确性。

原始内容：{original_content}
扩展内容：{expanded_content}

请检查以下方面：

1. 事实准确性
   - 扩展内容是否与原始内容一致
   - 是否存在明显的错误或矛盾
   - 是否编造了不存在的信息

2. 逻辑连贯性
   - 扩展内容是否逻辑清晰
   - 各部分之间是否连贯
   - 是否存在逻辑跳跃

3. 完整性
   - 是否覆盖了所有要求的方面
   - 是否有重要的遗漏
   - 结构是否完整

请给出验证结果：
- 通过/不通过
- 具体问题（如果有）
- 改进建议（如果有）
"""
```

### LLM Agent设计

#### 工具链（Tools）
1. **PPT解析工具**：解析PPT文件结构
2. **知识扩充工具**：调用LLM生成扩展内容
3. **验证工具**：验证生成内容的准确性
4. **搜索工具**：调用Wikipedia、Arxiv等API
5. **向量检索工具**：基于Milvus的语义检索

#### 工作流（Workflow）
```
输入PPT → 解析结构 → 提取知识点 → 
  ├─ 向量检索相关内容
  ├─ 多源搜索外部资源
  ├─ LLM生成扩展内容
  └─ 验证内容准确性
→ 整合结果 → 输出扩展内容
```

#### 容错机制（Check Layer）
1. **事实验证**：通过多个知识源交叉验证
2. **逻辑检查**：检查生成内容的逻辑一致性
3. **异常处理**：处理LLM幻觉和错误输出
4. **人工审核**：提供人工审核接口

---

## 分工说明

### 团队角色划分

本项目采用"算法/Agent组"和"架构/工程组"的分工模式，确保技术深度和工程质量的平衡。

---

### 架构/工程组（50%）

#### 负责人：架构工程师

#### 主要职责
1. **云原生架构设计**
   - Docker容器化部署方案
   - Docker Compose多服务编排
   - 微服务架构设计
   - 服务间通信机制

2. **基础设施搭建**
   - Redis缓存和任务队列配置
   - Milvus向量数据库部署
   - MinIO对象存储配置
   - etcd分布式配置管理

3. **后端工程实现**
   - FastAPI框架搭建
   - API路由设计
   - 文件上传和下载功能
   - 导出服务实现（Markdown/PDF）

4. **前端工程实现**
   - React 18 + TypeScript项目搭建
   - Tailwind CSS样式系统
   - 组件化开发
   - 状态管理

5. **工程优化**
   - 性能优化和缓存策略
   - 错误处理和日志系统
   - Docker镜像优化
   - CI/CD流程设计

#### 具体贡献
- [x] Dockerfile和docker-compose.yml编写
- [x] FastAPI应用架构设计
- [x] 前端项目脚手架搭建
- [x] 文件上传和导出功能实现
- [x] API接口设计和文档
- [x] README文档编写
- [x] 环境配置和部署指南

#### 技术亮点
- 完整的云原生架构，支持一键部署
- 模块化的代码结构，易于维护和扩展
- 健壮的错误处理和日志系统
- 用户友好的前端界面

---

### 算法/Agent组（50%）

#### 负责人：算法工程师

#### 主要职责
1. **PPT解析算法**
   - python-pptx文档解析
   - 层级结构识别
   - 文本提取和清洗
   - 图片和表格解析

2. **LLM Agent设计**
   - LangChain框架集成
   - LangGraph工作流编排
   - 工具链设计和实现
   - Agent推理链路优化

3. **Prompt工程**
   - 知识扩充Prompt设计
   - 验证Prompt设计
   - Prompt模板优化
   - 针对DeepSeek模型的调优

4. **知识验证机制**
   - Check layer实现
   - 多源验证策略
   - 幻觉检测和过滤
   - 异常处理机制

5. **多维搜索算法**
   - Wikipedia API集成
   - Arxiv API集成
   - 语义检索算法
   - 结果整合和排序

#### 具体贡献
- [x] PPT解析服务实现（parser.py）
- [x] 知识扩充服务实现（knowledge_expander.py）
- [x] 多源搜索服务实现（search_service.py）
- [x] Prompt模板设计和优化（prompts.py）
- [x] LLM工厂模式实现（llm_factory.py）
- [x] 向量数据库工具实现（vector_db.py）
- [x] Check layer验证机制
- [x] 数学公式渲染（KaTeX）
- [x] 代码高亮（Prism.js）

#### 技术亮点
- 结构化的Prompt设计，确保生成质量
- 多层验证机制，有效防止LLM幻觉
- 多源知识整合，提升内容权威性
- 语义检索技术，实现智能关联

---

### 协作机制

#### 代码协作
- 使用Git进行版本控制
- 通过Pull Request进行代码审查
- 统一的代码规范和风格
- 完善的注释和文档

#### 技术交流
- 定期技术分享会
- 联合调试和问题排查
- 技术方案评审
- 知识沉淀和文档共享

#### 项目管理
- 使用TodoList跟踪任务进度
- 定期进度同步会议
- 风险识别和应对
- 质量保证和测试

---

## 开发建议

### 架构组任务
- [x] Docker容器化部署
- [x] 微服务架构设计
- [x] Redis缓存策略
- [x] 向量数据库优化
- [ ] Kubernetes部署（可选）
- [ ] 监控和日志系统（可选）

### Agent组任务
- [x] Prompt工程优化（针对DeepSeek模型调优）
- [x] LLM Agent工作流设计（使用LangGraph构建）
- [x] 知识验证与容错机制（Check layer实现）
- [x] 多源知识整合策略
- [ ] CoT（Chain of Thought）优化（可选）
- [ ] Few-shot Learning（可选）

---

## 技术说明

### 大语言模型配置
本项目使用 **SiliconFlow API** 提供的 **DeepSeek-V3.2-Exp** 模型。所有LLM实例通过 `utils/llm_factory.py` 统一创建，确保配置一致性。

### 模型特点
- **模型**: deepseek-ai/DeepSeek-V3.2-Exp
- **API服务**: SiliconFlow (https://api.siliconflow.cn/v1)
- **温度参数**: 0.7（平衡创造性和准确性）
- **最大Token**: 4096

### 配置方式
可以通过环境变量或配置文件（`app/config.py`）修改模型配置，系统会自动读取配置并应用到所有LLM实例中。

---

## 作业要求检查

### ✅ 已完成的功能

| 要求 | 状态 | 说明 |
|------|------|------|
| 语义解析 | ✅ | 使用python-pptx解析PPT层级结构 |
| 知识扩充 | ✅ | LLM驱动，生成背景、原理、公式、代码、总结 |
| 多维搜索 | ✅ | 整合Wikipedia、Arxiv等外部资源 |
| 向量数据库 | ✅ | 使用Milvus进行语义检索 |
| Docker部署 | ✅ | 完整的Dockerfile和docker-compose.yml |
| Prompt工程 | ✅ | 结构化Prompt模板 |
| Check Layer | ✅ | 验证机制防止LLM幻觉 |
| 导出功能 | ✅ | 支持Markdown和PDF导出 |
| 公式渲染 | ✅ | 使用KaTeX渲染数学公式 |
| 代码高亮 | ✅ | 使用Prism.js高亮代码 |

### 📦 交付物清单

| 交付物 | 状态 | 说明 |
|--------|------|------|
| 代码仓库 | ✅ | 完整的源码和配置文件 |
| Dockerfile | ✅ | 容器化部署配置 |
| 依赖配置 | ✅ | requirements.txt和package.json |
| 环境配置指南 | ✅ | README.md包含详细说明 |
| API文档 | ✅ | Swagger UI自动生成 |

---

## 待解决问题

### 1. PDF中文显示问题
**问题描述**：导出的PDF文件中，中文字符显示为黑框或乱码。

**原因分析**：
- reportlab默认字体不支持中文字符
- 需要安装中文字体文件并在代码中指定字体

**解决方案**：
- 在Dockerfile中安装中文字体（如思源黑体、微软雅黑等）
- 在export_service.py中配置reportlab使用中文字体
- 或使用其他支持中文的PDF生成库（如pdfkit + wkhtmltopdf）

**当前状态**：Markdown导出正常，PDF导出功能已实现但中文显示异常。

---

### 2. Milvus向量数据库服务异常
**问题描述**：Milvus容器持续重启，无法正常启动。

**原因分析**：
- Milvus v2.3.0镜像的启动命令可能存在问题
- 依赖服务（etcd、minio）的配置可能不兼容
- Windows环境下Docker的网络配置可能有限制

**解决方案**：
- 尝试使用Milvus的更新版本（如v2.4.x）
- 检查etcd和minio的配置是否正确
- 考虑使用其他向量数据库（如Pinecone、Qdrant）作为替代方案
- 或使用本地向量库（如FAISS）替代Milvus

**当前状态**：Milvus服务异常，但不影响核心功能使用。系统已降级为不依赖Milvus的模式运行。

---

## 后续工作

### 1. 功能扩展

#### 1.1 多语言支持
- 支持英文PPT的解析和扩展
- 支持双语对照显示
- 自动识别PPT语言并切换模型

#### 1.2 多格式支持
- 支持PDF文档的解析和扩展
- 支持Word文档的解析和扩展
- 支持图片OCR识别

#### 1.3 智能推荐
- 基于用户学习历史的个性化推荐
- 相关知识点自动关联
- 学习路径智能规划

#### 1.4 协作功能
- 支持多人协作编辑扩展内容
- 评论和讨论功能
- 版本控制和历史记录

---

### 2. 技术优化

#### 2.1 性能优化
- 实现异步处理，提升大文件处理速度
- 添加Redis缓存，减少重复计算
- 优化向量检索算法，提升搜索效率

#### 2.2 架构升级
- 迁移到Kubernetes，实现自动扩缩容
- 引入消息队列（RabbitMQ/Kafka），实现任务异步处理
- 添加监控和告警系统（Prometheus + Grafana）

#### 2.3 模型优化
- 尝试其他大语言模型（如GPT-4、Claude）
- 实现模型微调，提升特定领域的扩展质量
- 添加Few-shot Learning，提升生成质量

#### 2.4 安全加固
- 添加用户认证和授权（JWT/OAuth）
- 实现API限流和防爬虫
- 添加内容审核机制，过滤敏感信息

---

### 3. 用户体验优化

#### 3.1 界面优化
- 优化移动端适配
- 添加暗色模式
- 改进交互设计，提升易用性

#### 3.2 功能增强
- 添加导出预览功能
- 支持自定义导出模板
- 添加打印优化功能

#### 3.3 智能化增强
- 实现自动摘要生成
- 添加知识点难度评估
- 实现学习进度跟踪

---

### 4. 创新点

#### 4.1 多模态理解
- 结合图片和文本进行语义理解
- 实现图表自动解读
- 支持视频内容的智能分析

#### 4.2 知识图谱构建
- 自动构建知识点之间的关联关系
- 可视化知识图谱
- 支持图谱导航和探索

#### 4.3 个性化学习助手
- 基于用户画像的个性化推荐
- 智能问答系统
- 学习计划自动生成

#### 4.4 实时协作
- 实时多人协作编辑
- 在线讨论和答疑
- 学习小组功能

---

### 5. 评估与反馈

#### 5.1 质量评估
- 实现自动质量评估指标
- 用户反馈收集和分析
- A/B测试不同模型和策略

#### 5.2 持续改进
- 基于用户反馈持续优化
- 定期更新Prompt模板
- 引入新的数据源和工具

---

## 许可证

本项目仅用于课程作业，请勿用于商业用途。

---

## 联系方式

如有问题，请通过GitHub Issues反馈。
