import requests
from django.conf import settings
from django.core.mail import send_mail

from decouple import config

def send_system_email(subject, message, recipient_list, html_message=None):
    """
    Unified email dispatch helper.
    Attempts sending via Resend HTTPS API first (Port 443 - Never blocked on Vercel/Cloud),
    and falls back to standard Django send_mail if Resend is unavailable.
    """
    resend_key = getattr(settings, 'RESEND_API_KEY', '') or config('RESEND_API_KEY', default='')
    
    if resend_key:
        headers = {
            'Authorization': f'Bearer {resend_key}',
            'Content-Type': 'application/json'
        }
        
        # Prepare HTML body
        html_body = html_message or f"<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>{message.replace('\n', '<br>')}</div>"
        
        payload = {
            'from': 'SkillMatrix <onboarding@resend.dev>',
            'to': recipient_list if isinstance(recipient_list, list) else [recipient_list],
            'subject': subject,
            'text': message,
            'html': html_body
        }
        
        try:
            response = requests.post('https://api.resend.com/emails', headers=headers, json=payload, timeout=8)
            if response.status_code in [200, 201]:
                print(f"[RESEND EMAIL SUCCESS] Sent '{subject}' to {recipient_list} via Resend HTTPS API. ID: {response.json().get('id')}")
                return True
            else:
                print(f"[RESEND API NOTICE] Resend response code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[RESEND API ERROR] Could not reach Resend HTTPS API ({e}). Falling back to Django SMTP...")

    # Fallback to standard Django mail
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'superposlish@gmail.com')
        send_mail(
            subject,
            message,
            from_email,
            recipient_list if isinstance(recipient_list, list) else [recipient_list],
            fail_silently=False,
            html_message=html_message
        )
        print(f"[DJANGO MAIL SUCCESS] Sent '{subject}' to {recipient_list} via SMTP.")
        return True
    except Exception as e:
        print(f"[EMAIL SYSTEM WARNING] Failed to send '{subject}' to {recipient_list}: {e}")
        return False
