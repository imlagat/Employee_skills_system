from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services.extractor import DocumentExtractor
from .services.prompt_manager import AIAnalysisService
from .services.dashboard_builder import DashboardAIService

class DocumentExtractView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded. Please provide a 'file' in the form data."}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        
        if not file_obj.name.lower().endswith('.pdf'):
            return Response({"error": "Only PDF files are supported."}, status=status.HTTP_400_BAD_REQUEST)
        
        extractor = DocumentExtractor()
        data = extractor.process_document(file_obj)
        
        if "error" in data:
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response(data, status=status.HTTP_200_OK)

class GapAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        # Additional logic could ensure user is manager or the employee themselves
        service = AIAnalysisService()
        data = service.generate_gap_analysis(employee_id)
        if "error" in data:
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(data, status=status.HTTP_200_OK)

class PromotionReadinessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        # Additional logic could ensure user is manager or the employee themselves
        service = AIAnalysisService()
        data = service.generate_promotion_readiness(employee_id)
        if "error" in data:
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(data, status=status.HTTP_200_OK)

class DashboardInsightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = DashboardAIService()
        data = service.generate_executive_summary()
        return Response(data, status=status.HTTP_200_OK)

from .services.chat_service import ChatService
from .services.flight_risk_service import FlightRiskService
from apps.skills.models import Skill, EmployeeSkill

class AIChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get('query')
        if not query:
            return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        is_manager = request.user.role in ['manager', 'admin', 'hr']
        service = ChatService()
        data = service.handle_query(request.user, query, is_manager)
        
        return Response(data, status=status.HTTP_200_OK)


class FlightRiskAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = FlightRiskService()
        data = service.generate_organization_risk_radar()
        return Response(data, status=status.HTTP_200_OK)


class ResumeParseAndApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        file_obj = request.FILES['file']
        auto_apply = request.data.get('auto_apply', 'false').lower() in ['true', '1']

        extractor = DocumentExtractor()
        extracted = extractor.process_document(file_obj)

        if "error" in extracted:
            return Response(extracted, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if auto_apply and hasattr(request.user, 'employee_profile'):
            emp = request.user.employee_profile
            skills_added = []
            for skill_name in extracted.get('extracted_skills', []):
                skill, _ = Skill.objects.get_or_create(
                    name=skill_name.strip(),
                    defaults={'category': 'Technical Skills', 'rating': 3}
                )
                es, created = EmployeeSkill.objects.get_or_create(
                    employee=emp,
                    skill=skill,
                    defaults={
                        'proficiency': 3,
                        'verification_status': EmployeeSkill.VerificationStatus.AI_VALIDATED,
                        'confidence_score': 90
                    }
                )
                skills_added.append(skill.name)
            extracted['auto_applied'] = True
            extracted['skills_added'] = skills_added

        return Response(extracted, status=status.HTTP_200_OK)

