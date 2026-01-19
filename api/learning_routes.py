from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from utils.auth import get_current_user
from services.user_service import set_goals, get_goals
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

import re

@learning_router.post("/plan/generate")
async def generate_plan(req: PlanRequest, current_user: dict = Depends(get_current_user)):
    llm = create_llm()
    prompt = f"为用户生成个性化学习计划，主题：{req.topic}，周期：{req.weeks}周，水平：{req.level}。分解为每周目标、每日任务、资料链接与练习题，输出JSON格式，不要包含Markdown标记：{{\"weeks\":[{{\"week\":1,\"targets\":[],\"daily_tasks\":[]}}],\"resources\":[],\"evaluation\":[]}}"
    resp = llm.invoke(prompt)
    
    # 清理可能的Markdown代码块标记
    content = resp.content
    content = re.sub(r'^```json\s*', '', content)
    content = re.sub(r'^```\s*', '', content)
    content = re.sub(r'\s*```$', '', content)
    
    return {"plan": content}

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