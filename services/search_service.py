"""
搜索服务
整合Wikipedia、Arxiv等外部知识源
"""

from typing import Dict, List, Optional
import wikipedia
import arxiv
import requests
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)


class SearchService:
    """
    搜索服务
    整合多个外部知识源，为PPT内容提供权威参考资料
    """
    
    def __init__(self, wikipedia_lang: str = "zh"):
        """
        初始化搜索服务
        
        Args:
            wikipedia_lang: Wikipedia语言设置（默认中文）
        """
        wikipedia.set_lang(wikipedia_lang)
        logger.info(f"搜索服务初始化完成（Wikipedia语言: {wikipedia_lang}）")
    
    def search_wikipedia(self, query: str, max_results: int = 3) -> List[Dict]:
        """
        在Wikipedia中搜索相关内容
        
        Args:
            query: 搜索查询词
            max_results: 最大返回结果数
            
        Returns:
            搜索结果列表，每个结果包含：
            - title: 标题
            - summary: 摘要
            - url: 链接
            - relevance: 相关度
        """
        try:
            logger.info(f"在Wikipedia搜索: {query}")
            
            search_results = wikipedia.search(query, results=max_results)
            results = []
            
            for title in search_results:
                try:
                    page = wikipedia.page(title, auto_suggest=False)
                    
                    results.append({
                        "title": page.title,
                        "summary": page.summary[:500] + "..." if len(page.summary) > 500 else page.summary,
                        "url": page.url,
                        "relevance": self._calculate_relevance(query, page.title, page.summary)
                    })
                except wikipedia.exceptions.DisambiguationError as e:
                    logger.warning(f"Wikipedia消歧义: {e.options}")
                    continue
                except wikipedia.exceptions.PageError:
                    logger.warning(f"Wikipedia页面不存在: {title}")
                    continue
            
            results.sort(key=lambda x: x["relevance"], reverse=True)
            logger.info(f"Wikipedia搜索完成，找到{len(results)}个结果")
            return results
            
        except Exception as e:
            logger.error(f"Wikipedia搜索失败: {str(e)}")
            return []
    
    def search_arxiv(self, query: str, max_results: int = 3) -> List[Dict]:
        """
        在Arxiv中搜索相关论文
        
        Args:
            query: 搜索查询词
            max_results: 最大返回结果数
            
        Returns:
            搜索结果列表，每个结果包含：
            - title: 论文标题
            - authors: 作者列表
            - summary: 摘要
            - url: 链接
            - published: 发表日期
            - relevance: 相关度
        """
        try:
            logger.info(f"在Arxiv搜索: {query}")
            
            search = arxiv.Search(
                query=query,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            results = []
            for result in search.results():
                results.append({
                    "title": result.title,
                    "authors": [author.name for author in result.authors],
                    "summary": result.summary[:500] + "..." if len(result.summary) > 500 else result.summary,
                    "url": result.entry_id,
                    "published": result.published.strftime("%Y-%m-%d"),
                    "relevance": self._calculate_relevance(query, result.title, result.summary)
                })
            
            results.sort(key=lambda x: x["relevance"], reverse=True)
            logger.info(f"Arxiv搜索完成，找到{len(results)}篇论文")
            return results
            
        except Exception as e:
            logger.error(f"Arxiv搜索失败: {str(e)}")
            return []
    
    def search_bing(self, query: str, max_results: int = 3, api_key: str = "") -> List[Dict]:
        """
        使用Bing搜索API（可选，需要API密钥）
        
        Args:
            query: 搜索查询词
            max_results: 最大返回结果数
            api_key: Bing API密钥
            
        Returns:
            搜索结果列表
        """
        if not api_key:
            logger.warning("Bing API密钥未提供，跳过Bing搜索")
            return []
        
        try:
            logger.info(f"在Bing搜索: {query}")
            
            endpoint = "https://api.bing.microsoft.com/v7.0/search"
            headers = {"Ocp-Apim-Subscription-Key": api_key}
            params = {
                "q": query,
                "count": max_results,
                "mkt": "zh-CN"
            }
            
            response = requests.get(endpoint, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            results = []
            
            for item in data.get("webPages", {}).get("value", []):
                results.append({
                    "title": item.get("name", ""),
                    "summary": item.get("snippet", ""),
                    "url": item.get("url", ""),
                    "relevance": self._calculate_relevance(query, item.get("name", ""), item.get("snippet", ""))
                })
            
            logger.info(f"Bing搜索完成，找到{len(results)}个结果")
            return results
            
        except Exception as e:
            logger.error(f"Bing搜索失败: {str(e)}")
            return []
    
    def multi_source_search(
        self,
        query: str,
        sources: List[str] = None,
        max_results_per_source: int = 3
    ) -> Dict[str, List[Dict]]:
        """
        多源搜索
        
        Args:
            query: 搜索查询词
            sources: 搜索源列表（可选：["wikipedia", "arxiv", "bing"]）
            max_results_per_source: 每个源的最大结果数
            
        Returns:
            各搜索源的结果字典
        """
        if sources is None:
            sources = ["wikipedia", "arxiv"]
        
        logger.info(f"开始多源搜索: {query}，搜索源: {sources}")
        
        results = {}
        
        if "wikipedia" in sources:
            results["wikipedia"] = self.search_wikipedia(query, max_results_per_source)
        
        if "arxiv" in sources:
            results["arxiv"] = self.search_arxiv(query, max_results_per_source)
        
        if "bing" in sources:
            results["bing"] = self.search_bing(query, max_results_per_source)
        
        total_results = sum(len(r) for r in results.values())
        logger.info(f"多源搜索完成，共找到{total_results}个结果")
        
        return results
    
    def _calculate_relevance(self, query: str, title: str, summary: str) -> float:
        """
        计算搜索结果的相关度
        
        Args:
            query: 搜索查询词
            title: 结果标题
            summary: 结果摘要
            
        Returns:
            相关度分数（0-1）
        """
        query_lower = query.lower()
        title_lower = title.lower()
        summary_lower = summary.lower()
        
        score = 0.0
        
        query_words = set(query_lower.split())
        
        title_words = set(title_lower.split())
        title_match = len(query_words & title_words) / len(query_words) if query_words else 0
        score += title_match * 0.6
        
        summary_words = set(summary_lower.split())
        summary_match = len(query_words & summary_words) / len(query_words) if query_words else 0
        score += summary_match * 0.4
        
        return min(score, 1.0)
    
    def get_wikipedia_page(self, title: str) -> Optional[Dict]:
        """
        获取Wikipedia页面完整内容
        
        Args:
            title: 页面标题
            
        Returns:
            页面内容字典
        """
        try:
            page = wikipedia.page(title, auto_suggest=False)
            return {
                "title": page.title,
                "content": page.content[:2000] + "..." if len(page.content) > 2000 else page.content,
                "summary": page.summary,
                "url": page.url,
                "images": page.images[:5] if page.images else [],
                "categories": page.categories[:10] if page.categories else []
            }
        except Exception as e:
            logger.error(f"获取Wikipedia页面失败: {str(e)}")
            return None
    
    def get_arxiv_paper(self, paper_id: str) -> Optional[Dict]:
        """
        获取Arxiv论文详细信息
        
        Args:
            paper_id: 论文ID
            
        Returns:
            论文详细信息字典
        """
        try:
            search = arxiv.Search(id_list=[paper_id])
            result = next(search.results(), None)
            
            if result:
                return {
                    "title": result.title,
                    "authors": [author.name for author in result.authors],
                    "summary": result.summary,
                    "published": result.published.strftime("%Y-%m-%d"),
                    "url": result.entry_id,
                    "pdf_url": result.pdf_url,
                    "primary_category": result.primary_category
                }
            else:
                return None
                
        except Exception as e:
            logger.error(f"获取Arxiv论文失败: {str(e)}")
            return None
    
    def generate_search_query(self, content: str, context: Optional[Dict] = None) -> str:
        """
        生成优化的搜索查询词
        
        Args:
            content: 原始内容
            context: 上下文信息
            
        Returns:
            优化后的搜索查询词
        """
        words = content.split()
        
        if len(words) <= 5:
            return content
        
        keywords = []
        
        for word in words:
            if len(word) > 2 and word not in ["的", "是", "在", "和", "与", "或", "以及"]:
                keywords.append(word)
        
        if context and "chapter" in context:
            keywords.insert(0, context["chapter"])
        
        query = " ".join(keywords[:8])
        
        logger.info(f"生成搜索查询: {query}")
        return query
