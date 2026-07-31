import os
import uuid
import shutil
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile, subfolder: str = "images") -> str:
        target_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        
        file_extension = os.path.splitext(upload_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(target_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
            
        # Return static access URL path
        return f"/static/{subfolder}/{unique_filename}"

    @staticmethod
    def save_bytes(data_bytes: bytes, filename: str, subfolder: str = "annotated") -> str:
        target_dir = os.path.join(settings.UPLOAD_DIR, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        
        file_path = os.path.join(target_dir, filename)
        with open(file_path, "wb") as f:
            f.write(data_bytes)
            
        return f"/static/{subfolder}/{filename}"
