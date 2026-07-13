import PyPDF2
from .llm_client import LLMClient
import json

class DocumentExtractor:
    def __init__(self):
        self.llm = LLMClient()

    def extract_from_pdf(self, file_obj):
        """Extract raw text from a PDF file."""
        try:
            reader = PyPDF2.PdfReader(file_obj)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"PDF Extraction Error: {e}")
            return ""

    def process_document(self, file_obj):
        """Process a PDF and return structured JSON of skills and certifications."""
        text = self.extract_from_pdf(file_obj)
        
        if not text.strip():
            return {"error": "Could not extract text from document."}

        system_instruction = (
            "You are an AI HR Assistant. Extract skills and certifications from the provided resume/CV text. "
            "Return only the structured JSON data as requested by the schema."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "extracted_skills": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": "List of professional skills found in the document."
                },
                "extracted_certifications": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "organization": {"type": "STRING", "description": "Issuing organization"},
                            "issue_date": {"type": "STRING", "description": "YYYY-MM-DD format if available"},
                            "expiry_date": {"type": "STRING", "description": "YYYY-MM-DD format if available"}
                        },
                        "required": ["name", "organization"]
                    }
                },
                "summary": {
                    "type": "STRING",
                    "description": "A 1-2 sentence summary of the candidate's professional profile."
                }
            },
            "required": ["extracted_skills", "extracted_certifications", "summary"]
        }

        try:
            result_str = self.llm.generate(
                prompt=f"Extract data from the following resume:\n\n{text[:10000]}", 
                system_instruction=system_instruction,
                json_schema=schema
            )
            return json.loads(result_str)
        except Exception as e:
            print(f"LLM Parsing Error: {e}")
            return {"error": "Failed to structure document data."}
