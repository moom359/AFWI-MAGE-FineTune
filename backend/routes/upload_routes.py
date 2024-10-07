import sys
import os

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Path
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse, HTMLResponse
from pathlib import Path
from utils.validators import validate_file_extension  # Changed this line
from config import UPLOAD_DIR, ALLOWED_EXTENSIONS
import zipfile
from io import BytesIO
import logging
import shutil
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json
from PyPDF4 import PdfFileReader, PdfFileWriter  # Changed from PyPDF2 to PyPDF4
import io
from docx import Document

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter()

class FolderCreate(BaseModel):
    name: str
    parent_folder: Optional[str] = None

class FolderRename(BaseModel):
    old_name: str
    new_name: str
    parent_folder: Optional[str] = None

class FileRename(BaseModel):
    old_name: str
    new_name: str
    folder: str = ""

class SecurityUpdateRequest(BaseModel):
    filename: str
    security_classification: str

@router.post("/create_folder/")
async def create_folder(folder: FolderCreate):
    folder_path = Path(UPLOAD_DIR) / (folder.parent_folder or "") / folder.name
    if folder_path.exists():
        raise HTTPException(status_code=400, detail="Folder already exists")
    folder_path.mkdir(parents=True, exist_ok=True)
    return {"message": f"Folder '{folder.name}' created successfully"}

@router.post("/rename_folder/")
async def rename_folder(folder: FolderRename):
    old_path = Path(UPLOAD_DIR) / (folder.parent_folder or "") / folder.old_name
    new_path = Path(UPLOAD_DIR) / (folder.parent_folder or "") / folder.new_name
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="Folder not found")
    if new_path.exists():
        raise HTTPException(status_code=400, detail="New folder name already exists")
    old_path.rename(new_path)
    return {"message": f"Folder renamed from '{folder.old_name}' to '{folder.new_name}' successfully"}

@router.post("/rename_file/")
async def rename_file(file_rename: FileRename):
    logger.info(f"Received rename request: {file_rename}")
    logger.info(f"UPLOAD_DIR: {UPLOAD_DIR}")
    
    old_path = Path(UPLOAD_DIR) / file_rename.folder / file_rename.old_name
    new_path = Path(UPLOAD_DIR) / file_rename.folder / file_rename.new_name
    
    logger.info(f"Constructed old_path: {old_path}")
    logger.info(f"Constructed new_path: {new_path}")
    
    logger.info(f"Checking if old_path exists: {old_path.exists()}")
    logger.info(f"Checking if new_path exists: {new_path.exists()}")
    
    if not old_path.exists():
        logger.error(f"File not found: {old_path}")
        raise HTTPException(status_code=404, detail=f"File not found: {old_path}")
    if new_path.exists() and old_path != new_path:
        logger.error(f"New file name already exists: {new_path}")
        raise HTTPException(status_code=400, detail=f"New file name already exists: {new_path}")
    try:
        if old_path != new_path:
            logger.info(f"Attempting to rename file from {old_path} to {new_path}")
            old_path.rename(new_path)
            logger.info(f"File renamed successfully")
            
            # Rename metadata file if it exists
            old_metadata_path = old_path.with_suffix('.metadata')
            logger.info(f"Checking for metadata file: {old_metadata_path}")
            if old_metadata_path.exists():
                new_metadata_path = new_path.with_suffix('.metadata')
                logger.info(f"Renaming metadata file from {old_metadata_path} to {new_metadata_path}")
                old_metadata_path.rename(new_metadata_path)
                logger.info(f"Metadata file renamed successfully")
        else:
            logger.info(f"Old and new paths are the same, no renaming needed")
        
        return {"message": f"File renamed from '{file_rename.old_name}' to '{file_rename.new_name}' successfully"}
    except Exception as e:
        logger.error(f"Error renaming file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while renaming the file: {str(e)}")

@router.delete("/delete_folder/{folder_path:path}")
async def delete_folder(folder_path: str):
    full_path = Path(UPLOAD_DIR) / folder_path
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Folder not found")
    shutil.rmtree(full_path)
    return {"message": f"Folder '{folder_path}' deleted successfully"}

@router.get("/files/")
async def list_files(folder: Optional[str] = ""):
    base_folder = Path(UPLOAD_DIR) / folder if folder else Path(UPLOAD_DIR)
    if not base_folder.exists():
        raise HTTPException(status_code=404, detail="Folder not found")
    
    files_and_folders = []

    for item in base_folder.iterdir():
        relative_path = item.relative_to(UPLOAD_DIR)
        if item.is_file() and not item.name.endswith('.metadata'):
            stats = item.stat()
            metadata_path = item.with_suffix('.metadata')
            security_classification = "Unclassified"
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    security_classification = metadata.get("security_classification", "Unclassified")
            
            files_and_folders.append({
                "name": item.name,
                "type": get_file_type(item.name),
                "size": stats.st_size,
                "uploadDate": datetime.fromtimestamp(stats.st_mtime).isoformat(),
                "path": str(relative_path),
                "securityClassification": security_classification
            })
        elif item.is_dir():
            files_and_folders.append({
                "name": item.name,
                "type": "folder",
                "path": str(relative_path)
            })

    return files_and_folders

def get_file_type(file_name: str) -> str:
    extension = Path(file_name).suffix.lower()
    if extension == '.pdf':
        return 'PDF'
    elif extension == '.docx':
        return 'DOCX'
    elif extension == '.txt':
        return 'TXT'
    else:
        return 'Unknown'

@router.post("/upload/")
async def upload_files(file: UploadFile = File(...), folder: Optional[str] = ""):
    try:
        folder_path = Path(UPLOAD_DIR) / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        file_path = folder_path / file.filename
        content = await file.read()
        with file_path.open("wb") as buffer:
            buffer.write(content)

        return JSONResponse(content={"filename": file.filename, "status": "File uploaded successfully"}, status_code=200)
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {str(e)}")
        return JSONResponse(content={"detail": f"An unexpected error occurred: {str(e)}"}, status_code=500)

@router.delete("/files/{filename:path}")
async def delete_file(filename: str):
    try:
        file_path = Path(UPLOAD_DIR) / filename
        metadata_path = file_path.with_suffix('.metadata')
        
        logger.debug(f"Attempting to delete file: {file_path}")
        if file_path.exists():
            os.remove(file_path)
            logger.info(f"File {filename} deleted successfully")
            
            if metadata_path.exists():
                os.remove(metadata_path)
                logger.info(f"Metadata file for {filename} deleted successfully")
            
            return JSONResponse(content={"status": f"File {filename} and its metadata deleted successfully"}, status_code=200)
        else:
            logger.warning(f"File {filename} not found")
            raise HTTPException(status_code=404, detail=f"File {filename} not found")
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while deleting the file: {str(e)}")

class BulkDeleteRequest(BaseModel):
    filenames: List[str]

@router.post("/bulk-delete/")
async def bulk_delete(request: BulkDeleteRequest):
    logger.info(f"Received request to delete files: {request.filenames}")
    deleted_files = []
    for filename in request.filenames:
        file_path = Path(UPLOAD_DIR) / filename
        metadata_path = file_path.with_suffix('.metadata')
        logger.info(f"Attempting to delete file: {file_path}")
        if file_path.exists():
            try:
                os.remove(file_path)
                deleted_files.append(filename)
                logger.info(f"Successfully deleted file: {filename}")
                
                if metadata_path.exists():
                    os.remove(metadata_path)
                    logger.info(f"Successfully deleted metadata for file: {filename}")
            except Exception as e:
                logger.error(f"Error deleting file {filename}: {str(e)}")
        else:
            logger.warning(f"File not found: {filename}")
    logger.info(f"Deleted files: {deleted_files}")
    return {"deleted_files": deleted_files}

class BulkDownloadRequest(BaseModel):
    filenames: List[str]
    current_folder: str = ""

@router.post("/bulk-download/")
async def bulk_download(request: BulkDownloadRequest):
    logger.info(f"Received request to download files: {request.filenames}")
    logger.info(f"Current folder: {request.current_folder}")
    zip_filename = "downloaded_files.zip"
    s = BytesIO()
    
    try:
        with zipfile.ZipFile(s, "w") as zf:
            for filename in request.filenames:
                file_path = Path(UPLOAD_DIR) / request.current_folder / filename
                if file_path.is_file():
                    # Skip metadata files
                    if not file_path.name.endswith('.metadata'):
                        arcname = str(file_path.relative_to(UPLOAD_DIR))
                        zf.write(file_path, arcname=arcname)
                        logger.info(f"Added file to zip: {arcname}")
                elif file_path.is_dir():
                    # If it's a directory, add all its contents recursively, excluding metadata files
                    for root, _, files in os.walk(file_path):
                        for file in files:
                            if not file.endswith('.metadata'):
                                file_full_path = Path(root) / file
                                arcname = str(file_full_path.relative_to(UPLOAD_DIR))
                                zf.write(file_full_path, arcname=arcname)
                                logger.info(f"Added file to zip: {arcname}")
                else:
                    logger.warning(f"Item not found: {filename}")
        
        s.seek(0)
        return StreamingResponse(
            iter([s.getvalue()]), 
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment;filename={zip_filename}"}
        )
    except Exception as e:
        logger.error(f"Error creating zip file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating zip file: {str(e)}")

class FileMoveRequest(BaseModel):
    file_path: str
    target_folder: str

@router.post("/move-file/")
async def move_file(request: FileMoveRequest):
    source_path = Path(UPLOAD_DIR) / request.file_path
    target_path = Path(UPLOAD_DIR) / request.target_folder.lstrip('/')  # Remove leading slash
    
    logger.info(f"Moving file from {source_path} to {target_path}")
    logger.info(f"UPLOAD_DIR: {UPLOAD_DIR}")
    logger.info(f"Request file_path: {request.file_path}")
    logger.info(f"Request target_folder: {request.target_folder}")
    
    if not source_path.exists():
        logger.error(f"Source file not found: {source_path}")
        raise HTTPException(status_code=404, detail=f"Source file not found: {source_path}")
    
    if not target_path.exists():
        logger.error(f"Target folder not found: {target_path}")
        # Create the target folder if it doesn't exist
        target_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created target folder: {target_path}")
    
    new_file_path = target_path / source_path.name
    if new_file_path.exists():
        logger.error(f"File already exists in target folder: {new_file_path}")
        raise HTTPException(status_code=400, detail="A file with the same name already exists in the target folder")
    
    try:
        shutil.move(str(source_path), str(new_file_path))
        logger.info(f"File moved successfully to {new_file_path}")
        return {"message": f"File moved successfully to {request.target_folder}"}
    except Exception as e:
        logger.error(f"Error moving file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An error occurred while moving the file: {str(e)}")

@router.post("/update-security/")
async def update_security_classification(request: dict):
    filename = request.get("filename")
    new_classification = request.get("security_classification")
    if not filename or not new_classification:
        raise HTTPException(status_code=400, detail="Both filename and security_classification are required")
    
    file_path = Path(UPLOAD_DIR) / filename
    metadata_path = file_path.with_suffix('.metadata')
    
    logger.info(f"Updating security classification for file: {file_path}")
    logger.info(f"New classification: {new_classification}")
    
    if not file_path.exists():
        logger.error(f"File not found: {file_path}")
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")
    
    try:
        metadata = {}
        if metadata_path.exists():
            with open(metadata_path, 'r') as f:
                metadata = json.load(f)
        
        metadata['security_classification'] = new_classification
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f)
        
        logger.info(f"Security classification updated successfully for {filename}")
        return {"message": f"Security classification for {filename} updated to {new_classification}"}
    except Exception as e:
        logger.error(f"Error updating security classification: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating security classification: {str(e)}")

@router.get("/files/{file_path:path}")
async def get_file(file_path: str):
    full_path = Path(UPLOAD_DIR) / file_path
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(full_path)

@router.post("/delete-pdf-page/")
async def delete_pdf_page(request: dict):
    file_path = request.get("file_path")
    page_number = request.get("page_number")
    
    if not file_path or page_number is None:
        raise HTTPException(status_code=400, detail="Both file_path and page_number are required")
    
    full_path = Path(UPLOAD_DIR) / file_path
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(full_path, 'rb') as file:
            pdf = PdfFileReader(file)
            writer = PdfFileWriter()
            
            for i in range(pdf.getNumPages()):
                if i != page_number - 1:  # Page numbers start from 1, but index starts from 0
                    writer.addPage(pdf.getPage(i))
            
            with open(full_path, 'wb') as output_file:
                writer.write(output_file)
        
        return {"success": True, "message": f"Page {page_number} deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting PDF page: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting PDF page: {str(e)}")

@router.get("/preview-docx/{file_path:path}")
async def preview_docx(file_path: str):
    full_path = Path(UPLOAD_DIR) / file_path
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        doc = Document(full_path)
        html_content = "<html><body>"
        for para in doc.paragraphs:
            html_content += f"<p>{para.text}</p>"
        html_content += "</body></html>"
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error previewing DOCX: {str(e)}")

@router.get("/preview-txt/{file_path:path}")
async def preview_txt(file_path: str):
    full_path = Path(UPLOAD_DIR) / file_path
    if not full_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(full_path, 'r', encoding='utf-8') as file:
            content = file.read()
        html_content = f"<html><body><pre>{content}</pre></body></html>"
        return HTMLResponse(content=html_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error previewing TXT: {str(e)}")