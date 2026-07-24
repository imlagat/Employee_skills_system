from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import TrainingProgram, TrainingEnrollment
from .serializers import TrainingProgramSerializer, TrainingEnrollmentSerializer
from apps.accounts.permissions import IsManagerUser, IsOwnerOrManager

class TrainingProgramViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']

    def get_permissions(self):
        return []

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return TrainingProgram.objects.none()
            
        # Admin / Manager / HR sees everything (both archived and active)
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return TrainingProgram.objects.all()
            
        # Standard employees only see active, tailored or general programs
        from django.db.models import Q
        qs = TrainingProgram.objects.filter(is_archived=False)
        if hasattr(user, 'employee_profile') and user.employee_profile.department_id:
            qs = qs.filter(
                Q(department__isnull=True) | Q(department_id=user.employee_profile.department_id)
            )
        else:
            qs = qs.filter(department__isnull=True)
        return qs

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        program = self.get_object()
        program.is_archived = True
        program.save()
        return Response({'status': 'archived', 'is_archived': True})

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        program = self.get_object()
        program.is_archived = False
        program.save()
        return Response({'status': 'unarchived', 'is_archived': False})

    @action(detail=True, methods=['post'])
    def enroll(self, request, pk=None):
        if getattr(request.user, 'role', '') == 'admin':
            return Response({'error': "Admins can't enroll in training programs"}, status=status.HTTP_403_FORBIDDEN)
            
        program = self.get_object()
        employee_id = request.data.get('employee_id')
        if not employee_id:
            # If no employee_id provided, default to the current user's employee profile
            if hasattr(request.user, 'employee_profile'):
                employee_id = request.user.employee_profile.id
            else:
                return Response({'error': 'No employee_id provided and user has no employee profile'}, status=status.HTTP_400_BAD_REQUEST)
                
        enrollment, created = TrainingEnrollment.objects.get_or_create(
            program=program,
            employee_id=employee_id,
            defaults={'status': TrainingEnrollment.Status.PENDING_APPROVAL}
        )
        serializer = TrainingEnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class TrainingEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingEnrollment.objects.select_related('program', 'employee').all()
    serializer_class = TrainingEnrollmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'program', 'status']

    def get_permissions(self):
        return []

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_authenticated:
            return qs.none()
        if getattr(user, 'role', '') in ['admin', 'manager', 'hr']:
            return qs
        return qs.filter(employee__user=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = 'enrolled'
        enrollment.save()
        return Response({'status': 'enrolled'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        enrollment = self.get_object()
        enrollment.status = 'cancelled'
        enrollment.save()
        return Response({'status': 'cancelled'})


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
import json
from datetime import date, timedelta
from apps.skills.models import Skill, EmployeeSkill, PositionCompetency, SkillsAssessment
from apps.ai_assistant.services.llm_client import LLMClient

class TrainingRecommendationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            employee = request.user.employee_profile
        except AttributeError:
            return Response({"error": "User has no employee profile"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Calculate competency gaps
        gaps = []
        if employee.position:
            reqs = PositionCompetency.objects.filter(position=employee.position).select_related('skill')
            for r in reqs:
                try:
                    es = EmployeeSkill.objects.get(employee=employee, skill=r.skill)
                    current_level = es.proficiency
                except EmployeeSkill.DoesNotExist:
                    current_level = 0
                if current_level < r.required_level:
                    gaps.append({
                        "skill_id": r.skill.id,
                        "skill_name": r.skill.name,
                        "required_level": r.required_level,
                        "current_level": current_level,
                        "gap": r.required_level - current_level
                    })

        # Check low-score assessments (< 70)
        recent_low_assessments = SkillsAssessment.objects.filter(employee=employee, score__lt=70).select_related('skill')
        for a in recent_low_assessments:
            if not any(g['skill_name'] == a.skill.name for g in gaps):
                gaps.append({
                    "skill_id": a.skill.id,
                    "skill_name": a.skill.name,
                    "required_level": 3,
                    "current_level": 1,
                    "gap": 2
                })

        # Default fallbacks if no gaps exist
        if not gaps:
            if employee.department:
                dept_name = employee.department.name.lower()
                if "engineer" in dept_name or "tech" in dept_name or "it" in dept_name:
                    skills_to_suggest = ["Python", "React", "Django", "AWS", "SQL"]
                elif "sales" in dept_name or "market" in dept_name:
                    skills_to_suggest = ["Communication", "Negotiation", "Sales Strategy"]
                else:
                    skills_to_suggest = ["Project Management", "Communication", "Time Management"]
            else:
                skills_to_suggest = ["Project Management", "Communication"]
            
            for s_name in skills_to_suggest:
                try:
                    sk = Skill.objects.get(name__iexact=s_name)
                    gaps.append({
                        "skill_id": sk.id,
                        "skill_name": sk.name,
                        "required_level": 3,
                        "current_level": 0,
                        "gap": 3
                    })
                except Skill.DoesNotExist:
                    pass

        # 2. Query internal training programs matching gap skills
        gap_skill_ids = [g['skill_id'] for g in gaps]
        internal_programs = TrainingProgram.objects.filter(
            target_skills__id__in=gap_skill_ids,
            is_archived=False
        ).distinct()
        
        internal_data = TrainingProgramSerializer(internal_programs, many=True).data

        # 3. Use Gemini AI to recommend web courses for gap skills
        llm = LLMClient()
        gap_skill_names = [g['skill_name'] for g in gaps]
        
        prompt = f"""
        You are an expert training course web crawler.
        Find or generate 3-4 highly realistic online training courses available on platforms like Coursera, Udemy, or edX for the following skills:
        {", ".join(gap_skill_names)}
        
        For each course, provide:
        - title: Name of the course
        - description: 1-2 sentence description of the course content
        - platform: Platform hosting the course (e.g. Coursera, Udemy, edX)
        - target_skills: List of skills from the input list this course teaches
        - url: A mock or real URL to the course (e.g. 'https://www.coursera.org/learn/python')
        """
        
        schema = {
            "type": "OBJECT",
            "properties": {
                "courses": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "title": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "platform": {"type": "STRING"},
                            "target_skills": {"type": "ARRAY", "items": {"type": "STRING"}},
                            "url": {"type": "STRING"}
                        },
                        "required": ["title", "description", "platform", "target_skills", "url"]
                    }
                }
            },
            "required": ["courses"]
        }
        
        scraped_courses = []
        try:
            res_str = llm.generate(prompt, json_schema=schema)
            scraped_data = json.loads(res_str)
            scraped_courses = scraped_data.get('courses', [])
        except Exception as e:
            print("Gemini Crawler Error:", e)
            scraped_courses = [
                {
                    "title": f"Complete Guide to {gap_skill_names[0] if gap_skill_names else 'Software Engineering'}",
                    "description": "Learn key concepts and hands-on practices to excel in this skill.",
                    "platform": "Coursera",
                    "target_skills": [gap_skill_names[0]] if gap_skill_names else [],
                    "url": "https://www.coursera.org/"
                }
            ]

        return Response({
            "gaps": gaps,
            "department": employee.department.name if employee.department else None,
            "internal_recommendations": internal_data,
            "scraped_courses": scraped_courses
        }, status=status.HTTP_200_OK)


class ImportScrapedTrainingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            employee = request.user.employee_profile
        except AttributeError:
            return Response({"error": "User has no employee profile"}, status=status.HTTP_400_BAD_REQUEST)

        title = request.data.get('title')
        description = request.data.get('description', '')
        platform = request.data.get('platform', 'Web')
        target_skills_names = request.data.get('target_skills', [])

        if not title:
            return Response({"error": "Course title is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create or get TrainingProgram
        program, created = TrainingProgram.objects.get_or_create(
            title=title,
            defaults={
                "description": description,
                "location": f"Online ({platform})",
                "start_date": date.today(),
                "end_date": date.today() + timedelta(days=90),
                "capacity": 0,
                "is_mandatory": False
            }
        )

        # Map skills
        for s_name in target_skills_names:
            skill, _ = Skill.objects.get_or_create(
                name=s_name.strip(),
                defaults={"category": "Technical Skills", "rating": 3}
            )
            program.target_skills.add(skill)

        # Enroll employee
        enrollment, enc_created = TrainingEnrollment.objects.get_or_create(
            program=program,
            employee=employee,
            defaults={"status": TrainingEnrollment.Status.ENROLLED} # Auto-approve scraped web courses
        )
        if not enc_created:
            enrollment.status = TrainingEnrollment.Status.ENROLLED
            enrollment.save()

        return Response({
            "message": "Successfully imported and enrolled in course!",
            "program_id": program.id,
            "enrollment_id": enrollment.id
        }, status=status.HTTP_201_CREATED)

