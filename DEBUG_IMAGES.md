# 图片提取问题调试指南

## 已完成的修复

1. ✅ 更新了前端类型定义，添加了 `images` 字段
2. ✅ 更新了 PPTViewer 组件，现在会显示图片
3. ✅ 添加了静态文件服务，前端可以访问图片
4. ✅ 添加了更多日志来调试图片提取

## 调试步骤

### 1. 检查后端日志

重新启动服务后，上传一个包含图片的PPT，查看日志：

```bash
# 查看后端日志
docker-compose logs -f ppt-agent

# 或本地运行
# 查看控制台输出
```

**应该看到的日志**：
- `发现图片: shape_id=xxx, page=x`
- `图片已保存: /app/uploads/images/xxx/slide_x_img_xxx.png`
- `页面 x 解析完成: x 个文本框, x 张图片`

### 2. 检查图片文件

```bash
# 进入容器检查
docker exec -it ppt-extension-agent bash
ls -la /app/uploads/images/

# 或本地检查
ls -la ./uploads/images/
```

应该看到以PPT文件名命名的目录，每个目录中包含提取的图片。

### 3. 检查API返回数据

上传PPT后，检查返回的JSON数据：

```bash
# 使用curl测试
curl -X POST "http://localhost:8000/api/v1/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_presentation.pptx" | jq '.ppt_data.slides[0].images'
```

或者在浏览器中打开开发者工具，查看网络请求的响应。

**应该看到**：
```json
{
  "id": 123,
  "file_path": "images/ppt_name/slide_1_img_123.png",
  "position": {...},
  "description": "...",
  "ocr_text": "..."
}
```

### 4. 检查前端显示

1. 打开浏览器开发者工具（F12）
2. 查看 Console 标签，检查是否有错误
3. 查看 Network 标签，检查图片请求是否成功
4. 检查图片URL是否正确：`http://localhost:8000/uploads/images/xxx/slide_x_img_xxx.png`

### 5. 常见问题

#### 问题1：日志显示"发现图片"但没有"图片已保存"

**原因**：可能是 `hasattr(shape, "image")` 检查失败，或者图片提取出错

**解决**：
- 检查日志中的错误信息
- 某些PPT中的图片可能是嵌入的，需要不同的提取方式

#### 问题2：图片已保存但前端不显示

**原因**：
- 图片路径不正确
- 静态文件服务未正确配置
- CORS问题

**解决**：
- 检查图片URL是否可以访问：`http://localhost:8000/uploads/images/xxx/slide_x_img_xxx.png`
- 检查浏览器控制台的错误信息
- 确认静态文件服务已挂载（在 `app/main.py` 中）

#### 问题3：前端显示"Image load error"

**原因**：图片文件不存在或路径错误

**解决**：
- 检查图片文件是否真的存在
- 检查 `file_path` 是否正确
- 确认静态文件服务配置正确

## 手动测试图片提取

可以创建一个测试脚本来验证图片提取功能：

```python
# test_image_extraction.py
from services.parser import PPTParser

parser = PPTParser(recognize_images=False)  # 先不识别，只提取
ppt_data = parser.parse_from_file("your_presentation.pptx")

# 检查图片
for slide in ppt_data["slides"]:
    print(f"页面 {slide['page_number']}: {len(slide.get('images', []))} 张图片")
    for img in slide.get("images", []):
        print(f"  - {img.get('file_path', 'N/A')}")
```

## 如果还是不行

1. **检查PPT是否真的包含图片**
   - 有些PPT中的"图片"可能是形状或图表，不是真正的图片对象

2. **检查python-pptx版本**
   ```bash
   pip show python-pptx
   ```

3. **尝试不同的PPT文件**
   - 有些PPT格式可能不同

4. **查看完整错误日志**
   ```bash
   docker-compose logs ppt-agent | grep -i image
   ```

## 下一步

如果图片提取成功但前端不显示，检查：
1. 前端类型定义是否正确
2. 前端组件是否正确渲染
3. 图片URL是否可以访问
4. 浏览器控制台是否有错误
