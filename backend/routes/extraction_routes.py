import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from backend.config import UPLOAD_DIR, DATASET_DIR
from backend.services.extractor import extract_content

router = APIRouter()

@router.post("/extract/{filename}")
async def extract_file_content(filename: str):
    try:
        file_path = Path(UPLOAD_DIR) / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        # Extract content
        extracted_content = extract_content(file_path)

        # Save extracted content to a dataset file
        dataset_file = Path(DATASET_DIR) / f"{filename}_dataset.json"
        with dataset_file.open("w") as f:
            json.dump(extracted_content, f)

        return JSONResponse(content={"status": "Content extracted successfully", "dataset_file": str(dataset_file)}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))