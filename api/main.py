from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
from api.auth_routes import auth_router
from api.learning_routes import learning_router
import os

app = FastAPI(title="PPT Extension Agent API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(api_router, prefix="/api/v1", tags=["PPT Operations"])
app.include_router(auth_router, prefix="/api/v1", tags=["Authentication"])
app.include_router(learning_router, prefix="/api/v1", tags=["Learning"])

# Ensure upload directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/references", exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
