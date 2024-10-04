from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes import upload_routes, extraction_routes, review_routes
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow requests from React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload_routes.router, prefix="/api")
app.include_router(extraction_routes.router, prefix="/api")
app.include_router(review_routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to AFWI MAGE FineTune API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)