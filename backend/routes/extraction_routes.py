import sys
import os
import csv
from datetime import datetime

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from pathlib import Path
from config import UPLOAD_DIR, DATASET_DIR
from services.extractor import extract_content
import logging
from typing import List
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class ExtractionRequest(BaseModel):
    filenames: List[str]
    csv_filename: str

@router.post("/extract/")
async def extract_file_content(request: ExtractionRequest):
    results = []
    extracted_sentences = []

    for filename in request.filenames:
        try:
            file_path = Path(UPLOAD_DIR) / filename
            if not file_path.exists():
                results.append({"filename": filename, "status": "File not found"})
                continue

            # Extract content
            extracted_content = extract_content(file_path)

            # Add extracted sentences to the list
            extracted_sentences.extend([{"answer": sentence, "source": filename} for sentence in extracted_content])

            results.append({"filename": filename, "status": "Content extracted successfully"})
        except Exception as e:
            logger.error(f"Error extracting content from {filename}: {str(e)}")
            results.append({"filename": filename, "status": f"Error: {str(e)}"})

    # Create CSV file
    current_date = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_filename = f"{request.csv_filename}_{current_date}.csv"
    csv_path = Path(DATASET_DIR).parent / "extraction" / csv_filename
    csv_path.parent.mkdir(parents=True, exist_ok=True)

    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(["question", "answer", "source", "security classification"])
        for item in extracted_sentences:
            csv_writer.writerow([
                "",  # question (empty for now)
                item["answer"],
                item["source"],
                ""  # security classification (empty for now)
            ])

    return JSONResponse(content={
        "status": "Extraction process completed",
        "results": results,
        "csv_file": str(csv_path)
    }, status_code=200)

@router.get("/csv-files/")
async def list_csv_files():
    csv_dir = Path(DATASET_DIR).parent / "extraction"
    csv_files = [f.name for f in csv_dir.glob("*.csv")]
    return csv_files

@router.get("/csv-preview/{filename}")
async def get_csv_preview(filename: str):
    file_path = Path(DATASET_DIR).parent / "extraction" / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")
    
    try:
        with open(file_path, 'r', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            return [row for row in reader]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading CSV file: {str(e)}")