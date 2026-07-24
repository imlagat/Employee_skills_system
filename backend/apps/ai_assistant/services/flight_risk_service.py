from django.utils import timezone
from apps.employees.models import Employee
from apps.skills.models import EmployeeSkill, PositionCompetency
from apps.training.models import TrainingEnrollment
from .llm_client import LLMClient
import json

class FlightRiskService:
    def __init__(self):
        self.llm = LLMClient()

    def calculate_employee_risk(self, employee):
        now = timezone.now().date()
        tenure_days = (now - employee.hire_date).days if employee.hire_date else 365
        tenure_years = round(tenure_days / 365.25, 1)

        # Skill count and recent updates
        emp_skills = EmployeeSkill.objects.filter(employee=employee)
        skill_count = emp_skills.count()
        recent_skill_updates = emp_skills.filter(last_assessed__gte=now - timezone.timedelta(days=180)).count()

        # Training participation
        trainings_completed = TrainingEnrollment.objects.filter(employee=employee, status='completed').count()

        # Simple baseline score
        risk_score = 25 # Default low
        triggers = []

        if tenure_years > 2.0 and recent_skill_updates == 0:
            risk_score += 35
            triggers.append("No skill updates or assessments in the last 6 months despite >2 yrs tenure")

        if trainings_completed == 0 and tenure_years > 1.0:
            risk_score += 20
            triggers.append("Zero completed training programs during tenure")

        if skill_count < 3:
            risk_score += 15
            triggers.append("Low documented skill inventory (< 3 skills)")

        risk_level = "High" if risk_score >= 60 else ("Medium" if risk_score >= 35 else "Low")

        return {
            'employee_id': employee.id,
            'name': employee.full_name,
            'department': employee.department.name if employee.department else 'N/A',
            'position': employee.position.name if employee.position else 'N/A',
            'tenure_years': tenure_years,
            'skill_count': skill_count,
            'recent_skill_updates': recent_skill_updates,
            'trainings_completed': trainings_completed,
            'risk_score': min(95, risk_score),
            'risk_level': risk_level,
            'triggers': triggers
        }

    def generate_organization_risk_radar(self):
        employees = Employee.objects.select_related('user', 'department', 'position').filter(is_active=True)
        results = [self.calculate_employee_risk(emp) for emp in employees]

        high_risk = [r for r in results if r['risk_level'] == 'High']
        medium_risk = [r for r in results if r['risk_level'] == 'Medium']
        low_risk = [r for r in results if r['risk_level'] == 'Low']

        # Get AI overview and retention recommendations for high risk candidates
        summary_prompt = f"Total Employees: {len(results)}. High Risk: {len(high_risk)}, Medium Risk: {len(medium_risk)}, Low Risk: {len(low_risk)}.\n"
        summary_prompt += "High risk employees list:\n"
        for hr in high_risk[:5]:
            summary_prompt += f"- {hr['name']} ({hr['position']}, Dept: {hr['department']}): Triggers = {', '.join(hr['triggers'])}\n"

        system_instruction = (
            "You are an AI HR Retention Expert. Analyze the flight risk overview and provide 2-3 extremely short, clean, "
            "and concise retention strategies as simple bullet points (maximum 1 sentence per point). "
            "Do not include any introduction, preamble, or summary paragraphs. Start directly with the bullet points."
        )

        try:
            ai_advice = self.llm.generate(
                prompt=summary_prompt,
                system_instruction=system_instruction
            )
        except Exception:
            ai_advice = "• Conduct career development check-ins.\n• Assign cross-functional training to high-risk employees."

        return {
            'overview': {
                'total': len(results),
                'high_risk_count': len(high_risk),
                'medium_risk_count': len(medium_risk),
                'low_risk_count': len(low_risk),
            },
            'employees': results,
            'ai_retention_recommendations': ai_advice
        }
