from pathlib import Path
from typing import List
from PyPDF4 import PdfFileReader
from docx import Document
import pdfplumber
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_content(file_path: Path) -> List[str]:
    if file_path.suffix.lower() == '.pdf':
        return extract_from_pdf(file_path)
    elif file_path.suffix.lower() == '.docx':
        return extract_from_docx(file_path)
    elif file_path.suffix.lower() == '.txt':
        return extract_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_path.suffix}")

def extract_from_pdf(file_path: Path) -> List[str]:
    sentences = []
    try:
        with open(file_path, 'rb') as file:
            reader = PdfFileReader(file)
            for page in range(reader.getNumPages()):
                text = reader.getPage(page).extractText()
                if text:
                    # Split text into sentences
                    page_sentences = [s.strip() for s in text.split('.') if s.strip()]
                    sentences.extend(page_sentences)
        
        if not sentences:
            # If PyPDF4 fails to extract text, try pdfplumber as a fallback
            logger.info(f"PyPDF4 failed to extract text from {file_path}. Trying pdfplumber.")
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        page_sentences = [s.strip() for s in text.split('.') if s.strip()]
                        sentences.extend(page_sentences)

        if not sentences:
            logger.warning(f"Both PyPDF4 and pdfplumber failed to extract text from {file_path}")
            return ["[PDF text extraction failed. This PDF might be scanned or have content that's not easily extractable.]"]

    except Exception as e:
        logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
        return [f"[Error extracting text from PDF: {str(e)}]"]

    return sentences

def extract_from_docx(file_path: Path) -> List[str]:
    sentences = []
    try:
        doc = Document(file_path)
        for para in doc.paragraphs:
            sentences.extend([sentence.strip() for sentence in para.text.split('.') if sentence.strip()])
    except Exception as e:
        logger.error(f"Error extracting text from DOCX {file_path}: {str(e)}")
        return [f"[Error extracting text from DOCX: {str(e)}]"]
    return sentences

def extract_from_txt(file_path: Path) -> List[str]:
    sentences = []
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
            sentences.extend([sentence.strip() for sentence in text.split('.') if sentence.strip()])
    except Exception as e:
        logger.error(f"Error extracting text from TXT {file_path}: {str(e)}")
        return [f"[Error extracting text from TXT: {str(e)}]"]
    return sentences