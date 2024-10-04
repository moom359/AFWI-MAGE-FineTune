from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import json
from backend.config import DATASET_DIR

router = APIRouter()

@router.get("/review/{filename}")
async def get_extracted_content(filename: str):
    try:
        file_path = Path(DATASET_DIR) / f"{filename}_dataset.json"
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Extracted content not found")

        with open(file_path, 'r') as f:
            content = json.load(f)

        return JSONResponse(content=content, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/review/{filename}")
async def update_extracted_content(filename: str, content: list):
    try:
        file_path = Path(DATASET_DIR) / f"{filename}_dataset.json"
        with open(file_path, 'w') as f:
            json.dump(content, f)

        return JSONResponse(content={"status": "Content updated successfully"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))