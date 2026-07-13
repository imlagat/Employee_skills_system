from datetime import date, timedelta

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from apps.certifications.models import EmployeeCertification
from apps.training.models import TrainingProgram, TrainingEnrollment
from .models import Notification


@shared_task
def check_expiring_certifications(days_ahead=30):
    """
    Runs daily. Flags certifications expiring within `days_ahead` days
    (and not already flagged) and creates a Notification + email.
    """
    today = date.today()
    threshold = today + timedelta(days=days_ahead)

    expiring = EmployeeCertification.objects.filter(
        expiry_date__isnull=False,
        expiry_date__gte=today,
        expiry_date__lte=threshold,
    ).select_related('employee__user', 'certification')

    from apps.employees.models import Employee
    admins = Employee.objects.filter(user__role='admin', is_active=True)

    created = 0
    for cert in expiring:
        already_notified = Notification.objects.filter(
            employee=cert.employee,
            notif_type=Notification.NotifType.CERT_EXPIRY,
            related_object_id=cert.id,
        ).exists()
        if already_notified:
            continue

        message = (
            f'Your certification "{cert.certification.name}" expires on '
            f'{cert.expiry_date.isoformat()}. Please renew it soon.'
        )
        Notification.objects.create(
            employee=cert.employee,
            notif_type=Notification.NotifType.CERT_EXPIRY,
            message=message,
            related_object_id=cert.id,
        )
        _send_email_safely(cert.employee.user.email, 'Certification Expiring Soon', message)
        
        for admin_emp in admins:
            if admin_emp != cert.employee:
                admin_msg = f"{cert.employee.full_name}'s certification '{cert.certification.name}' expires on {cert.expiry_date.isoformat()}."
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
