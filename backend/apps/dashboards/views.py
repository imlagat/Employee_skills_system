from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, F
from apps.employees.models import Employee, Department
from apps.skills.models import Skill, EmployeeSkill
from apps.certifications.models import Certification, EmployeeCertification

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_employees = Employee.objects.count()
        total_departments = Department.objects.count()
        total_skills = Skill.objects.count()
        total_certs = EmployeeCertification.objects.count()

        return Response({
            'total_employees': total_employees,
            'total_departments': total_departments,
            'total_skills': total_skills,
            'total_certifications': total_certs,
        })

class SkillGapsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Aggregate proficiency levels across all skills
        stats = EmployeeSkill.objects.values('skill__name').annotate(
            avg_proficiency=Avg('proficiency'),
            employee_count=Count('employee')
        ).order_by('-avg_proficiency')[:10]
        return Response(stats)

class CertStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Could group by active vs expired, etc. For simplicity, return count per cert
        stats = EmployeeCertification.objects.values('certification__name').annotate(
            count=Count('id')
        ).order_by('-count')
        return Response(stats)

