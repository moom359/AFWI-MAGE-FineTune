# AFWI MAGE FineTune

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Project Architecture](#project-architecture)
4. [Requirements](#requirements)
5. [Installation](#installation)
6. [Usage](#usage)
   - [Uploading Documents](#1-uploading-documents)
   - [Reviewing and Editing Extracted Content](#2-reviewing-and-editing-extracted-content)
   - [Fine-Tuning Models](#3-fine-tuning-models)
   - [Interacting with Fine-Tuned Models](#4-interacting-with-fine-tuned-models)
7. [Project Structure](#project-structure)
8. [Air-Gapped Environment Considerations](#air-gapped-environment-considerations)
9. [Contributing](#contributing)
10. [License](#license)
11. [Acknowledgments](#acknowledgments)

## Introduction
AFWI MAGE FineTune is a containerized, web-based application designed to simplify the process of fine-tuning Local Language Models (LLMs) using custom datasets extracted from user-provided documents. The application operates entirely offline, making it suitable for deployment in air-gapped environments where internet access is restricted.

## Features
- **Document Upload and Content Extraction**:
  - Upload or drag-and-drop documents (PDF, DOCX, TXT).
  - Extract sentences and meaningful text blocks to create a dataset.
- **Review and Edit Extracted Content**:
  - View and modify extracted content within the application.
  - Ensure data quality before fine-tuning.
- **Fine-Tune Local Language Models**:
  - Select from pre-downloaded base models.
  - Customize fine-tuning parameters.
  - Monitor training progress in real-time.
- **Interact with Fine-Tuned Models**:
  - Engage with models through a chat interface.
  - Test model performance and responses.

## Project Architecture
The application consists of two main components:
- **Frontend**: Built with React.js and Material-UI (MUI) for an intuitive user interface.
- **Backend**: Developed using FastAPI, handling API requests, data processing, model training, and inference.

Both components are containerized using Docker, ensuring consistency and ease of deployment in an air-gapped environment.

## Requirements
### Hardware Requirements
- A machine capable of running Docker containers.
- Sufficient CPU, memory, and storage for model fine-tuning and inference.
- Note: GPU acceleration is recommended for faster fine-tuning but not mandatory.

### Software Requirements
- Docker: Ensure Docker Engine is installed.
- Docker Compose: For orchestrating multi-container applications.
- Tesseract OCR: Included in the Docker image for OCR capabilities.

## Installation
**Important**: Since the application is intended for air-gapped environments, all dependencies, models, and resources must be included locally.

Steps:
1. Clone the Repository:
   ```bash
   git clone https://your-repository-url.git
   cd AFWI_MAGE_FineTune
   ```

2. Copy Pre-Downloaded Models and Resources:
   - Place pre-downloaded base models into `backend/models/base_models/`.
   - Include the spaCy language model (en_core_web_sm) in `backend/`.

3. Build the Docker Images:
   - Build the backend image:
     ```bash
     docker build -t afwi_mage_backend ./backend
     ```
   - Build the frontend image:
     ```bash
     docker build -t afwi_mage_frontend ./frontend
     ```

4. Start the Application:
   - Use Docker Compose to start both containers:
     ```bash
     docker-compose up -d
     ```

5. Access the Application:
   - Open a web browser and navigate to `http://localhost:3000` (or the configured port).

## Usage
### 1. Uploading Documents
- Navigate to the Upload section.
- Drag and drop or select documents to upload.
- Supported formats: PDF, DOCX, TXT.
- Click "Extract Content" to initiate the extraction process.

### 2. Reviewing and Editing Extracted Content
- After extraction, proceed to the Review section.
- Review the extracted sentences and text blocks.
- Edit entries as needed to ensure accuracy.
- Save your changes before proceeding.

### 3. Fine-Tuning Models
- Go to the Fine-Tune section.
- Select a base model from the available list.
- Adjust fine-tuning parameters if desired.
- Click "Begin Fine-Tuning" to start the process.
- Monitor training progress through the provided logs and status indicators.

### 4. Interacting with Fine-Tuned Models
- Access the Chat section.
- Select a fine-tuned model to interact with.
- Enter your messages and receive responses from the model.
- Evaluate the model's performance based on the fine-tuning.

## Project Structure
```
AFWI_MAGE_FineTune/
├── README.md
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── models/
│   │   ├── base_models/
│   │   └── fine_tuned_models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   └── ...
├── data/
│   ├── uploads/
│   ├── datasets/
│   ├── outputs/
│   └── logs/
├── tests/
│   ├── backend/
│   └── frontend/
└── scripts/
```

- `backend/`: Contains the FastAPI backend application.
- `frontend/`: Contains the React.js frontend application.
- `data/`: Stores user data, datasets, outputs, and logs.
- `models/`: Stores base and fine-tuned models.

## Air-Gapped Environment Considerations
- **Offline Operation**: The application is designed to function without internet access.
- **Dependencies**: All necessary libraries, models, and resources are included in the Docker images.
- **No External Calls**: The application does not make external API calls or require online assets.
- **Security**: Ensure compliance with organizational policies for deploying applications in secure environments.

## Contributing
We welcome contributions to improve AFWI MAGE FineTune. To contribute:

1. Fork the Repository: Create a personal fork of the project.
2. Create a Branch: Work on your feature or bug fix in a new branch.
3. Commit Changes: Make clear and descriptive commits.
4. Push to GitHub: Push your changes to your fork.
5. Submit a Pull Request: Explain your changes and submit a pull request to the main repository.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
- OpenAI: For providing guidance on LLM integration.
- Hugging Face: For the Transformers library and model resources.
- spaCy: For natural language processing tools.
- Contributors: Thank you to all the developers who have contributed to this project.

**Disclaimer**: This application is intended for educational and internal use. Ensure compliance with all relevant laws and organizational policies when deploying and using this software.

If you have any questions or need assistance, please contact the project maintainers.