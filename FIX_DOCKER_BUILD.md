# 修复Docker构建错误

## 问题
`libgl1-mesa-glx` 包在 Debian Trixie (Python 3.11-slim) 中不可用，导致构建失败。

## 解决方案

### 方法一：清理缓存并重新构建（推荐）

```bash
# 1. 停止所有服务
docker-compose down

# 2. 清理构建缓存（重要！）
docker-compose build --no-cache

# 3. 重新启动
docker-compose up -d --build
```

### 方法二：完全清理并重建

```bash
# 1. 停止并删除所有容器和卷
docker-compose down -v

# 2. 清理Docker构建缓存
docker system prune -a --volumes

# 3. 重新构建（不使用缓存）
docker-compose build --no-cache

# 4. 启动服务
docker-compose up -d
```

### 方法三：如果还是失败，可以简化依赖

如果某些包仍然不可用，可以暂时移除非必需的包：

```dockerfile
# 只安装必需的包
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    libmagic1 \
    curl \
    tesseract-ocr \
    tesseract-ocr-chi-sim \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*
```

## 验证

构建成功后，检查日志：

```bash
docker-compose logs -f ppt-agent
```

应该看到 "Application startup complete"。

## 说明

- `libgl1-mesa-glx` 已从 Dockerfile 中移除
- 添加了 `libsm6`, `libxext6`, `libxrender-dev`, `libgomp1` 用于支持 easyocr（如果需要）
- 如果 easyocr 仍然有问题，可以只使用 pytesseract（已安装 Tesseract OCR）
