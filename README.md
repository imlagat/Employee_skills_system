SkillMatrix

An AI-powered Employee Skills & Competency Management System built with Django, React, and Google Gemini AI. The platform helps organizations manage employee profiles, skills, certifications, training, and career development through intelligent insights and analytics.

✨ Features
Employee & Department Management
Skills & Competency Tracking
Certification & Training Management
AI Skill Gap Analysis
AI Promotion Readiness Scoring
Role-Based Access Control (Admin, HR, Manager, Employee)
JWT Authentication & Email Verification
Responsive Dashboard & Employee Passport
🛠 Tech Stack

Backend

Django & Django REST Framework
PostgreSQL / SQLite
JWT Authentication
Celery & Redis
Google Gemini AI

Frontend

React + Vite
React Router
Axios
Vanilla CSS
🚀 Installation
Backend
git clone https://github.com/imlagat/Employee_skills_system.git
cd Employee_skills_system/backend

python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
Frontend
cd frontend
npm install
npm run dev
🔐 User Roles
Admin – Full system access
HR – Manage employees, certifications, and training
Manager – Manage team members and view reports
Employee – Update profile and track personal development
🤖 AI Features
Skill Gap Analysis
Promotion Readiness Assessment
AI-powered workforce insights using Google Gemini
📷 Screenshots

Add screenshots or GIFs of your dashboard, employee profile, and AI assistant here.

📄 License

Licensed under the MIT License.

👨‍💻 Author

Emmanuel Lagat

GitHub: @imlagat
