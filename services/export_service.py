"""
导出服务
支持导出为Markdown和PDF格式
"""

from typing import Dict, List
from pathlib import Path
import logging
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
import re

logger = logging.getLogger(__name__)


class ExportService:
    """
    导出服务类
    支持将扩展内容导出为Markdown和PDF格式
    """
    
    def __init__(self):
        """初始化导出服务"""
        logger.info("导出服务初始化完成")
    
    def export_to_markdown(self, ppt_data: Dict, expanded_data: Dict, page_number: int = None) -> str:
        """
        导出为Markdown格式
        
        Args:
            ppt_data: PPT原始数据
            expanded_data: 扩展后的数据
            page_number: 指定导出的页码，None表示导出全部
            
        Returns:
            Markdown格式的字符串
        """
        try:
            md_content = []
            
            md_content.append(f"# {ppt_data.get('metadata', {}).get('file_name', 'PPT扩展内容')}\n\n")
            
            slides_to_export = ppt_data.get('slides', [])
            
            if page_number is not None:
                slides_to_export = [s for s in slides_to_export if s.get('page_number') == page_number]
            
            for slide in slides_to_export:
                page_num = slide.get('page_number', 0)
                title = slide.get('title', f'第{page_num}页')
                
                md_content.append(f"## {title}\n\n")
                
                # 导出文本内容
                for text_box in slide.get('text_boxes', []):
                    text = text_box.get('text', '')
                    if text:
                        md_content.append(f"### {text}\n\n")
                        
                        slide_key = f"slide_{page_num}_box_{text_box.get('id', '')}"
                        expanded_content = expanded_data.get(slide_key, {})
                        
                        if expanded_content:
                            if expanded_content.get('background'):
                                md_content.append(f"**背景说明**\n\n{expanded_content['background']}\n\n")
                            
                            if expanded_content.get('principles'):
                                md_content.append(f"**原理阐述**\n\n{expanded_content['principles']}\n\n")
                            
                            if expanded_content.get('formulas'):
                                md_content.append(f"**公式推导**\n\n{expanded_content['formulas']}\n\n")
                            
                            if expanded_content.get('examples'):
                                md_content.append(f"**代码示例**\n\n```python\n{expanded_content['examples']}\n```\n\n")
                            
                            if expanded_content.get('summary'):
                                md_content.append(f"**要点总结**\n\n{expanded_content['summary']}\n\n")
                            
                            if expanded_content.get('references'):
                                md_content.append("**参考资料**\n\n")
                                for ref in expanded_content['references']:
                                    md_content.append(f"- [{ref.get('title', '')}]({ref.get('url', '')})\n")
                                md_content.append("\n")
                
                # 导出图片信息
                images = slide.get('images', [])
                if images:
                    md_content.append("### 图片内容\n\n")
                    for img in images:
                        file_path = img.get('file_path', '')
                        description = img.get('description', '')
                        ocr_text = img.get('ocr_text', '')
                        
                        if file_path:
                            # 在Markdown中插入图片
                            md_content.append(f"![图片]({file_path})\n\n")
                        
                        if description:
                            md_content.append(f"**图片描述**: {description}\n\n")
                        
                        if ocr_text and ocr_text != description:
                            md_content.append(f"**识别文字**: {ocr_text}\n\n")
                    
                    # 如果有图片，在知识扩充时考虑图片内容
                    if description or ocr_text:
                        image_content = description or ocr_text
                        slide_key = f"slide_{page_num}_images"
                        expanded_content = expanded_data.get(slide_key, {})
                        
                        if expanded_content:
                            if expanded_content.get('background'):
                                md_content.append(f"**图片相关背景说明**\n\n{expanded_content['background']}\n\n")
                            if expanded_content.get('principles'):
                                md_content.append(f"**图片相关原理阐述**\n\n{expanded_content['principles']}\n\n")
                
                md_content.append("---\n\n")
            
            return ''.join(md_content)
            
        except Exception as e:
            logger.error(f"导出Markdown失败: {str(e)}")
            raise
    
    def export_to_pdf(self, markdown_content: str, output_path: str) -> str:
        """
        将Markdown转换为PDF
        
        Args:
            markdown_content: Markdown内容
            output_path: 输出文件路径
            
        Returns:
            PDF文件路径
        """
        try:
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            styles = getSampleStyleSheet()
            story = []
            
            lines = markdown_content.split('\n')
            in_code_block = False
            code_lines = []
            
            for line in lines:
                if line.strip().startswith('```'):
                    if in_code_block:
                        in_code_block = False
                        code_text = '\n'.join(code_lines)
                        code_style = ParagraphStyle(
                            'Code',
                            parent=styles['Code'],
                            fontName='Courier',
                            fontSize=9,
                            leading=12,
                            leftIndent=20,
                            backColor=colors.lightgrey,
                            borderPadding=10
                        )
                        story.append(Paragraph(code_text, code_style))
                        code_lines = []
                    else:
                        in_code_block = True
                        code_lines = []
                    continue
                
                if in_code_block:
                    code_lines.append(line)
                    continue
                
                if line.strip():
                    if line.startswith('# '):
                        h1_style = ParagraphStyle(
                            'CustomH1',
                            parent=styles['Heading1'],
                            fontSize=18,
                            textColor='#2c3e50',
                            spaceAfter=12,
                            spaceBefore=12
                        )
                        text = line[2:].strip()
                        story.append(Paragraph(text, h1_style))
                    elif line.startswith('## '):
                        h2_style = ParagraphStyle(
                            'CustomH2',
                            parent=styles['Heading2'],
                            fontSize=14,
                            textColor='#34495e',
                            spaceAfter=10,
                            spaceBefore=10
                        )
                        text = line[3:].strip()
                        story.append(Paragraph(text, h2_style))
                    elif line.startswith('### '):
                        h3_style = ParagraphStyle(
                            'CustomH3',
                            parent=styles['Heading3'],
                            fontSize=12,
                            textColor='#7f8c8d',
                            spaceAfter=8,
                            spaceBefore=8
                        )
                        text = line[4:].strip()
                        story.append(Paragraph(text, h3_style))
                    elif line.startswith('---'):
                        story.append(Spacer(1, 0.2 * inch))
                    elif line.startswith('**') and line.endswith('**'):
                        bold_style = ParagraphStyle(
                            'CustomBold',
                            parent=styles['Normal'],
                            fontName='Helvetica-Bold',
                            fontSize=11
                        )
                        text = line[2:-2].strip()
                        story.append(Paragraph(text, bold_style))
                    elif line.startswith('- '):
                        bullet_style = ParagraphStyle(
                            'CustomBullet',
                            parent=styles['Normal'],
                            leftIndent=20,
                            bulletIndent=10,
                            fontSize=10
                        )
                        text = line[2:].strip()
                        story.append(Paragraph(f"• {text}", bullet_style))
                    else:
                        normal_style = ParagraphStyle(
                            'CustomNormal',
                            parent=styles['Normal'],
                            fontSize=10,
                            leading=14,
                            alignment=TA_LEFT
                        )
                        story.append(Paragraph(line, normal_style))
            
            doc.build(story)
            
            logger.info(f"PDF导出成功: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"导出PDF失败: {str(e)}")
            raise
    
    def save_markdown(self, markdown_content: str, output_path: str) -> str:
        """
        保存Markdown文件
        
        Args:
            markdown_content: Markdown内容
            output_path: 输出文件路径
            
        Returns:
            文件路径
        """
        try:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(markdown_content)
            
            logger.info(f"Markdown文件保存成功: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"保存Markdown文件失败: {str(e)}")
            raise


export_service = ExportService()
