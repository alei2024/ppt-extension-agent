# 项目执行逻辑文档

## 项目概述

本项目是一个基于云原生架构和LLM Agent技术的PPT内容扩展学习助手系统。系统能够自动解析PPT文件，提取文本和图片内容，并通过大语言模型为PPT内容生成扩展学习材料。

## 项目架构

### 目录结构
```
FinalProj/
├── app/                    # 主应用入口
│   ├── main.py            # FastAPI应用主入口
│   └── config.py          # 配置管理
├── api/                    # API路由层
│   └── routes.py          # 所有API端点定义
├── services/               # 业务服务层
│   ├── parser.py          # PPT解析服务
│   ├── knowledge_expander.py  # 知识扩充服务
│   ├── search_service.py  # 多源搜索服务
│   ├── export_service.py  # 导出服务
│   └── image_recognizer.py  # 图片识别服务（新增）
├── agents/                 # LLM Agent模块
│   └── ppt_agent.py        # PPT处理智能体（部分实现）
├── utils/                 # 工具类
│   ├── llm_factory.py     # LLM实例工厂
│   ├── vector_db.py       # 向量数据库工具
│   └── prompts.py         # Prompt模板
└── frontend/              # 前端应用（React + TypeScript）
```

## 核心执行流程

### 1. PPT上传与解析流程

**入口文件**: `api/routes.py` → `/api/v1/upload` 端点

**执行顺序**:
1. **接收上传文件** (`api/routes.py:61-120`)
   - 用户通过POST请求上传PPT文件
   - 验证文件格式（仅支持.pptx和.ppt）
   - 生成唯一task_id
   - 保存文件到 `./uploads/` 目录

2. **解析PPT文件** (`services/parser.py:26-68`)
   - 调用 `PPTParser.parse_from_file(file_path)`
   - 使用 `python-pptx` 库打开PPT文件
   - 遍历所有幻灯片，调用 `_parse_slide()` 解析每一页
   - 提取元数据（文件名、作者、创建时间等）

3. **解析单个幻灯片** (`services/parser.py:111-151`)
   - 遍历幻灯片中的所有形状（shapes）
   - 识别标题（shape_type == 14）
   - 解析文本框（`_parse_text_box()`）
   - 解析图片（`_parse_image()`）- **提取图片文件并识别内容**
     - 提取图片二进制数据并保存到 `./uploads/images/` 目录
     - 调用图片识别服务识别图片内容（OCR + 视觉模型）
     - 将识别结果（文字和描述）关联到图片数据
   - 解析表格（`_parse_table()`）
   - 提取备注（notes）

4. **提取文本切片** (`services/parser.py:381-430`)
   - 调用 `PPTParser.extract_text_chunks(ppt_data)`
   - 将每页文本按chunk_size（默认500字符）切分
   - 为每个切片生成唯一chunk_id

5. **向量化存储** (`api/routes.py:95-101`)
   - 尝试连接Milvus向量数据库
   - 使用 `sentence-transformers` 模型生成向量
   - 将文本切片存储到Milvus（如果Milvus可用）

6. **返回结果** (`api/routes.py:103-114`)
   - 返回PPT数据结构（包含所有幻灯片内容）
   - 返回任务ID和状态

### 2. 知识扩充流程

**入口文件**: `api/routes.py` → `/api/v1/expand` 端点

**执行顺序**:
1. **接收扩充请求** (`api/routes.py:194-232`)
   - 接收包含title、content、context的请求
   - 验证请求参数

2. **调用知识扩充服务** (`services/knowledge_expander.py:33-70`)
   - 调用 `KnowledgeExpander.expand_knowledge_point()`
   - 格式化上下文信息
   - 获取扩展Prompt模板（`utils/prompts.py:9-60`）

3. **调用LLM生成扩展内容** (`services/knowledge_expander.py:62-63`)
   - 使用 `utils/llm_factory.py` 创建LLM实例
   - LLM配置：
     - API: SiliconFlow (https://api.siliconflow.cn/v1)
     - 模型: DeepSeek-V3.2-Exp
     - 温度: 0.7
   - 调用LLM生成扩展内容（背景、原理、公式、代码、总结）

4. **解析LLM响应** (`services/knowledge_expander.py:180-210`)
   - 尝试从响应中提取JSON格式内容
   - 如果解析失败，使用默认结构

5. **返回扩展结果** (`api/routes.py:221-226`)
   - 返回原始内容和扩展内容

### 3. 带验证的知识扩充流程

**入口文件**: `api/routes.py` → `/api/v1/expand-with-validation` 端点

**执行顺序**:
1. **调用带验证的扩充** (`services/knowledge_expander.py:271-329`)
   - 调用 `expand_with_validation()` 方法
   - 生成扩展内容
   - 调用验证方法（`validate_expansion()`）

2. **验证扩展内容** (`services/knowledge_expander.py:113-153`)
   - 使用验证Prompt模板（`utils/prompts.py:63-107`）
   - 调用LLM验证内容准确性
   - 检查相关性、准确性、一致性
   - 计算置信度分数

3. **重试机制** (`services/knowledge_expander.py:290-313`)
   - 如果置信度 < 0.7，自动重试（最多2次）
   - 返回验证结果和扩展内容

### 4. 多源搜索流程

**入口文件**: `api/routes.py` → `/api/v1/search` 端点

**执行顺序**:
1. **接收搜索请求** (`api/routes.py:302-334`)
   - 接收查询词和搜索源列表

2. **调用多源搜索** (`services/search_service.py:171-207`)
   - 调用 `SearchService.multi_source_search()`
   - 支持Wikipedia、Arxiv、Bing（可选）

3. **Wikipedia搜索** (`services/search_service.py:32-76`)
   - 使用 `wikipedia` 库搜索
   - 获取页面摘要和链接
   - 计算相关度分数

4. **Arxiv搜索** (`services/search_service.py:78-121`)
   - 使用 `arxiv` 库搜索学术论文
   - 获取论文标题、作者、摘要、链接
   - 计算相关度分数

5. **整合结果** (`api/routes.py:322-328`)
   - 返回各搜索源的结果

### 5. 向量语义搜索流程

**入口文件**: `api/routes.py` → `/api/v1/vector-search` 端点

**执行顺序**:
1. **接收搜索请求** (`api/routes.py:337-369`)
   - 接收查询词、top_k、page_number

2. **向量化查询** (`utils/vector_db.py:158-214`)
   - 使用 `sentence-transformers` 模型生成查询向量
   - 调用Milvus进行语义搜索

3. **返回搜索结果** (`api/routes.py:353-363`)
   - 返回相似度最高的文本切片

### 6. 导出流程

**入口文件**: `api/routes.py` → `/api/v1/export` 端点

**执行顺序**:
1. **接收导出请求** (`api/routes.py:430-493`)
   - 接收PPT数据、扩展数据、格式（Markdown/PDF）

2. **生成Markdown** (`services/export_service.py:30-94`)
   - 调用 `ExportService.export_to_markdown()`
   - 遍历所有幻灯片
   - 为每个文本框查找对应的扩展内容
   - 生成Markdown格式内容

3. **导出PDF** (`services/export_service.py:96-214`)
   - 如果格式为PDF，将Markdown转换为PDF
   - 使用 `reportlab` 库生成PDF
   - **注意**: 当前PDF中文显示有问题（需要中文字体支持）

4. **保存文件** (`services/export_service.py:216-238`)
   - 保存到 `./output/` 目录
   - 返回下载链接

## 数据流图

```
用户上传PPT
    ↓
api/routes.py (upload端点)
    ↓
services/parser.py (parse_from_file)
    ├─→ 提取文本 → extract_text_chunks → 向量化 → Milvus
    ├─→ 提取图片 → _parse_image (仅位置信息) ← 需要完善
    └─→ 提取表格 → _parse_table
    ↓
返回PPT数据结构
    ↓
用户选择知识点扩展
    ↓
api/routes.py (expand端点)
    ↓
services/knowledge_expander.py
    ├─→ 调用LLM生成扩展内容
    └─→ 可选：验证扩展内容准确性
    ↓
返回扩展内容
    ↓
用户导出
    ↓
api/routes.py (export端点)
    ↓
services/export_service.py
    ├─→ 生成Markdown
    └─→ 可选：转换为PDF
    ↓
保存到output目录
```

## 关键文件说明

### 1. app/main.py
- FastAPI应用主入口
- 配置CORS中间件
- 注册路由
- 启动/关闭事件处理

### 2. api/routes.py
- 定义所有API端点
- 处理文件上传、知识扩充、搜索、导出等请求
- 调用相应的服务层方法

### 3. services/parser.py
- PPT文件解析核心逻辑
- 提取文本、图片、表格、结构
- **当前图片提取不完整**：只提取位置信息，未保存图片文件，未识别图片内容

### 4. services/knowledge_expander.py
- 知识扩充服务
- 调用LLM生成扩展内容
- 验证机制（Check Layer）

### 5. services/search_service.py
- 多源搜索服务
- 整合Wikipedia、Arxiv等外部资源

### 6. services/export_service.py
- 导出服务
- 支持Markdown和PDF格式
- **注意**: PDF中文显示需要中文字体支持

### 7. utils/llm_factory.py
- LLM实例工厂
- 统一创建和管理LLM实例
- 使用SiliconFlow API + DeepSeek-V3.2-Exp模型

### 8. utils/vector_db.py
- 向量数据库工具
- 使用Milvus存储和检索文本向量
- 使用sentence-transformers生成向量

### 9. utils/prompts.py
- Prompt模板管理
- 定义各种任务的Prompt模板

## 已完成功能更新

### 1. 图片提取和识别（✅ 已完成）
- **当前状态**: 已完整实现图片提取和识别功能
- **已实现功能**:
  - ✅ 从PPT中提取图片文件并保存到本地
  - ✅ 使用OCR（pytesseract/easyocr）识别图片文字
  - ✅ 使用LLM生成图片描述
  - ✅ 将图片识别结果关联到PPT页
  - ✅ 在知识扩充时考虑图片内容
  - ✅ 导出时包含图片和识别结果

### 2. PPT Agent工作流（部分完成）
- **当前状态**: `agents/ppt_agent.py` 中有TODO标记，未完全实现
- **影响**: 不影响核心功能，因为知识扩充直接通过服务层调用

### 3. PDF中文显示（已知问题）
- **当前状态**: PDF导出功能已实现，但中文字符显示为黑框
- **解决方案**: 需要安装中文字体并在reportlab中配置

## 依赖服务

### 必需服务
- **FastAPI应用**: 主服务，处理所有API请求
- **LLM API**: SiliconFlow API（DeepSeek-V3.2-Exp模型）

### 可选服务
- **Milvus**: 向量数据库（用于语义搜索）
- **Redis**: 缓存和任务队列（当前未使用）

## 配置说明

### 环境变量（app/config.py）
- `LLM_API_KEY`: LLM API密钥（默认已配置）
- `LLM_BASE_URL`: LLM API地址
- `LLM_MODEL`: 模型名称
- `MILVUS_HOST`: Milvus主机地址
- `MILVUS_PORT`: Milvus端口

## 执行顺序总结

1. **启动服务**: `app/main.py` → 启动FastAPI应用
2. **上传PPT**: `api/routes.py` → `services/parser.py` → 解析并返回数据
3. **知识扩充**: `api/routes.py` → `services/knowledge_expander.py` → `utils/llm_factory.py` → LLM API
4. **搜索**: `api/routes.py` → `services/search_service.py` → Wikipedia/Arxiv API
5. **导出**: `api/routes.py` → `services/export_service.py` → 生成Markdown/PDF

## 图片处理流程（已实现）

图片处理流程已完整实现：

1. **图片提取** (`services/parser.py:_parse_image`)
   - ✅ 从PPT中提取图片二进制数据
   - ✅ 保存图片文件到 `./uploads/images/{ppt_name}/` 目录
   - ✅ 记录图片文件路径（相对路径）

2. **图片识别** (`services/image_recognizer.py`)
   - ✅ 使用OCR库（pytesseract或easyocr）识别文字
   - ✅ 使用LLM基于OCR文字生成图片描述
   - ✅ 生成图片描述文本和OCR文字

3. **关联到PPT页**
   - ✅ 将图片识别结果添加到slide_data的images数组中
   - ✅ 在知识扩充时，将图片描述与文本内容一起处理
   - ✅ 图片信息包含在context中，传递给知识扩充服务

4. **导出时包含图片**
   - ✅ 在Markdown中插入图片链接
   - ✅ 导出图片描述和OCR文字
   - ✅ 在知识扩充时考虑图片内容

### 图片识别服务说明

**文件**: `services/image_recognizer.py`

**功能**:
- 支持OCR文字识别（pytesseract或easyocr）
- 使用LLM生成图片描述（基于OCR结果）
- 批量识别多张图片

**使用方式**:
```python
from services.image_recognizer import image_recognizer

result = image_recognizer.recognize_image(image_path, page_number)
# 返回: {"text": "OCR文字", "description": "图片描述", "confidence": 0.8}
```

**依赖**:
- `pytesseract>=0.3.10` 或 `easyocr>=1.7.0`（OCR库）
- `Pillow>=10.1.0`（图片处理）
- LLM API（用于生成图片描述）

## 注意事项

1. **Milvus服务**: 如果Milvus未启动，向量化功能会失败但不影响其他功能
2. **LLM API**: 需要有效的API密钥才能使用知识扩充功能
3. **文件存储**: 上传的文件保存在 `./uploads/`，导出文件保存在 `./output/`
4. **图片处理**: 当前图片提取功能不完整，需要完善
