from pathlib import Path
from typing import Dict, List
import PyPDF2
from docx import Document
import pdfplumber

def extract_content(file_path: Path) -> List[Dict[str, str]]:
    if file_path.suffix.lower() == '.pdf':
        return extract_from_pdf(file_path)
    elif file_path.suffix.lower() == '.docx':
        return extract_from_docx(file_path)
    elif file_path.suffix.lower() == '.txt':
        return extract_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_path.suffix}")

def extract_from_pdf(file_path: Path) -> List[Dict[str, str]]:
    content = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                sentences = text.split('.')
                content.extend([{"text": sentence.strip()} for sentence in sentences if sentence.strip()])
    return content

def extract_from_docx(file_path: Path) -> List[Dict[str, str]]:
    content = []
    doc = Document(file_path)
    for para in doc.paragraphs:
        sentences = para.text.split('.')
        content.extend([{"text": sentence.strip()} for sentence in sentences if sentence.strip()])
    return content

def extract_from_txt(file_path: Path) -> List[Dict[str, str]]:
    content = []
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
        sentences = text.split('.')
        content.extend([{"text": sentence.strip()} for sentence in sentences if sentence.strip()])
    return content