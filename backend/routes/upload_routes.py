from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Path
from fastapi.responses import JSONResponse, StreamingResponse
from pathlib import Path
from backend.config import UPLOAD_DIR, ALLOWED_EXTENSIONS
from backend.utils.validators import validate_file_extension
import os
import shutil
from typing import List, Optional
import logging
from pydantic import BaseModel
import zipfile
from io import BytesIO

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
    folder: Optional[str] = ""

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
    old_path = Path(UPLOAD_DIR) / file_rename.folder / file_rename.old_name
    new_path = Path(UPLOAD_DIR) / file_rename.folder / file_rename.new_name
    if not old_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    if new_path.exists():
        raise HTTPException(status_code=400, detail="New file name already exists")
    old_path.rename(new_path)
    return {"message": f"File renamed from '{file_rename.old_name}' to '{file_rename.new_name}' successfully"}

@router.delete("/delete_folder/{folder_path:path}")
async def delete_folder(folder_path: str):
    full_path = Path(UPLOAD_DIR) / folder_path
    if not full_path.exists():
        raise HTTPException(status_code=404, detail="Folder not found")
    shutil.rmtree(full_path)
    return {"message": f"Folder '{folder_path}' deleted successfully"}

@router.get("/files/")
async def list_files(folder: Optional[str] = ""):
    folder_path = Path(UPLOAD_DIR) / folder if folder else Path(UPLOAD_DIR)
    if not folder_path.exists():
        raise HTTPException(status_code=404, detail="Folder not found")
    
    files_and_folders = []
    for item in folder_path.iterdir():
        if item.is_file():
            stats = item.stat()
            files_and_folders.append({
                "name": item.name,
                "type": item.suffix.lower()[1:] if item.suffix else "unknown",  # Get file extension without the dot
                "size": stats.st_size,
                "uploadDate": stats.st_mtime,
                "path": str(item.relative_to(UPLOAD_DIR))
            })
        elif item.is_dir():
            files_and_folders.append({
                "name": item.name,
                "type": "folder",
                "path": str(item.relative_to(UPLOAD_DIR))
            })
    
    return files_and_folders

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

@router.delete("/files/{filename}")
async def delete_file(filename: str):
    try:
        file_path = Path(UPLOAD_DIR) / filename
        logger.debug(f"Attempting to delete file: {file_path}")
        if file_path.exists():
            os.remove(file_path)
            logger.info(f"File {filename} deleted successfully")
            return JSONResponse(content={"status": f"File {filename} deleted successfully"}, status_code=200)
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
        logger.info(f"Attempting to delete file: {file_path}")
        if file_path.exists():
            try:
                os.remove(file_path)
                deleted_files.append(filename)
                logger.info(f"Successfully deleted file: {filename}")
            except Exception as e:
                logger.error(f"Error deleting file {filename}: {str(e)}")
        else:
            logger.warning(f"File not found: {filename}")
    logger.info(f"Deleted files: {deleted_files}")
    return {"deleted_files": deleted_files}

class BulkDownloadRequest(BaseModel):
    filenames: List[str]

@router.post("/bulk-download/")
async def bulk_download(request: BulkDownloadRequest):
    logger.info(f"Received request to download files: {request.filenames}")
    zip_filename = "downloaded_files.zip"
    s = BytesIO()
    
    try:
        with zipfile.ZipFile(s, "w") as zf:
            for filename in request.filenames:
                file_path = Path(UPLOAD_DIR) / filename
                if file_path.exists():
                    zf.write(file_path, filename)
                else:
                    logger.warning(f"File not found: {filename}")
        
        s.seek(0)
        return StreamingResponse(
            iter([s.getvalue()]), 
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment;filename={zip_filename}"}
        )
    except Exception as e:
        logger.error(f"Error creating zip file: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating zip file")

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