import pdfplumber
from pathlib import Path

def extract_text_from_pdf(pdf_path: str) -> str:
    text_content = []
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    text_content.append(f"[Page {page_num}]\n{text}")
        
        return "\n\n".join(text_content)
    
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""