"""
PPT解析服务
使用python-pptx进行PPT文件解析，提取文本、图片和层级结构
"""

from typing import Dict, List, Optional
from pathlib import Path
from pptx import Presentation
from pptx.util import Inches, Pt
import logging
import json
import re

logger = logging.getLogger(__name__)


class PPTParser:
    """
    PPT文件解析器
    支持解析PPT的层级结构、文本内容、图片描述等
    """
    
    def __init__(self):
        """初始化解析器"""
        logger.info("PPT解析器初始化完成")
    
    def parse_from_file(self, file_path: str) -> Dict:
        """
        从本地文件解析PPT
        
        Args:
            file_path: PPT文件路径
            
        Returns:
            解析后的数据结构，包含：
            - slides: 页面列表
            - structure: 层级结构
            - metadata: 元数据
        """
        try:
            logger.info(f"开始解析PPT文件: {file_path}")
            
            if not Path(file_path).exists():
                raise FileNotFoundError(f"PPT文件不存在: {file_path}")
            
            prs = Presentation(file_path)
            
            result = {
                "metadata": self._extract_metadata(prs, file_path),
                "slides": [],
                "structure": {
                    "title": "",
                    "sections": []
                }
            }
            
            for idx, slide in enumerate(prs.slides):
                slide_data = self._parse_slide(slide, idx + 1)
                result["slides"].append(slide_data)
                
                if idx == 0:
                    result["structure"]["title"] = slide_data.get("title", "")
            
            logger.info(f"PPT解析完成，共{len(result['slides'])}页")
            return result
            
        except Exception as e:
            logger.error(f"PPT解析失败: {str(e)}")
            raise
    
    def parse_from_url(self, url: str, download_path: str = "./uploads") -> Dict:
        """
        从URL下载并解析PPT
        
        Args:
            url: PPT文件的URL地址
            download_path: 下载保存路径
            
        Returns:
            解析后的数据结构
        """
        try:
            import requests
            from urllib.parse import urlparse
            import os
            
            logger.info(f"开始从URL下载PPT: {url}")
            
            response = requests.get(url, stream=True, timeout=30)
            response.raise_for_status()
            
            filename = os.path.basename(urlparse(url).path)
            if not filename or not filename.endswith(('.pptx', '.ppt')):
                filename = f"downloaded_{hash(url)}.pptx"
            
            file_path = os.path.join(download_path, filename)
            
            os.makedirs(download_path, exist_ok=True)
            
            with open(file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"PPT下载完成: {file_path}")
            
            return self.parse_from_file(file_path)
            
        except Exception as e:
            logger.error(f"从URL解析PPT失败: {str(e)}")
            raise
    
    def _parse_slide(self, slide, page_number: int) -> Dict:
        """
        解析单个幻灯片（优化：确保至少提取到一些可选中内容）
        
        Args:
            slide: python-pptx的Slide对象
            page_number: 页码
            
        Returns:
            幻灯片数据字典
        """
        slide_data = {
            "page_number": page_number,
            "title": "",
            "text_boxes": [],
            "images": [],
            "tables": [],
            "notes": ""
        }
        
        for shape in slide.shapes:
            # 处理标题占位符（需要检查是否有text属性，避免PlaceholderPicture错误）
            if shape.shape_type == 14:
                try:
                    if hasattr(shape, 'text') and shape.text:
                        title_text = shape.text.strip()
                        slide_data["title"] = title_text
                        # 如果标题不为空且不是无意义内容，也作为可选中文本框添加
                        if title_text and not self._should_filter_text_box(title_text):
                            slide_data["text_boxes"].append({
                                "id": shape.shape_id,
                                "text": title_text,
                                "paragraphs": [{"text": title_text, "level": 0}],
                                "position": {
                                    "left": float(shape.left / Inches(1)),
                                    "top": float(shape.top / Inches(1)),
                                    "width": float(shape.width / Inches(1)),
                                    "height": float(shape.height / Inches(1))
                                },
                                "is_title": True
                            })
                except AttributeError:
                    # PlaceholderPicture等占位符没有text属性，跳过
                    logger.debug(f"跳过占位符形状（无text属性）: {type(shape).__name__}")
                    pass
            
            elif shape.has_text_frame:
                try:
                    text_box = self._parse_text_box(shape)
                    text = text_box["text"].strip()
                    # 过滤无意义内容（纯数字、人名等）
                    if text and not self._should_filter_text_box(text):
                        slide_data["text_boxes"].append(text_box)
                    else:
                        logger.debug(f"过滤掉无意义文本框: {text[:50]}")
                except Exception as e:
                    logger.warning(f"解析文本框失败: {str(e)}")
                    continue
            
            elif shape.shape_type == 13:
                try:
                    image_data = self._parse_image(shape)
                    slide_data["images"].append(image_data)
                except Exception as e:
                    logger.warning(f"解析图片失败: {str(e)}")
                    continue
            
            elif shape.has_table:
                try:
                    table_data = self._parse_table(shape)
                    slide_data["tables"].append(table_data)
                    # 优化：从表格中提取文本作为可选中内容
                    table_text = " ".join([" ".join(row) for row in table_data.get("data", [])])
                    if table_text.strip() and not self._should_filter_text_box(table_text.strip()):
                        slide_data["text_boxes"].append({
                            "id": shape.shape_id + 10000,  # 使用特殊ID避免冲突
                            "text": table_text.strip(),
                            "paragraphs": [{"text": table_text.strip(), "level": 0}],
                            "position": table_data.get("position", {}),
                            "is_title": False
                        })
                except Exception as e:
                    logger.warning(f"解析表格失败: {str(e)}")
                    continue
        
        # 处理备注页文本
        if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
            notes_text = slide.notes_slide.notes_text_frame.text.strip()
            slide_data["notes"] = notes_text
            # 如果备注不为空且没有其他文本，也作为可选中内容（需要过滤）
            if notes_text and len(slide_data["text_boxes"]) == 0 and not self._should_filter_text_box(notes_text):
                slide_data["text_boxes"].append({
                    "id": 99999,  # 使用特殊ID
                    "text": notes_text,
                    "paragraphs": [{"text": notes_text, "level": 0}],
                    "position": {"left": 0, "top": 0, "width": 0, "height": 0},
                    "is_title": False
                })
        
        # 如果仍然没有可选中内容，至少使用标题（需要过滤）
        if len(slide_data["text_boxes"]) == 0 and slide_data["title"] and not self._should_filter_text_box(slide_data["title"]):
            slide_data["text_boxes"].append({
                "id": 88888,  # 使用特殊ID
                "text": slide_data["title"],
                "paragraphs": [{"text": slide_data["title"], "level": 0}],
                "position": {"left": 0, "top": 0, "width": 0, "height": 0},
                "is_title": True
            })
        
        logger.debug(f"解析第{page_number}页完成，提取到{len(slide_data['text_boxes'])}个文本框，标题: {slide_data['title'][:50] if slide_data['title'] else '无'}")
        return slide_data
    
    def _parse_text_box(self, shape) -> Dict:
        """
        解析文本框（优化：过滤无意义内容）
        
        Args:
            shape: python-pptx的Shape对象
            
        Returns:
            文本框数据字典
        """
        text_frame = shape.text_frame
        paragraphs = []
        
        for paragraph in text_frame.paragraphs:
            para_data = {
                "text": paragraph.text.strip(),
                "level": paragraph.level,
                "font_size": None,
                "font_name": None,
                "bold": False,
                "italic": False
            }
            
            if paragraph.runs:
                run = paragraph.runs[0]
                if run.font.size:
                    para_data["font_size"] = run.font.size.pt
                if run.font.name:
                    para_data["font_name"] = run.font.name
                para_data["bold"] = run.font.bold
                para_data["italic"] = run.font.italic
            
            if para_data["text"]:
                paragraphs.append(para_data)
        
        full_text = text_frame.text.strip()
        
        return {
            "id": shape.shape_id,
            "text": full_text,
            "paragraphs": paragraphs,
            "position": {
                "left": float(shape.left / Inches(1)),
                "top": float(shape.top / Inches(1)),
                "width": float(shape.width / Inches(1)),
                "height": float(shape.height / Inches(1))
            },
            "is_title": self._is_title_box(shape)
        }
    
    def _should_filter_text_box(self, text: str) -> bool:
        """
        判断是否应该过滤掉该文本框（过滤无意义内容）
        
        Args:
            text: 文本框内容
            
        Returns:
            True表示应该过滤掉，False表示保留
        """
        if not text or len(text.strip()) == 0:
            return True
        
        text = text.strip()
        
        # 1. 过滤纯数字（如 "01", "02", "123"）
        if re.match(r'^\d+$', text):
            logger.debug(f"过滤纯数字文本框: {text}")
            return True
        
        # 2. 过滤单个字符（除非是中文字符）
        if len(text) == 1 and not re.match(r'[\u4e00-\u9fa5]', text):
            logger.debug(f"过滤单字符文本框: {text}")
            return True
        
        # 3. 过滤常见英文人名（简单规则：首字母大写，2-10个字母，无空格）
        # 常见英文名模式：Jerry, Tom, Alice等
        if re.match(r'^[A-Z][a-z]{1,9}$', text):
            # 排除一些常见单词（如 "The", "And" 等）
            common_words = {"The", "And", "For", "Are", "But", "Not", "You", "All", "Can", "Her", "Was", "One", "Our", "Out", "Day", "Get", "Has", "Him", "His", "How", "Man", "New", "Now", "Old", "See", "Two", "Way", "Who", "Boy", "Did", "Its", "Let", "Put", "Say", "She", "Too", "Use"}
            if text not in common_words:
                logger.debug(f"过滤可能的英文人名: {text}")
                return True
        
        # 4. 过滤页码格式（如 "1/10", "Page 1"）
        if re.match(r'^(page\s*)?\d+(\s*/\s*\d+)?$', text, re.IGNORECASE):
            logger.debug(f"过滤页码格式: {text}")
            return True
        
        # 5. 过滤过短的内容（少于2个字符，除非是中文）
        if len(text) < 2 and not re.search(r'[\u4e00-\u9fa5]', text):
            logger.debug(f"过滤过短内容: {text}")
            return True
        
        return False
    
    def _is_title_box(self, shape) -> bool:
        """
        判断是否为标题文本框
        
        Args:
            shape: python-pptx的Shape对象
            
        Returns:
            是否为标题
        """
        if not shape.has_text_frame:
            return False
        
        text_frame = shape.text_frame
        
        if text_frame.paragraphs and text_frame.paragraphs[0].runs:
            run = text_frame.paragraphs[0].runs[0]
            if run.font.size:
                font_size = run.font.size.pt
                return font_size > 32
        
        return False
    
    def _parse_image(self, shape) -> Dict:
        """
        解析图片
        
        Args:
            shape: python-pptx的Shape对象
            
        Returns:
            图片数据字典
        """
        return {
            "id": shape.shape_id,
            "position": {
                "left": float(shape.left / Inches(1)),
                "top": float(shape.top / Inches(1)),
                "width": float(shape.width / Inches(1)),
                "height": float(shape.height / Inches(1))
            },
            "description": ""
        }
    
    def _parse_table(self, shape) -> Dict:
        """
        解析表格
        
        Args:
            shape: python-pptx的Shape对象
            
        Returns:
            表格数据字典
        """
        table = shape.table
        rows = []
        
        for row in table.rows:
            row_data = []
            for cell in row.cells:
                row_data.append(cell.text.strip())
            rows.append(row_data)
        
        return {
            "id": shape.shape_id,
            "rows": len(rows),
            "columns": len(rows[0]) if rows else 0,
            "data": rows,
            "position": {
                "left": float(shape.left / Inches(1)),
                "top": float(shape.top / Inches(1)),
                "width": float(shape.width / Inches(1)),
                "height": float(shape.height / Inches(1))
            }
        }
    
    def _extract_metadata(self, prs, file_path: str) -> Dict:
        """
        提取PPT元数据
        
        Args:
            prs: python-pptx的Presentation对象
            file_path: 文件路径
            
        Returns:
            元数据字典
        """
        return {
            "file_name": Path(file_path).name,
            "file_path": file_path,
            "slide_count": len(prs.slides),
            "author": prs.core_properties.author or "",
            "title": prs.core_properties.title or "",
            "created": prs.core_properties.created.isoformat() if prs.core_properties.created else "",
            "modified": prs.core_properties.modified.isoformat() if prs.core_properties.modified else ""
        }
    
    def extract_structure(self, ppt_data: Dict) -> Dict:
        """
        提取PPT的层级结构
        
        Args:
            ppt_data: 原始PPT数据
            
        Returns:
            结构化的层级信息：
            - title: 标题
            - sections: 章节列表
            - subsections: 子章节
        """
        structure = {
            "title": ppt_data.get("structure", {}).get("title", ""),
            "sections": []
        }
        
        current_section = None
        
        for slide in ppt_data.get("slides", []):
            title = slide.get("title", "")
            
            if self._is_section_title(title):
                if current_section:
                    structure["sections"].append(current_section)
                current_section = {
                    "title": title,
                    "page_number": slide["page_number"],
                    "subsections": []
                }
            elif current_section:
                current_section["subsections"].append({
                    "title": title,
                    "page_number": slide["page_number"],
                    "content": [tb["text"] for tb in slide.get("text_boxes", [])]
                })
        
        if current_section:
            structure["sections"].append(current_section)
        
        return structure
    
    def _is_section_title(self, title: str) -> bool:
        """
        判断是否为章节标题
        
        Args:
            title: 标题文本
            
        Returns:
            是否为章节标题
        """
        section_keywords = ["章", "Chapter", "Part", "部分", "单元"]
        return any(keyword in title for keyword in section_keywords)
    
    def extract_images(self, ppt_data: Dict) -> List[Dict]:
        """
        提取PPT中的图片信息
        
        Args:
            ppt_data: 原始PPT数据
            
        Returns:
            图片信息列表，包含：
            - image_id: 图片ID
            - page_number: 所在页码
            - description: 图片描述
            - position: 位置信息
        """
        images = []
        
        for slide in ppt_data.get("slides", []):
            for image in slide.get("images", []):
                images.append({
                    "image_id": f"slide_{slide['page_number']}_img_{image['id']}",
                    "page_number": slide["page_number"],
                    "description": image.get("description", ""),
                    "position": image.get("position", {})
                })
        
        return images
    
    def extract_text_chunks(self, ppt_data: Dict, chunk_size: int = 500) -> List[Dict]:
        """
        提取文本切片（用于向量化）
        
        Args:
            ppt_data: 原始PPT数据
            chunk_size: 每个切片的最大字符数
            
        Returns:
            文本切片列表
        """
        chunks = []
        
        for slide in ppt_data.get("slides", []):
            slide_text = " ".join([tb["text"] for tb in slide.get("text_boxes", [])])
            
            if len(slide_text) <= chunk_size:
                chunks.append({
                    "content": slide_text,
                    "page_number": slide["page_number"],
                    "title": slide.get("title", ""),
                    "chunk_id": f"slide_{slide['page_number']}_chunk_0"
                })
            else:
                words = slide_text.split()
                current_chunk = ""
                chunk_index = 0
                
                for word in words:
                    if len(current_chunk) + len(word) + 1 <= chunk_size:
                        current_chunk += " " + word if current_chunk else word
                    else:
                        chunks.append({
                            "content": current_chunk,
                            "page_number": slide["page_number"],
                            "title": slide.get("title", ""),
                            "chunk_id": f"slide_{slide['page_number']}_chunk_{chunk_index}"
                        })
                        current_chunk = word
                        chunk_index += 1
                
                if current_chunk:
                    chunks.append({
                        "content": current_chunk,
                        "page_number": slide["page_number"],
                        "title": slide.get("title", ""),
                        "chunk_id": f"slide_{slide['page_number']}_chunk_{chunk_index}"
                    })
        
        return chunks
