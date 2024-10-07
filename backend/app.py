import sys
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload_routes, extraction_routes, generate_routes
from config import DATASET_DIR, EXTRACTION_DIR

print("Current working directory:", os.getcwd())
print("Python path before modification:", sys.path)

# Add the current directory and its parent to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, parent_dir)

print("Python path after modification:", sys.path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"Current working directory: {os.getcwd()}")

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    print(f"DATASET_DIR: {DATASET_DIR}")
    print(f"EXTRACTION_DIR: {EXTRACTION_DIR}")
    print(f"DATASET_DIR exists: {os.path.exists(DATASET_DIR)}")
    print(f"EXTRACTION_DIR exists: {os.path.exists(EXTRACTION_DIR)}")
    print(f"Files in DATASET_DIR: {os.listdir(DATASET_DIR)}")
    print(f"Files in EXTRACTION_DIR: {os.listdir(EXTRACTION_DIR)}")
    
    for file in os.listdir(DATASET_DIR):
        file_path = os.path.join(DATASET_DIR, file)
        print(f"File: {file}, Readable: {os.access(file_path, os.R_OK)}")
        print(f"File size: {os.path.getsize(file_path)} bytes")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
                print(f"First line of {file}: {first_line}")
        except Exception as e:
            print(f"Error reading {file}: {str(e)}")

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
app.include_router(generate_routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to AFWI MAGE FineTune API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)