"""
知识扩充服务
使用LLM为PPT知识点生成扩展内容
"""

from typing import Dict, List, Optional
from langchain_openai import ChatOpenAI
from utils.prompts import get_expansion_prompt, get_validation_prompt
from utils.llm_factory import create_llm
import logging
import json
import re

logger = logging.getLogger(__name__)


class KnowledgeExpander:
    """
    知识扩充服务
    为PPT知识点生成背景说明、公式推导、代码示例等扩展内容
    """
    
    def __init__(self, llm: Optional[ChatOpenAI] = None):
        """
        初始化知识扩充器
        
        Args:
            llm: 大语言模型实例，如果为None则使用默认配置（SiliconFlow - DeepSeek-V3.2-Exp）
        """
        self.llm = llm or create_llm()
        logger.info("知识扩充服务初始化完成")
    
    def expand_knowledge_point(
        self,
        title: str,
        content: str,
        context: Optional[Dict] = None
    ) -> Dict:
        """
        为单个知识点扩充内容
        
        Args:
            title: 知识点标题
            content: 知识点原始内容
            context: 上下文信息（如所属章节、相关知识点等）
            
        Returns:
            扩充后的内容字典，包含：
            - background: 背景说明
            - principles: 原理说明
            - formulas: 公式推导（如适用）
            - examples: 代码示例（如适用）
            - summary: 总结
            - references: 延伸阅读链接
        """
        try:
            logger.info(f"开始扩充知识点: {title}")
            
            context_str = self._format_context(context)
            prompt = get_expansion_prompt(title, content, context_str)
            
            response = self.llm.invoke(prompt)
            expanded_content = self._parse_expansion_response(response.content)
            
            logger.info(f"知识点扩充完成: {title}")
            return expanded_content
            
        except Exception as e:
            logger.error(f"知识点扩充失败: {str(e)}")
            raise
    
    def batch_expand(
        self,
        knowledge_points: List[Dict]
    ) -> List[Dict]:
        """
        批量扩充知识点
        
        Args:
            knowledge_points: 知识点列表，每个元素包含title和content
            
        Returns:
            扩充后的知识点列表
        """
        logger.info(f"开始批量扩充{len(knowledge_points)}个知识点")
        
        results = []
        for idx, kp in enumerate(knowledge_points):
            try:
                result = self.expand_knowledge_point(
                    title=kp.get("title", ""),
                    content=kp.get("content", ""),
                    context=kp.get("context")
                )
                results.append({
                    "original": kp,
                    "expanded": result,
                    "status": "success"
                })
                logger.info(f"进度: {idx + 1}/{len(knowledge_points)}")
            except Exception as e:
                logger.error(f"知识点{idx + 1}扩充失败: {str(e)}")
                results.append({
                    "original": kp,
                    "expanded": None,
                    "status": "failed",
                    "error": str(e)
                })
        
        logger.info(f"批量扩充完成，成功{sum(1 for r in results if r['status'] == 'success')}/{len(results)}")
        return results
    
    def validate_expansion(
        self,
        original: str,
        expansion: Dict
    ) -> Dict:
        """
        验证扩充内容的准确性（容错机制）
        
        Args:
            original: 原始内容
            expansion: 扩充内容
            
        Returns:
            验证结果字典，包含：
            - is_relevant: 是否相关
            - is_accurate: 是否准确
            - is_consistent: 是否一致
            - confidence: 置信度
            - issues: 问题列表
        """
        try:
            logger.info("开始验证扩充内容")
            
            expansion_text = json.dumps(expansion, ensure_ascii=False)
            prompt = get_validation_prompt(original, expansion_text)
            
            response = self.llm.invoke(prompt)
            validation_result = self._parse_validation_response(response.content)
            
            logger.info(f"验证完成，置信度: {validation_result.get('confidence', 0)}")
            return validation_result
            
        except Exception as e:
            logger.error(f"验证失败: {str(e)}")
            return {
                "is_relevant": False,
                "is_accurate": False,
                "is_consistent": False,
                "confidence": 0.0,
                "issues": [f"验证过程出错: {str(e)}"]
            }
    
    def _format_context(self, context: Optional[Dict]) -> str:
        """
        格式化上下文信息
        
        Args:
            context: 上下文字典
            
        Returns:
            格式化后的上下文字符串
        """
        if not context:
            return "无"
        
        context_parts = []
        if "chapter" in context:
            context_parts.append(f"所属章节: {context['chapter']}")
        if "section" in context:
            context_parts.append(f"所属小节: {context['section']}")
        if "previous_points" in context:
            context_parts.append(f"前置知识点: {', '.join(context['previous_points'])}")
        if "page_number" in context:
            context_parts.append(f"所在页码: {context['page_number']}")
        
        return "\n".join(context_parts) if context_parts else "无"
    
    def _parse_expansion_response(self, response: str) -> Dict:
        """
        解析LLM返回的扩充内容
        
        Args:
            response: LLM返回的原始文本
            
        Returns:
            结构化的扩充内容字典
        """
        try:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                
                required_keys = ["background", "principles", "formulas", "examples", "summary"]
                for key in required_keys:
                    if key not in parsed:
                        parsed[key] = ""
                
                parsed["references"] = parsed.get("references", [])
                
                return parsed
            else:
                logger.warning("无法解析JSON格式，使用默认结构")
                return self._create_default_expansion(response)
                
        except json.JSONDecodeError as e:
            logger.warning(f"JSON解析失败: {str(e)}，使用默认结构")
            return self._create_default_expansion(response)
    
    def _create_default_expansion(self, response: str) -> Dict:
        """
        创建默认扩充结构
        
        Args:
            response: LLM返回的原始文本
            
        Returns:
            默认结构的扩充内容
        """
        return {
            "background": response[:500] if len(response) > 500 else response,
            "principles": "",
            "formulas": "",
            "examples": "",
            "summary": "",
            "references": []
        }
    
    def _parse_validation_response(self, response: str) -> Dict:
        """
        解析验证结果
        
        Args:
            response: LLM返回的验证文本
            
        Returns:
            结构化的验证结果字典
        """
        try:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                json_str = json_match.group()
                parsed = json.loads(json_str)
                
                required_keys = ["is_relevant", "is_accurate", "is_consistent", "confidence", "issues"]
                for key in required_keys:
                    if key not in parsed:
                        parsed[key] = False if "is_" in key else (0.0 if key == "confidence" else [])
                
                return parsed
            else:
                return {
                    "is_relevant": True,
                    "is_accurate": True,
                    "is_consistent": True,
                    "confidence": 0.8,
                    "issues": []
                }
                
        except json.JSONDecodeError:
            return {
                "is_relevant": True,
                "is_accurate": True,
                "is_consistent": True,
                "confidence": 0.8,
                "issues": []
            }
    
    def expand_with_validation(
        self,
        title: str,
        content: str,
        context: Optional[Dict] = None,
        max_retries: int = 2
    ) -> Dict:
        """
        带验证的知识扩充（自动重试机制）
        
        Args:
            title: 知识点标题
            content: 知识点原始内容
            context: 上下文信息
            max_retries: 最大重试次数
            
        Returns:
            扩充后的内容字典
        """
        for attempt in range(max_retries + 1):
            try:
                expanded = self.expand_knowledge_point(title, content, context)
                validation = self.validate_expansion(content, expanded)
                
                if validation["confidence"] >= 0.7:
                    logger.info(f"扩充验证通过（置信度: {validation['confidence']}）")
                    expanded["validation"] = validation
                    return expanded
                else:
                    logger.warning(f"扩充验证未通过（置信度: {validation['confidence']}），重试 {attempt + 1}/{max_retries}")
                    if attempt < max_retries:
                        continue
                    else:
                        logger.warning("达到最大重试次数，返回当前结果")
                        expanded["validation"] = validation
                        return expanded
                        
            except Exception as e:
                logger.error(f"扩充失败（尝试 {attempt + 1}/{max_retries}）: {str(e)}")
                if attempt < max_retries:
                    continue
                else:
                    raise
        
        return {
            "background": "",
            "principles": "",
            "formulas": "",
            "examples": "",
            "summary": "",
            "references": [],
            "validation": {
                "is_relevant": False,
                "is_accurate": False,
                "is_consistent": False,
                "confidence": 0.0,
                "issues": ["扩充失败"]
            }
        }
