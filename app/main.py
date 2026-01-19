"""
FastAPI应用主入口
PPT内容扩展智能体的核心API服务
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from api.routes import router
from api.auth_routes import auth_router
from api.learning_routes import learning_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建FastAPI应用实例
app = FastAPI(
    title="PPT内容扩展智能体",
    description="基于云原生架构和LLM Agent的PPT学习助手系统",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api/v1", tags=["PPT扩展"])
app.include_router(auth_router, prefix="/api/v1", tags=["用户认证"])
app.include_router(learning_router, prefix="/api/v1", tags=["个性化学习"])


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "PPT内容扩展智能体API服务",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "ppt-extension-agent"}


@app.on_event("startup")
async def startup_event():
    """应用启动事件"""
    logger.info("PPT扩展智能体服务启动中...")


@app.on_event("shutdown")
async def shutdown_event():
    """应用关闭事件"""
    logger.info("PPT扩展智能体服务关闭")
