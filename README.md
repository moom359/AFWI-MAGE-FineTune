# AFWI MAGE FineTune

## Table of Contents
1. [Introduction](#introduction)
2. [Current Features](#current-features)
3. [Planned Features](#planned-features)
4. [Project Architecture](#project-architecture)
5. [Requirements](#requirements)
6. [Installation](#installation)
7. [Usage](#usage)
8. [Project Structure](#project-structure)
9. [Air-Gapped Environment Considerations](#air-gapped-environment-considerations)
10. [Contributing](#contributing)
11. [License](#license)
12. [Acknowledgments](#acknowledgments)

## Introduction
AFWI MAGE FineTune is a containerized, web-based application designed to simplify the process of fine-tuning Local Language Models (LLMs) using custom datasets extracted from user-provided documents. The application is intended to operate entirely offline, making it suitable for deployment in air-gapped environments where internet access is restricted.

## Current Features
- **Document Upload and Management**:
  - Upload or drag-and-drop documents (PDF, DOCX, TXT).
  - Organize files in a folder structure.
  - Preview document contents.
- **Content Extraction**:
  - Extract paragraphs and sentences from uploaded documents.
  - Create CSV datasets from extracted content.
- **Dataset Management**:
  - View, rename, and delete extracted CSV datasets.
  - Preview contents of extracted datasets.

## Planned Features
- **Question Generation**: Implement an LLM agent to populate the "question" field in CSV files.
- **Fine-Tuning Initialization**: Create a process to initialize and manage fine-tuning of LLMs.
- **Local LLM Hosting**: Incorporate functionality to host fine-tuned LLMs locally.
- **Model Testing**: Implement a chat interface to test fine-tuned models.

## Project Architecture
The application consists of two main components:
- **Frontend**: Built with React.js and Material-UI (MUI) for an intuitive user interface.
- **Backend**: Developed using FastAPI, handling API requests, data processing, and file management.

Both components are designed to be containerized using Docker, ensuring consistency and ease of deployment in an air-gapped environment.

## Requirements
### Hardware Requirements
- A machine capable of running Docker containers.
- Sufficient CPU, memory, and storage for document processing and future model fine-tuning.

### Software Requirements
- Python 3.11 (required)
- Node.js and npm (for frontend development)
- Docker: Ensure Docker Engine is installed (for containerized deployment).
- Docker Compose: For orchestrating multi-container applications (for containerized deployment).

## Installation
**Important**: Since the application is intended for air-gapped environments, all dependencies, models, and resources must be included locally.

Steps:
1. Clone the Repository:
   ```bash
   git clone https://github.com/moom359/MAGE-Finetune
   cd AFWI_MAGE_FineTune
   ```

2. Set up the Backend:
   - Ensure you have Python 3.11 installed.
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Create a virtual environment:
     ```bash
     python -m venv venv
     ```
   - Activate the virtual environment:
     - On Windows: `venv\Scripts\activate`
     - On macOS/Linux: `source venv/bin/activate`
     - On Bash on Windows: `source venv/Scripts/activate`
     - - Install the required packages:
     ```bash
     pip install -r ../requirements.txt
     ```
     update pip
     ```bash
     python.exe -m pip install --upgrade pip
     ```

3. Set up the Frontend:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     ```
   - Install the required npm packages:
     ```bash
     npm install
     ```

4. Start the Application:
   - Start the backend server:
     ```bash
     cd backend
     uvicorn app:app --reload
     ```
   - In a new terminal, start the frontend development server:
     ```bash
     cd frontend
     npm start
     ```

5. Access the Application:
   - A web browser should open automatically every time you start the frontend server. If not, open a browser and navigate to `http://localhost:3000`.

## Usage
### 1. Uploading Documents
- Navigate to the Upload section.
- Drag and drop or select documents to upload.
- Organize documents in folders if desired.

### 2. Reviewing and Editing Extracted Content
- After extraction, proceed to the Review section.
- Review the extracted sentences and text blocks.
- Edit entries as needed to ensure accuracy.
- Save your changes before proceeding.

### 3. Managing Datasets
- View, rename, or delete extracted CSV datasets.
- Preview the contents of extracted datasets.

## Project Structure
```
AFWI_MAGE_FineTune/
├── README.md
├── Dockerfile # Not used yet
├── docker-compose.yml # Not used yet
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
│   ├── extraction/
│   ├── datasets/
│   ├── outputs/
│   └── logs/
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

**Disclaimer**: This application is intended for educational and internal use. Ensure compliance with all relevant laws and organizational policies when deploying and using this software.

If you have any questions or need assistance, please contact the project maintainers.