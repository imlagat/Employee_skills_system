from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Skill, EmployeeSkill, SkillsAssessment, PositionCompetency
from .serializers import SkillSerializer, EmployeeSkillSerializer, SkillsAssessmentSerializer, PositionCompetencySerializer
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'category']
    filterset_fields = ['category']

    def get_permissions(self):
        return []

class EmployeeSkillViewSet(viewsets.ModelViewSet):
    queryset = EmployeeSkill.objects.select_related('skill', 'employee').all()
    serializer_class = EmployeeSkillSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'skill', 'proficiency']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

class SkillsAssessmentViewSet(viewsets.ModelViewSet):
    queryset = SkillsAssessment.objects.select_related('employee', 'skill', 'assessor').all()
    serializer_class = SkillsAssessmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'skill']

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

    def perform_create(self, serializer):
        serializer.save(assessor=self.request.user)

class PositionCompetencyViewSet(viewsets.ModelViewSet):
    queryset = PositionCompetency.objects.select_related('position', 'skill').all()
    serializer_class = PositionCompetencySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['position', 'skill', 'is_critical']

    def get_permissions(self):
        return []


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from apps.employees.models import Employee

class SmartTeamMatcherAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_skills = request.data.get('required_skills', []) # List of dicts: [{'skill_id': 1, 'min_level': 3}, ...]
        if not required_skills:
            # Fallback to list of skill_ids
            skill_ids = request.data.get('skill_ids', [])
            required_skills = [{'skill_id': sid, 'min_level': 1} for sid in skill_ids]

        if not required_skills:
            return Response({'error': 'Please provide required_skills or skill_ids'}, status=status.HTTP_400_BAD_REQUEST)

        req_map = {item['skill_id']: item.get('min_level', 1) for item in required_skills}
        target_skill_ids = list(req_map.keys())

        employees = Employee.objects.select_related('user', 'department', 'position').prefetch_related('skills__skill').filter(is_active=True)

        matches = []
        for emp in employees:
            emp_skills = {es.skill_id: es.proficiency for es in emp.skills.all()}
            
            matched_skills = []
            missing_skills = []
            score_total = 0
            max_possible = len(target_skill_ids) * 5

            for sid, req_lvl in req_map.items():
                prof = emp_skills.get(sid, 0)
                if prof >= req_lvl:
                    score_total += prof
                    matched_skills.append({
                        'skill_id': sid,
                        'proficiency': prof,
                        'req_level': req_lvl
                    })
                else:
                    if prof > 0:
                        score_total += prof * 0.5
                    missing_skills.append({
                        'skill_id': sid,
                        'proficiency': prof,
                        'req_level': req_lvl
                    })

            match_pct = round((len(matched_skills) / len(target_skill_ids)) * 100) if target_skill_ids else 0
            weighted_pct = min(100, round((score_total / max_possible) * 100)) if max_possible > 0 else 0

            matches.append({
                'employee_id': emp.id,
                'employee_code': emp.employee_id,
                'name': emp.full_name,
                'department': emp.department.name if emp.department else 'N/A',
                'position': emp.position.name if emp.position else 'N/A',
                'match_percentage': match_pct,
                'weighted_match_pct': weighted_pct,
                'matched_count': len(matched_skills),
                'total_required': len(target_skill_ids),
                'matched_skills': matched_skills,
                'missing_skills': missing_skills
            })

        matches.sort(key=lambda x: (-x['weighted_match_pct'], -x['match_percentage']))

        return Response({
            'total_candidates': len(matches),
            'top_matches': matches[:15]
        }, status=status.HTTP_200_OK)


class SkillNetworkGraphAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.all()
        employees = Employee.objects.select_related('user', 'department').filter(is_active=True)
        emp_skills = EmployeeSkill.objects.select_related('employee__user', 'skill').all()

        nodes = []
        # Add skill nodes
        for s in skills:
            nodes.append({
                'id': f"skill-{s.id}",
                'label': s.name,
                'type': 'skill',
                'category': s.category or 'General',
                'rating': s.rating
            })

        # Add employee nodes
        for e in employees:
            nodes.append({
                'id': f"emp-{e.id}",
                'label': e.full_name,
                'type': 'employee',
                'department': e.department.name if e.department else 'Unassigned'
            })

        edges = []
        for es in emp_skills:
            edges.append({
                'source': f"emp-{es.employee_id}",
                'target': f"skill-{es.skill_id}",
                'weight': es.proficiency,
                'verification': es.verification_status,
                'confidence': es.confidence_score
            })

        return Response({
            'nodes': nodes,
            'edges': edges
        }, status=status.HTTP_200_OK)


