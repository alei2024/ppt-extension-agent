# 图片提取和识别功能实现总结

## 完成时间
2025年1月

## 完成内容

### 1. 图片提取功能 ✅

**文件**: `services/parser.py`

**实现内容**:
- 修改 `PPTParser.__init__()` 方法，添加图片输出目录配置
- 修改 `PPTParser.parse_from_file()` 方法，为每个PPT创建独立的图片目录
- 修改 `PPTParser._parse_slide()` 方法，传递图片目录参数
- 完善 `PPTParser._parse_image()` 方法：
  - 从PPT中提取图片二进制数据
  - 保存图片文件到 `./uploads/images/{ppt_name}/` 目录
  - 记录图片文件路径（相对路径）
  - 支持多种图片格式（png, jpg, jpeg等）

**关键代码**:
```python
# 提取图片并保存
image = shape.image
image_bytes = image.blob
ext = image.ext or "png"
filename = f"slide_{page_number}_img_{shape.shape_id}.{ext}"
file_path = image_dir / filename
with open(file_path, "wb") as f:
    f.write(image_bytes)
```

### 2. 图片识别功能 ✅

**文件**: `services/image_recognizer.py` (新建)

**实现内容**:
- 创建 `ImageRecognizer` 类，支持OCR和视觉模型识别
- 支持两种OCR库：
  - `pytesseract`（优先使用）
  - `easyocr`（备用方案）
- 使用LLM生成图片描述（基于OCR结果）
- 实现批量识别功能

**关键功能**:
- `recognize_image()`: 识别单张图片
- `_ocr_recognize()`: OCR文字识别
- `_vision_recognize()`: 视觉模型识别（使用LLM）
- `batch_recognize()`: 批量识别

**识别结果格式**:
```python
{
    "text": "OCR识别的文字",
    "description": "LLM生成的图片描述",
    "confidence": 0.8  # OCR置信度
}
```

### 3. 图片识别结果关联 ✅

**文件**: `services/parser.py`

**实现内容**:
- 在 `PPTParser.__init__()` 中初始化图片识别服务
- 在 `PPTParser._parse_image()` 中调用图片识别服务
- 将识别结果（OCR文字和描述）添加到图片数据中

**数据结构**:
```python
{
    "id": shape.shape_id,
    "file_path": "images/ppt_name/slide_1_img_123.png",
    "position": {...},
    "description": "图片描述",
    "ocr_text": "OCR识别的文字"
}
```

### 4. 知识扩充时考虑图片内容 ✅

**文件**: `services/knowledge_expander.py`

**实现内容**:
- 修改 `_format_context()` 方法，支持图片信息格式化
- 修改 `expand_knowledge_point()` 方法，将图片信息添加到内容中

**实现逻辑**:
1. 如果context中包含images信息，提取图片描述和OCR文字
2. 将图片信息添加到content中，一起发送给LLM
3. LLM在生成扩展内容时会考虑图片信息

**示例**:
```python
# 原始content: "监督学习"
# 增强后content: "监督学习\n\n同页面相关图片信息:\n[图片内容: 这是一张机器学习流程图...]"
```

### 5. 导出服务支持图片 ✅

**文件**: `services/export_service.py`

**实现内容**:
- 修改 `export_to_markdown()` 方法，添加图片导出功能
- 在Markdown中插入图片链接
- 导出图片描述和OCR文字
- 如果图片有扩展内容，也一并导出

**导出格式**:
```markdown
### 图片内容

![图片](images/ppt_name/slide_1_img_123.png)

**图片描述**: 这是一张机器学习流程图...

**识别文字**: 监督学习 -> 无监督学习 -> 强化学习
```

### 6. Prompt模板更新 ✅

**文件**: `utils/prompts.py`

**实现内容**:
- 添加 `get_image_description_prompt()` 函数
- 用于基于OCR文字生成图片描述的Prompt模板

### 7. 依赖更新 ✅

**文件**: `requirements.txt`

**添加依赖**:
- `pytesseract>=0.3.10` - OCR库（优先使用）
- `easyocr>=1.7.0` - OCR库（备用方案）

## 使用说明

### 1. 安装依赖

```bash
pip install pytesseract>=0.3.10
# 或
pip install easyocr>=1.7.0

# 如果使用pytesseract，还需要安装Tesseract OCR引擎
# Windows: 下载安装包 https://github.com/UB-Mannheim/tesseract/wiki
# Linux: sudo apt-get install tesseract-ocr tesseract-ocr-chi-sim
# Mac: brew install tesseract tesseract-lang
```

### 2. 使用图片识别

图片识别会在PPT解析时自动执行。如果OCR库未安装，系统会跳过OCR识别，但仍会保存图片文件。

### 3. 在知识扩充时使用图片

在调用知识扩充API时，可以在context中包含图片信息：

```python
{
    "title": "知识点标题",
    "content": "知识点内容",
    "context": {
        "page_number": 1,
        "images": [
            {
                "description": "图片描述",
                "ocr_text": "OCR文字"
            }
        ]
    }
}
```

## 文件结构

```
services/
├── parser.py              # 修改：添加图片提取和识别调用
├── image_recognizer.py    # 新建：图片识别服务
├── knowledge_expander.py  # 修改：支持图片信息
└── export_service.py      # 修改：支持图片导出

utils/
└── prompts.py             # 修改：添加图片描述Prompt

requirements.txt           # 修改：添加OCR依赖
```

## 注意事项

1. **OCR库安装**: 
   - 如果使用pytesseract，需要单独安装Tesseract OCR引擎
   - 如果使用easyocr，会自动下载模型（首次使用较慢）

2. **图片识别性能**:
   - OCR识别速度较快（<1秒/张）
   - LLM生成描述需要调用API（1-3秒/张）
   - 大量图片时建议使用批量识别

3. **图片存储**:
   - 图片保存在 `./uploads/images/{ppt_name}/` 目录
   - 每个PPT有独立的图片目录
   - 图片文件名格式：`slide_{page_number}_img_{shape_id}.{ext}`

4. **向后兼容**:
   - 如果OCR库未安装，系统会跳过OCR识别，但仍会保存图片
   - 图片识别功能是可选的，不影响其他功能

## 测试建议

1. **测试图片提取**:
   - 上传包含图片的PPT
   - 检查 `./uploads/images/` 目录是否有图片文件

2. **测试图片识别**:
   - 上传包含文字的图片（如流程图、图表）
   - 检查返回的PPT数据中images数组是否包含description和ocr_text

3. **测试知识扩充**:
   - 选择包含图片的页面进行知识扩充
   - 检查扩展内容是否考虑了图片信息

4. **测试导出**:
   - 导出包含图片的PPT
   - 检查Markdown文件是否包含图片链接和描述

## 后续优化建议

1. **支持更多图片格式**: 当前支持常见格式，可以扩展支持更多格式
2. **图片压缩**: 对于大图片，可以添加压缩功能
3. **图片缓存**: 对于相同图片，可以缓存识别结果
4. **视觉模型**: 如果API支持，可以直接使用视觉模型识别图片（无需OCR）
5. **批量处理优化**: 对于大量图片，可以并行处理提升速度
