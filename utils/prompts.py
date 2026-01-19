"""
Prompt模板管理
定义LLM Agent使用的各种Prompt模板
"""

from typing import Dict, Optional


def get_expansion_prompt(
    title: str,
    content: str,
    context: str = "无"
) -> str:
    """
    获取知识扩充的Prompt模板
    
    Args:
        title: 知识点标题
        content: 知识点内容
        context: 上下文信息
        
    Returns:
        格式化后的Prompt字符串
    """
    prompt = f"""你是一位专业的教育内容扩展助手，擅长将简短的知识点扩展为详细的学习材料。请为以下PPT知识点生成详细的扩展内容。

**标题**: {title}

**原始内容**: {content}

**上下文信息**:
{context}

**扩展要求**:
1. **背景说明**: 解释知识点的来龙去脉、历史背景和应用场景
2. **原理阐述**: 详细阐述核心原理、工作机制和关键概念
3. **公式推导**: 如有数学公式，请提供完整的推导过程（使用LaTeX格式，如 $E=mc^2$）
4. **代码示例**: 如有编程实现，请提供Python代码示例，并添加详细注释
5. **要点总结**: 总结核心要点，便于快速复习

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "background": "背景说明内容...",
    "principles": "原理阐述内容...",
    "formulas": "公式推导内容（如适用）",
    "examples": "代码示例内容（如适用）",
    "summary": "要点总结内容..."
}}
```

**注意事项**:
- 确保内容准确，避免产生幻觉
- 使用专业但易懂的语言
- 公式使用LaTeX格式
- 代码要有详细注释
- 每个部分至少100字
- 如果某个部分不适用，请填写"不适用"
"""
    return prompt


def get_validation_prompt(
    original: str,
    expansion: str
) -> str:
    """
    获取内容验证的Prompt
    
    Args:
        original: 原始内容
        expansion: 扩充内容
        
    Returns:
        验证Prompt
    """
    prompt = f"""你是一位专业的内容审核专家，负责验证知识扩充内容的准确性和相关性。请对以下扩充内容进行严格审核。

**原始内容**: {original}

**扩充内容**:
{expansion}

**验证标准**:
1. **语义相关性**: 扩充内容是否与原始内容主题高度相关？
2. **事实准确性**: 扩充内容中的事实、数据、公式是否准确无误？
3. **逻辑一致性**: 扩充内容内部逻辑是否自洽，是否存在矛盾？
4. **完整性**: 扩充内容是否全面覆盖了原始内容的各个方面？

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "is_relevant": true/false,
    "is_accurate": true/false,
    "is_consistent": true/false,
    "confidence": 0.0-1.0,
    "issues": ["问题1", "问题2"]
}}
```

**评分说明**:
- confidence: 综合置信度（0.0-1.0），0.7以上为合格
- issues: 列出所有发现的问题，如果没有问题则为空列表

请严格审核，确保内容质量。
"""
    return prompt


def get_search_query_prompt(content: str) -> str:
    """
    生成搜索查询词的Prompt
    
    Args:
        content: 原始内容
        
    Returns:
        搜索查询词
    """
    prompt = f"""你是一位专业的信息检索专家。请为以下内容生成优化的搜索查询词，用于在Wikipedia、Arxiv等学术资源中查找相关资料。

**原始内容**: {content}

**要求**:
1. 提取核心关键词（3-8个）
2. 去除停用词（的、是、在、和等）
3. 保持专业术语的准确性
4. 优先使用英文术语（如果适用）

**输出格式**:
直接输出搜索查询词，不需要JSON格式。

**示例**:
输入: "监督学习是机器学习的一种方法，通过标注数据训练模型"
输出: "监督学习 supervised learning 标注数据"
"""
    return prompt


def get_summarization_prompt(content: str, max_length: int = 200) -> str:
    """
    获取总结生成的Prompt
    
    Args:
        content: 需要总结的内容
        max_length: 最大长度
        
    Returns:
        总结Prompt
    """
    prompt = f"""你是一位专业的教育内容总结专家。请将以下内容总结为简洁明了的要点，便于快速复习。

**原始内容**:
{content}

**要求**:
1. 提取核心要点（3-5个）
2. 每个要点不超过{max_length}字
3. 使用简洁的语言
4. 保持逻辑清晰

**输出格式**:
直接输出总结内容，每行一个要点，不需要JSON格式。

**示例**:
- 监督学习使用标注数据训练模型
- 常见算法包括线性回归、决策树等
- 适用于分类和回归任务
"""
    return prompt


def get_formula_derivation_prompt(content: str) -> str:
    """
    获取公式推导的Prompt
    
    Args:
        content: 需要推导的内容
        
    Returns:
        公式推导Prompt
    """
    prompt = f"""你是一位专业的数学和物理教育专家。请为以下知识点提供详细的公式推导过程。

**知识点**: {content}

**要求**:
1. 从基本原理出发，逐步推导
2. 每个步骤都要有清晰的说明
3. 使用LaTeX格式表示公式（如 $E=mc^2$）
4. 解释每个符号的含义
5. 说明推导的物理意义或数学意义

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "formula": "最终公式",
    "derivation": "详细推导过程",
    "symbols": {{"符号1": "含义1", "符号2": "含义2"}},
    "meaning": "物理/数学意义"
}}
```

**注意事项**:
- 确保推导过程准确无误
- 步骤要清晰易懂
- 符号定义要完整
"""
    return prompt


def get_code_example_prompt(content: str, language: str = "Python") -> str:
    """
    获取代码示例的Prompt
    
    Args:
        content: 需要实现的内容
        language: 编程语言
        
    Returns:
        代码示例Prompt
    """
    prompt = f"""你是一位专业的编程教育专家。请为以下知识点提供完整的代码示例。

**知识点**: {content}

**编程语言**: {language}

**要求**:
1. 提供完整可运行的代码
2. 代码要有详细注释
3. 包含必要的导入语句
4. 添加示例输出
5. 代码风格符合PEP 8规范

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "code": "完整代码",
    "explanation": "代码说明",
    "output": "示例输出",
    "dependencies": ["依赖库1", "依赖库2"]
}}
```

**注意事项**:
- 确保代码可以运行
- 注释要详细清晰
- 变量命名要有意义
"""
    return prompt


def get_background_prompt(content: str) -> str:
    """
    获取背景说明的Prompt
    
    Args:
        content: 需要说明的内容
        
    Returns:
        背景说明Prompt
    """
    prompt = f"""你是一位专业的教育历史和背景知识专家。请为以下知识点提供详细的背景说明。

**知识点**: {content}

**要求**:
1. 介绍知识点的起源和历史发展
2. 说明知识点的应用场景
3. 解释为什么需要学习这个知识点
4. 提供相关的实际案例
5. 说明知识点在学科体系中的地位

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "origin": "起源和发展",
    "applications": ["应用场景1", "应用场景2"],
    "importance": "重要性说明",
    "examples": ["实际案例1", "实际案例2"],
    "position": "在学科体系中的地位"
}}
```

**注意事项**:
- 内容要准确可靠
- 案例要具体生动
- 语言要通俗易懂
"""
    return prompt


def get_principles_prompt(content: str) -> str:
    """
    获取原理阐述的Prompt
    
    Args:
        content: 需要阐述的内容
        
    Returns:
        原理阐述Prompt
    """
    prompt = f"""你是一位专业的教育原理阐述专家。请为以下知识点提供详细的原理阐述。

**知识点**: {content}

**要求**:
1. 详细阐述核心原理和机制
2. 解释关键概念和术语
3. 说明原理的工作流程
4. 对比不同的实现方法
5. 说明原理的优缺点

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "core_principle": "核心原理",
    "key_concepts": {{"概念1": "定义1", "概念2": "定义2"}},
    "workflow": "工作流程",
    "methods": ["方法1", "方法2"],
    "pros_cons": {{"优点": ["优点1", "优点2"], "缺点": ["缺点1", "缺点2"]}}
}}
```

**注意事项**:
- 原理阐述要深入浅出
- 概念定义要准确
- 工作流程要清晰
- 优缺点分析要客观
"""
    return prompt


def get_multi_source_integration_prompt(
    llm_expansion: Dict,
    search_results: Dict
) -> str:
    """
    获取多源信息整合的Prompt
    
    Args:
        llm_expansion: LLM生成的扩展内容
        search_results: 搜索结果（Wikipedia、Arxiv等）
        
    Returns:
        整合Prompt
    """
    prompt = f"""你是一位专业的知识整合专家。请将LLM生成的扩展内容与外部搜索结果进行整合，生成更全面、更准确的学习材料。

**LLM扩展内容**:
{llm_expansion}

**搜索结果**:
{search_results}

**整合要求**:
1. 保留LLM生成内容的优点
2. 补充搜索结果中的权威信息
3. 去除重复内容
4. 标注信息来源（LLM、Wikipedia、Arxiv等）
5. 确保内容的一致性和准确性

**输出格式**（必须严格按照以下JSON格式输出）:
```json
{{
    "background": {{
        "content": "整合后的背景说明",
        "sources": ["LLM", "Wikipedia"]
    }},
    "principles": {{
        "content": "整合后的原理阐述",
        "sources": ["LLM", "Arxiv"]
    }},
    "formulas": {{
        "content": "整合后的公式推导",
        "sources": ["LLM"]
    }},
    "examples": {{
        "content": "整合后的代码示例",
        "sources": ["LLM"]
    }},
    "summary": {{
        "content": "整合后的要点总结",
        "sources": ["LLM"]
    }},
    "references": [
        {{"title": "标题", "url": "链接", "source": "Wikipedia"}},
        {{"title": "标题", "url": "链接", "source": "Arxiv"}}
    ]
}}
```

**注意事项**:
- 优先保留权威来源的信息
- 标注信息来源便于追溯
- 确保整合后的内容逻辑清晰
"""
    return prompt


def get_image_description_prompt(ocr_text: str, page_number: int = None) -> str:
    """
    获取图片描述的Prompt
    
    Args:
        ocr_text: OCR识别的文字内容
        page_number: 页码
        
    Returns:
        图片描述Prompt
    """
    page_context = f"这是PPT第{page_number}页的图片。" if page_number else "这是PPT中的一张图片。"
    
    prompt = f"""你是一位专业的图片内容分析专家。请根据OCR识别的文字内容，为以下图片生成详细的内容描述。

{page_context}

**OCR识别的文字内容**:
{ocr_text if ocr_text else "未识别到文字"}

**要求**:
1. 如果识别到文字，请总结文字的主要内容
2. 推断图片可能的类型（图表、流程图、示意图、照片等）
3. 描述图片在PPT中可能的作用和意义
4. 如果图片包含数据或图表，请描述关键信息
5. 使用简洁清晰的语言，控制在200字以内

**输出格式**:
直接输出图片描述，不需要JSON格式。

**示例**:
如果OCR识别到"机器学习流程图"和"监督学习 -> 无监督学习 -> 强化学习"，可以描述为：
"这是一张机器学习流程图，展示了三种主要的学习方式：监督学习、无监督学习和强化学习。图片可能用于说明机器学习的基本分类。"
"""
    return prompt
