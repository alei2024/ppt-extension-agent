# 运行指南 - 图片提取和识别功能

## 快速启动步骤

### 方式一：使用Docker Compose（推荐）

#### 1. 停止现有服务（如果正在运行）

```bash
# 停止所有服务
docker-compose down

# 如果只想停止主服务，保留数据
docker-compose stop ppt-agent
```

#### 2. 重新构建并启动服务

```bash
# 重新构建镜像并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看主服务日志（确认启动成功）
docker-compose logs -f ppt-agent
```

**预期输出**：
- 看到 "Application startup complete" 表示启动成功
- 如果看到图片识别相关的日志，说明功能已启用

#### 3. 验证服务

```bash
# 健康检查
curl http://localhost:8000/health

# 或访问API文档
# 浏览器打开：http://localhost:8000/docs
```

#### 4. 启动前端（如果需要）

```bash
# 进入前端目录
cd frontend

# 如果依赖未安装，先安装
npm install

# 启动前端开发服务器
npm run dev
```

访问前端：**http://localhost:3000**

---

### 方式二：本地开发模式

#### 1. 安装Python依赖

```bash
# 激活虚拟环境（如果使用）
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# 安装/更新依赖
pip install -r requirements.txt
```

#### 2. 安装OCR依赖（可选）

**选项A：使用pytesseract（推荐）**

```bash
# 安装Python包
pip install pytesseract

# 安装Tesseract OCR引擎
# Windows: 下载安装 https://github.com/UB-Mannheim/tesseract/wiki
# Linux: sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim
# Mac: brew install tesseract tesseract-lang
```

**选项B：使用easyocr（备用）**

```bash
# 安装easyocr（会自动下载模型，首次使用较慢）
pip install easyocr
```

**注意**：
- 如果OCR库未安装，系统会跳过OCR识别，但仍会保存图片文件
- 图片识别功能是可选的，不影响其他功能

#### 3. 启动依赖服务（Redis、Milvus等）

```bash
# 只启动依赖服务
docker-compose up -d redis milvus-standalone etcd minio

# 等待服务启动（约30秒）
docker-compose ps
```

#### 4. 启动主应用

```bash
# 启动FastAPI应用
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 5. 启动前端

```bash
cd frontend
npm install  # 如果依赖未安装
npm run dev
```

---

## 重要说明

### 关于OCR库

1. **pytesseract**：
   - 需要单独安装Tesseract OCR引擎
   - 识别速度快，资源占用小
   - 支持中文和英文

2. **easyocr**：
   - 不需要额外安装引擎
   - 首次使用会下载模型（约500MB）
   - 识别准确度较高

3. **如果都不安装**：
   - 系统仍会提取和保存图片
   - 但不会进行OCR识别
   - 图片描述会使用LLM生成（基于图片本身，不基于OCR）

### 关于数据持久化

- **上传的PPT文件**：保存在 `./uploads/` 目录
- **提取的图片**：保存在 `./uploads/images/{ppt_name}/` 目录
- **导出文件**：保存在 `./output/` 目录
- **日志文件**：保存在 `./logs/` 目录

这些目录在Docker中已挂载，数据会持久保存。

### 关于服务重启

- **后端服务**：需要重新构建（因为代码和依赖有更新）
- **前端服务**：如果前端代码没有修改，不需要重启
- **依赖服务**（Redis、Milvus等）：如果配置没变，不需要重启

---

## 验证图片功能

### 1. 上传包含图片的PPT

```bash
# 使用curl测试
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_presentation.pptx"
```

### 2. 检查返回数据

返回的JSON中，每个slide的`images`数组应该包含：
- `file_path`: 图片文件路径
- `description`: 图片描述（如果识别成功）
- `ocr_text`: OCR识别的文字（如果识别成功）

### 3. 检查图片文件

```bash
# 查看提取的图片
ls -la ./uploads/images/

# 应该看到以PPT文件名命名的目录
# 每个目录中包含该PPT的所有图片
```

### 4. 测试知识扩充

上传PPT后，选择包含图片的页面进行知识扩充，扩展内容应该会考虑图片信息。

---

## 常见问题

### Q1: OCR识别失败怎么办？

**A**: 检查以下几点：
1. Tesseract OCR引擎是否正确安装（如果使用pytesseract）
2. 查看日志：`docker-compose logs ppt-agent`
3. 如果OCR不可用，系统会自动跳过OCR，但仍会保存图片

### Q2: 图片识别很慢？

**A**: 
- OCR识别通常很快（<1秒/张）
- LLM生成描述需要调用API（1-3秒/张）
- 如果有很多图片，建议使用批量处理

### Q3: Docker构建失败？

**A**: 
- 检查网络连接（需要下载依赖）
- 尝试使用国内镜像源（已在Dockerfile中配置）
- 查看详细错误：`docker-compose build --no-cache`

### Q4: 前端无法连接后端？

**A**: 
- 确认后端服务已启动：`docker-compose ps`
- 检查端口是否被占用：`netstat -ano | findstr :8000` (Windows)
- 检查CORS配置（已在代码中配置为允许所有来源）

---

## 完整启动命令（一键启动）

```bash
# 1. 停止现有服务
docker-compose down

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 查看日志
docker-compose logs -f ppt-agent

# 4. 在另一个终端启动前端
cd frontend && npm run dev
```

---

## 下一步

1. 上传一个包含图片的PPT文件
2. 查看返回的数据，确认图片已提取
3. 选择包含图片的页面进行知识扩充
4. 导出Markdown，查看是否包含图片和描述

享受使用！🎉
