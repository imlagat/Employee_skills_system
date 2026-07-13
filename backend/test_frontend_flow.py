import requests

BASE_URL = 'http://localhost:8000/api'

# 1. Sign up a new user
signup_data = {
    'username': 'testflowuser',
    'email': 'testflowuser@example.com',
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'Flow',
    'role': 'employee'
}
r = requests.post(f'{BASE_URL}/auth/signup/', json=signup_data)
print("Signup:", r.status_code, r.text)

# 2. Login to get token
login_data = {
    'username': 'testflowuser@example.com', # Wait, login expects email or username? Let's use email since the backend checks username field which is set to email/username
    'password': 'password123'
}
r = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
print("Login:", r.status_code, r.text)
if r.status_code != 200:
    # Try username
    login_data['username'] = 'testflowuser'
    r = requests.post(f'{BASE_URL}/auth/login/', json=login_data)
    print("Login (username):", r.status_code, r.text)

token = r.json().get('access')
headers = {'Authorization': f'Bearer {token}'}

# 3. Fetch auth/me
r = requests.get(f'{BASE_URL}/auth/me/', headers=headers)
print("auth/me (before):", r.status_code, r.text)

# 4. Patch employees/me
patch_data = {
    'phone': '+254 123456',
    'department': 10,
    'position': 15
}
r = requests.patch(f'{BASE_URL}/employees/me/', json=patch_data, headers=headers)
print("PATCH employees/me:", r.status_code, r.text)

# 5. Fetch auth/me again
r = requests.get(f'{BASE_URL}/auth/me/', headers=headers)
print("auth/me (after):", r.status_code, r.text)

