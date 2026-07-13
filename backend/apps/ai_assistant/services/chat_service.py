import json
from .llm_client import LLMClient
from .context_builder import ContextBuilder
from .dashboard_builder import DashboardBuilder

class ChatService:
    def __init__(self):
        self.llm = LLMClient()

    def handle_query(self, user, query, is_manager=False):
        if is_manager:
            return self._handle_manager_query(query)
        else:
            return self._handle_employee_query(user, query)

    def _handle_manager_query(self, query):
        context = DashboardBuilder.get_company_summary()
        
        system_instruction = (
            "You are an AI Workforce Assistant for HR managers. "
            "Use the provided company context to answer the manager's query. "
            "If the query asks for specific names not in the context, explain that you have aggregated data. "
            "Be direct, professional, and actionable."
        )

        prompt = f"Company Context:\n{json.dumps(context, indent=2)}\n\nManager Query: {query}"
        
        schema = {
            "type": "OBJECT",
            "properties": {
                "answer": {"type": "STRING"}
            },
            "required": ["answer"]
        }

        try:
            result_str = self.llm.generate(prompt, system_instruction, schema)
            return json.loads(result_str)
        except Exception as e:
            return {"answer": "I'm sorry, I'm having trouble analyzing the workforce data right now."}

    def _handle_employee_query(self, user, query):
        # We need the employee ID. For simplicity, assume the User model has a related Employee profile
        employee = getattr(user, 'employee_profile', None)
        if not employee:
            return {"answer": "I cannot access your employee profile data."}

        context = ContextBuilder.get_employee_context(employee.id)
        
        system_instruction = (
            "You are an AI Career Coach. You only have access to THIS employee's data. "
            "Answer their questions regarding their skills, missing competencies, or training recommendations. "
            "Be encouraging but factual."
        )

        prompt = f"Employee Profile Context:\n{json.dumps(context, indent=2)}\n\nEmployee Query: {query}"
        
        schema = {
            "type": "OBJECT",
            "properties": {
                "answer": {"type": "STRING"}
            },
            "required": ["answer"]
        }

        try:
            result_str = self.llm.generate(prompt, system_instruction, schema)
            return json.loads(result_str)
        except Exception as e:
            return {"answer": "I'm sorry, I couldn't fetch your career data right now."}
