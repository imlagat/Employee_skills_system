from django.shortcuts import get_object_or_404
from apps.employees.models import Employee
from apps.skills.models import EmployeeSkill, PositionCompetency, SkillsAssessment
from apps.certifications.models import EmployeeCertification

class ContextBuilder:
    @staticmethod
    def get_employee_context(employee_id):
        """Builds a JSON-serializable dictionary of all relevant employee data."""
        employee = get_object_or_404(Employee, id=employee_id)
        
        # 1. Base Info
        data = {
            "name": employee.user.get_full_name(),
            "department": employee.department.name if employee.department else None,
            "position": employee.position.name if employee.position else None,
            "job_title": employee.job_title,
            "hire_date": str(employee.hire_date) if employee.hire_date else None,
        }

        # 2. Current Skills
        skills = EmployeeSkill.objects.filter(employee=employee)
        data["current_skills"] = [
            {"skill_name": s.skill.name, "category": s.skill.category, "proficiency": s.proficiency}
            for s in skills
        ]

        # 3. Position Requirements (if they have a position)
        if employee.position:
            reqs = PositionCompetency.objects.filter(position=employee.position)
            data["required_competencies"] = [
                {"skill_name": r.skill.name, "required_level": r.required_level, "is_critical": r.is_critical}
                for r in reqs
            ]
        else:
            data["required_competencies"] = []

        # 4. Certifications
        certs = EmployeeCertification.objects.filter(employee=employee)
        data["certifications"] = [
            {"name": c.certification.name, "status": c.verification_status, "expiration_date": str(c.expiration_date) if c.expiration_date else None}
            for c in certs
        ]

        # 5. Assessments
        assessments = SkillsAssessment.objects.filter(employee=employee).order_by('-assessed_on')[:3]
        data["recent_assessments"] = [
            {"date": str(a.assessed_on), "overall_score": a.score, "evaluator_comments": a.comments}
            for a in assessments
        ]

        return data
