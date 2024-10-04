import os
from pathlib import Path

os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Set environment variables for offline mode
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

# Specific paths
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
DATASET_DIR = DATA_DIR / "datasets"
OUTPUT_DIR = DATA_DIR / "outputs"
LOG_DIR = DATA_DIR / "logs"

# Model paths
BASE_MODEL_DIR = BASE_DIR / "backend" / "models" / "base_models"
FINE_TUNED_MODEL_DIR = BASE_DIR / "backend" / "models" / "fine_tuned_models"

# Ensure directories exist
for dir_path in [UPLOAD_DIR, DATASET_DIR, OUTPUT_DIR, LOG_DIR, BASE_MODEL_DIR, FINE_TUNED_MODEL_DIR]:
    dir_path.mkdir(parents=True, exist_ok=True)

# Other configuration settings
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100 MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

# Add more configuration settings as needed