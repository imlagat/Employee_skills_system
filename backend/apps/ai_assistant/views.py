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
