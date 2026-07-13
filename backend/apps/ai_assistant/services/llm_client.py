import requests
import json
from django.conf import settings

class LLMClient:
    """
    A lightweight client for the Gemini REST API using requests.
    This avoids dependencies on google-genai which may fail due to cryptography/rust issues on macOS.
    """
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        # default to gemini-2.5-flash for speed and context window
        self.model = 'gemini-2.5-flash'
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def generate(self, prompt, system_instruction=None, json_schema=None):
        if not self.api_key:
            return self._mock_response(prompt, json_schema)

        headers = {
            'Content-Type': 'application/json'
        }

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2, # Low temp for analytical tasks
            }
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        if json_schema:
            payload["generationConfig"]["responseMimeType"] = "application/json"
            payload["generationConfig"]["responseSchema"] = json_schema

        url = f"{self.base_url}?key={self.api_key}"

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            if 'candidates' in data and data['candidates']:
                return data['candidates'][0]['content']['parts'][0]['text']
            return "{}" if json_schema else "No response generated."
        except Exception as e:
            print(f"LLM API Error: {e}")
            if response is not None:
                print(f"Response: {response.text}")
            return self._mock_response(prompt, json_schema)

    def _mock_response(self, prompt, json_schema):
        """Fallback mock response if API key is missing or request fails."""
        if json_schema:
            # We'll return a generic empty JSON structure depending on the task
            if 'readiness' in str(json_schema): # Gap Analysis
                return json.dumps({
                    "readiness": 85,
                    "strengths": ["Mocked Skill 1", "Mocked Skill 2"],
                    "missing": ["Mocked Missing Skill"],
                    "recommendation": "This is a mocked recommendation because the Gemini API failed or key is missing."
                })
            elif 'extracted_skills' in str(json_schema): # Resume
                return json.dumps({
                    "extracted_skills": ["Python", "Django", "React"],
                    "extracted_certifications": [
                        {"name": "Mock Cert", "organization": "Mock Org", "issue_date": "2023-01-01", "expiry_date": "2026-01-01"}
                    ],
                    "summary": "Mocked summary of resume."
                })
            return "{}"
        return "This is a mocked response because the Gemini API failed or key is missing."
