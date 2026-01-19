from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from utils.auth import get_current_user
from services.user_service import set_goals, get_goals, save_plan, get_plans
from utils.llm_factory import create_llm
from services.search_service import SearchService

learning_router = APIRouter()

class GoalsRequest(BaseModel):
    goals: Dict[str, Any]

class PlanRequest(BaseModel):
    topic: str
    weeks: int = 2
    level: str = "beginner"

@learning_router.post("/goals")
async def set_user_goals(req: GoalsRequest, current_user: dict = Depends(get_current_user)):
    saved = set_goals(current_user["username"], req.goals)
    return {"status": "success", "goals": saved}

@learning_router.get("/goals")
async def get_user_goals(current_user: dict = Depends(get_current_user)):
    return {"goals": get_goals(current_user["username"])}

@learning_router.get("/plans")
async def get_user_plans(current_user: dict = Depends(get_current_user)):
    return {"plans": get_plans(current_user["username"])}

import re
import json
from datetime import datetime

@learning_router.post("/plan/generate")
async def generate_learning_plan(
    req: PlanRequest,
    current_user: dict = Depends(get_current_user)
):
    print(f"DEBUG: generate_plan called for user: {current_user['username']} with topic: {req.topic}")
    try:
        llm = create_llm()
        prompt = f"为用户生成个性化学习计划，主题：{req.topic}，周期：{req.weeks}周，水平：{req.level}。分解为每周目标、每日任务、资料链接与练习题，输出JSON格式，不要包含Markdown标记。JSON结构示例：{{\"weeks\":[{{\"week\":1,\"targets\":[\"目标1\"],\"daily_tasks\":[{{\"day\": 1, \"task\": \"任务内容\"}}]}}],\"resources\":[],\"evaluation\":[]}}"
        resp = llm.invoke(prompt)
        
        content = resp.content
        print(f"LLM Response Content: {content[:100]}...") # Log start of content

        # 尝试提取 JSON
        plan_data = None
        try:
            # 1. 尝试直接解析
            plan_data = json.loads(content)
        except json.JSONDecodeError:
            try:
                # 2. 尝试清理 Markdown 标记
                clean_content = re.sub(r'^```json\s*', '', content)
                clean_content = re.sub(r'^```\s*', '', clean_content)
                clean_content = re.sub(r'\s*```$', '', clean_content)
                plan_data = json.loads(clean_content)
            except json.JSONDecodeError:
                try:
                    # 3. 尝试正则提取第一个 JSON 对象
                    match = re.search(r'\{.*\}', content, re.DOTALL)
                    if match:
                        plan_data = json.loads(match.group())
                    else:
                        raise ValueError("No JSON object found")
                except Exception as e:
                    print(f"Plan parsing failed: {e}")
                    # 如果后端解析完全失败，就无法保存结构化数据
                    # 但我们可以保存原始文本，以便后续查看
                    plan_data = {"raw": content, "parsing_error": str(e)}

        # 保存计划
        try:
            full_plan = {
                "topic": req.topic,
                "created_at": datetime.now().isoformat(),
                "content": plan_data
            }
            save_plan(current_user["username"], full_plan)
            print(f"Plan saved for user {current_user['username']}")
        except Exception as e:
            print(f"Plan save failed: {e}")

        return {"plan": content}
        
    except Exception as e:
        print(f"Generate plan failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class RecommendRequest(BaseModel):
    query: Optional[str] = None
    max_results: int = 3

@learning_router.post("/recommendations")
async def recommendations(req: RecommendRequest, current_user: dict = Depends(get_current_user)):
    goals = get_goals(current_user["username"])
    query = req.query or goals.get("topic") or ""
    if not query:
        raise HTTPException(status_code=400, detail="缺少查询或学习目标")
    search = SearchService()
    results = search.multi_source_search(query, max_results_per_source=req.max_results)
    return {"query": query, "results": results}