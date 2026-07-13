import json
from .llm_client import LLMClient
from .context_builder import ContextBuilder

class AIAnalysisService:
    def __init__(self):
        self.llm = LLMClient()

    def generate_gap_analysis(self, employee_id):
        context = ContextBuilder.get_employee_context(employee_id)
        
        system_instruction = (
            "You are an expert Enterprise HR Analyst. "
            "Analyze the employee's current skills against their position required competencies. "
            "Be objective. Do not invent data. If no requirements exist, state that readiness is 100%."
        )

        prompt = f"""
        Employee Data:
        {json.dumps(context, indent=2)}
        
        Task: 
        1. Identify missing skills (where current_level < required_level, or skill is completely missing).
        2. Identify strengths (where current_level >= required_level).
        3. Calculate a readiness percentage (0-100) based on how many required competencies are met.
        4. Write a concise 2-sentence recommendation for their next learning step.
        """

        schema = {
            "type": "OBJECT",
            "properties": {
                "readiness": {"type": "INTEGER", "description": "0 to 100 score"},
                "strengths": {"type": "ARRAY", "items": {"type": "STRING"}},
                "missing": {"type": "ARRAY", "items": {"type": "STRING"}},
                "recommendation": {"type": "STRING"}
            },
            "required": ["readiness", "strengths", "missing", "recommendation"]
        }

        try:
            result_str = self.llm.generate(prompt, system_instruction, schema)
            return json.loads(result_str)
        except Exception as e:
            print(f"Gap Analysis Error: {e}")
            return {"error": "Failed to generate gap analysis"}

    def generate_promotion_readiness(self, employee_id):
        context = ContextBuilder.get_employee_context(employee_id)
        
        system_instruction = (
            "You are an expert Enterprise HR Career Coach. "
            "Evaluate an employee's readiness for promotion based on their skills, certifications, and recent assessments. "
            "Provide a score and a clear, objective reason."
        )

        prompt = f"""
        Employee Data:
        {json.dumps(context, indent=2)}
        
        Task:
        1. Evaluate the employee's overall profile.
        2. Assign a promotion_score (0-100).
        3. Provide a 2-sentence reason.
        4. Suggest the recommended_next_step (e.g. 'Leadership Training', 'Obtain AWS Cert').
        """

        schema = {
            "type": "OBJECT",
            "properties": {
                "promotion_score": {"type": "INTEGER", "description": "0 to 100 score"},
                "reason": {"type": "STRING"},
                "recommended_next_step": {"type": "STRING"}
            },
            "required": ["promotion_score", "reason", "recommended_next_step"]
        }

        try:
            result_str = self.llm.generate(prompt, system_instruction, schema)
            return json.loads(result_str)
        except Exception as e:
            print(f"Promotion Readiness Error: {e}")
            return {"error": "Failed to generate promotion readiness"}
