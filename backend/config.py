import os
from pathlib import Path

# Set environment variables for offline mode
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# Specific paths
DATASET_DIR = DATA_DIR / "datasets"
EXTRACTION_DIR = DATA_DIR / "extraction"
UPLOAD_DIR = DATA_DIR / "uploads"
OUTPUT_DIR = DATA_DIR / "outputs"
LOG_DIR = DATA_DIR / "logs"

# Ensure directories exist
for dir_path in [UPLOAD_DIR, DATASET_DIR, EXTRACTION_DIR, OUTPUT_DIR, LOG_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Other configuration settings
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

print(f"DATASET_DIR: {DATASET_DIR}")  # Add this line for debugging
print(f"EXTRACTION_DIR: {EXTRACTION_DIR}")  # Add this line for debugging

print(f"UPLOAD_DIR: {UPLOAD_DIR}")
print(f"OUTPUT_DIR: {OUTPUT_DIR}")
print(f"LOG_DIR: {LOG_DIR}")

for dir_path in [UPLOAD_DIR, DATASET_DIR, EXTRACTION_DIR, OUTPUT_DIR, LOG_DIR]:
    print(f"{dir_path} exists: {dir_path.exists()}")
    if dir_path.exists():
        print(f"Contents of {dir_path}: {os.listdir(dir_path)}")

# Add this line to the file
BASE_MODELS_DIR = BASE_DIR / "models" / "base_models"
BASE_MODELS_DIR.mkdir(parents=True, exist_ok=True)  # Create the directory if it doesn't exist

print(f"BASE_MODELS_DIR: {BASE_MODELS_DIR}")
print(f"BASE_MODELS_DIR exists: {BASE_MODELS_DIR.exists()}")
if BASE_MODELS_DIR.exists():
    print(f"Contents of BASE_MODELS_DIR: {list(BASE_MODELS_DIR.glob('*'))}")
else:
    print("BASE_MODELS_DIR does not exist")