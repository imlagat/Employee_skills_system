import json
from apps.employees.models import Employee
from apps.skills.models import EmployeeSkill
from apps.certifications.models import EmployeeCertification
from .llm_client import LLMClient

class DashboardBuilder:
    @staticmethod
    def get_company_summary():
        total_employees = Employee.objects.count()
        
        # High level gap metric mock (in a real scenario we'd aggregate scores, but we'll feed raw counts to LLM)
        total_skills_logged = EmployeeSkill.objects.count()
        expiring_certs = EmployeeCertification.objects.filter(verification_status='pending').count()
        
        data = {
            "total_employees": total_employees,
            "total_skills_logged": total_skills_logged,
            "pending_certifications": expiring_certs,
        }
        return data

class DashboardAIService:
    def __init__(self):
        self.llm = LLMClient()

    def generate_executive_summary(self):
        context = DashboardBuilder.get_company_summary()
        
        system_instruction = (
            "You are an expert HR Executive Assistant. "
            "Given the high-level metrics of the organization, write a compelling, extremely short 1-2 sentence executive summary. "
            "Keep it highly clean, professional, and direct."
        )

        prompt = f"""
        Company Metrics:
        {json.dumps(context, indent=2)}
        
        Generate the executive summary.
        """

        schema = {
            "type": "OBJECT",
            "properties": {
                "summary": {"type": "STRING"}
            },
            "required": ["summary"]
        }

        try:
            result_str = self.llm.generate(prompt, system_instruction, schema)
            return json.loads(result_str)
        except Exception as e:
            print(f"Dashboard AI Error: {e}")
            return {"summary": "Unable to generate executive summary at this time."}
