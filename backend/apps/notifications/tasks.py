from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from apps.certifications.models import EmployeeCertification
from apps.training.models import TrainingProgram, TrainingEnrollment
from .models import Notification


@shared_task
def check_expiring_certifications():
    """
    Runs daily. Checks for certifications expiring exactly in 30, 20, 10 days,
    or within 5 days (each day), and sends an email with tailored training programs.
    """
    from apps.employees.models import Position, Employee
    from apps.skills.models import PositionCompetency
    from apps.training.models import TrainingProgram

    today = date.today()
    
    # Fetch all active employee certifications that have an expiry date and are not yet expired
    expiring = EmployeeCertification.objects.filter(
        expiry_date__isnull=False,
        expiry_date__gte=today,
    ).select_related('employee__user', 'employee__department', 'certification')

    admins = Employee.objects.filter(user__role='admin', is_active=True)

    created = 0
    for cert in expiring:
        days_remaining = (cert.expiry_date - today).days
        
        # Check if today is one of the notification milestones
        milestones = [30, 20, 10, 5, 4, 3, 2, 1]
        if days_remaining not in milestones:
            continue

        message = (
            f'Your certification "{cert.certification.name}" is expiring in '
            f'{days_remaining} days on {cert.expiry_date.isoformat()}. Please renew it soon.'
        )
        
        # Avoid duplicate notifications for the same day/milestone
        already_notified = Notification.objects.filter(
            employee=cert.employee,
            notif_type=Notification.NotifType.CERT_EXPIRY,
            related_object_id=cert.id,
            message=message,
        ).exists()
        if already_notified:
            continue

        # Get tailored training programs for the employee's department
        tailored_trainings = []
        if cert.employee.department:
            # Find skills required by positions in this department
            positions = Position.objects.filter(department=cert.employee.department)
            dept_skills = PositionCompetency.objects.filter(position__in=positions).values_list('skill_id', flat=True)
            
            # Find future trainings targeting any of these skills
            tailored_trainings = TrainingProgram.objects.filter(
                start_date__gte=today,
                target_skills__in=dept_skills
            ).distinct()[:3]

        training_text = ""
        if tailored_trainings:
            training_text = "\n\nHere are some upcoming training programs tailored to your department:\n"
            for t in tailored_trainings:
                loc = t.location if t.location else "Online"
                training_text += f"- {t.title} (Starts {t.start_date.isoformat()}, {loc})\n"

        full_message = message + training_text

        Notification.objects.create(
            employee=cert.employee,
            notif_type=Notification.NotifType.CERT_EXPIRY,
            message=full_message,
            related_object_id=cert.id,
        )
        _send_email_safely(cert.employee.user.email, 'Certification Expiring Soon', full_message)
        
        # Also notify admins
        for admin_emp in admins:
            if admin_emp != cert.employee:
                admin_msg = f"{cert.employee.full_name}'s certification '{cert.certification.name}' is expiring in {days_remaining} days."
                Notification.objects.create(
                    employee=admin_emp,
                    notif_type=Notification.NotifType.CERT_EXPIRY,
                    message=admin_msg,
                    related_object_id=cert.id,
                )
                
        created += 1

    return f'{created} expiry notifications created'


@shared_task
def check_overdue_mandatory_training():
    """
    Runs daily/weekly. Flags employees who have not enrolled/completed
    mandatory training programs that have already started.
    """
    from apps.employees.models import Employee

    today = date.today()
    mandatory_programs = TrainingProgram.objects.filter(
        is_mandatory=True, start_date__lte=today
    )

    created = 0
    for program in mandatory_programs:
        enrolled_ids = TrainingEnrollment.objects.filter(
            program=program,
            status__in=[TrainingEnrollment.Status.ENROLLED, TrainingEnrollment.Status.COMPLETED],
        ).values_list('employee_id', flat=True)

        missing_employees = Employee.objects.filter(is_active=True).exclude(id__in=enrolled_ids)

        for employee in missing_employees:
            already_notified = Notification.objects.filter(
                employee=employee,
                notif_type=Notification.NotifType.TRAINING_REQUIRED,
                related_object_id=program.id,
            ).exists()
            if already_notified:
                continue

            message = f'You are required to complete training: "{program.title}".'
            Notification.objects.create(
                employee=employee,
                notif_type=Notification.NotifType.TRAINING_REQUIRED,
                message=message,
                related_object_id=program.id,
            )
            _send_email_safely(employee.user.email, 'Mandatory Training Required', message)
            created += 1

    return f'{created} training-required notifications created'


def _send_email_safely(to_email, subject, message):
    if not to_email:
        return
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [to_email], fail_silently=True)
    except Exception:
        pass
