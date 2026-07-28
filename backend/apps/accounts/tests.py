from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from apps.accounts.models import User, UserInvitation
from apps.employees.models import Employee
import datetime


class UserInvitationModelTest(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='Password123!',
            role='admin'
        )

    def test_invitation_creation_and_expiry(self):
        invitation = UserInvitation.objects.create(
            email='invitee@test.com',
            role='employee',
            invited_by=self.admin
        )
        self.assertEqual(invitation.role, 'employee')
        self.assertFalse(invitation.is_accepted)
        self.assertTrue(invitation.is_valid())
        
        # Check default expiry (7 days)
        now = timezone.now()
        expected_expiry = now + timezone.timedelta(days=7)
        # Allow small delta in execution time
        self.assertTrue(abs((invitation.expires_at - expected_expiry).total_seconds()) < 5)


class UserInvitationAPITest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username='admin_user',
            email='admin@test.com',
            password='AdminPassword123!',
            role='admin'
        )
        self.employee = User.objects.create_user(
            username='employee_user',
            email='employee@test.com',
            password='EmployeePassword123!',
            role='employee'
        )

    def test_employee_cannot_invite(self):
        self.client.force_authenticate(user=self.employee)
        url = reverse('accounts:invite-user')
        data = {'email': 'new_user@test.com', 'role': 'employee'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_invite(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('accounts:invite-user')
        data = {'email': 'new_user@test.com', 'role': 'employee'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'new_user@test.com')
        self.assertTrue(UserInvitation.objects.filter(email='new_user@test.com').exists())

    def test_validate_invitation(self):
        invitation = UserInvitation.objects.create(
            email='validate@test.com',
            role='manager',
            invited_by=self.admin
        )
        url = reverse('accounts:validate-invite', kwargs={'token': str(invitation.token)})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'validate@test.com')
        self.assertEqual(response.data['role'], 'manager')

    def test_accept_invitation(self):
        invitation = UserInvitation.objects.create(
            email='accept@test.com',
            role='employee',
            invited_by=self.admin
        )
        url = reverse('accounts:accept-invite', kwargs={'token': str(invitation.token)})
        data = {
            'password': 'NewUserPass123!',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '1234567890'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        
        # Verify user creation
        user = User.objects.get(email='accept@test.com')
        self.assertEqual(user.first_name, 'John')
        self.assertEqual(user.role, 'employee')
        
        # Verify employee profile creation
        employee = Employee.objects.get(user=user)
        self.assertEqual(employee.phone, '1234567890')
        
        # Verify invitation status
        invitation.refresh_from_db()
        self.assertTrue(invitation.is_accepted)

