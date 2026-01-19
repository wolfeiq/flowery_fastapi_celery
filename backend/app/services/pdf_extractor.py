from venv import logger
import pdfplumber
from io import BytesIO

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text_content = []
    
    try:
        pdf_file = BytesIO(pdf_bytes)
        
        with pdfplumber.open(pdf_file) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    text_content.append(f"[Page {page_num}]\n{text}")
        
        return "\n\n".join(text_content)
    
    except Exception as e:
        logger.info(f"PDF extraction error: {e}")
        return ""