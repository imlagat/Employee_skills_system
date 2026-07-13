A full-stack web application for managing employee skills, certifications, training, competencies, and career development — powered by AI insights.

📸 Overview
SkillMatrix is a modern HR & Learning Management System that gives organizations a centralized platform to track, manage, and develop employee skills. It features an intuitive dashboard, AI-powered gap analysis, promotion readiness scoring, and a full certification/training management workflow.

✨ Features
👥 Employee Management
Employee directory with search and filters
Detailed employee profiles (skills, training, certifications, performance)
Role-based access control: Admin, Manager, HR, Employee
Admin/Manager ability to directly edit employee details (name, email, phone, department, role)
Employee self-service profile editing (name, email, phone, bio, avatar)
📊 Dashboard
Personalized employee passport view
Skills summary, certifications, active training programs
AI-powered skill gap analysis and promotion readiness scoring
Real-time notifications
🎓 Skills & Competencies
Organization-wide skills catalog
Employee skill self-assessment and proficiency tracking
Position-based competency framework
Skill gap detection per employee vs. their role requirements
📜 Certifications
Certification catalog management
Employee certification tracking with expiry dates
Validity status indicators (Valid / Expired)
Displayed on employee dashboard passport
🏋️ Training Programs
Training program catalog
Employee enrollment tracking
Completion and progress status
Linked to skill development paths
🤖 AI Features
AI Skill Gap Analysis — Identifies missing competencies per employee
AI Promotion Readiness — Scores employee readiness for career advancement
Powered by Google Gemini AI
📈 Reports & Analytics
Organization-wide skill coverage reports
Department and position-level analytics
🔐 Authentication
JWT-based authentication (login / signup / email verification)
Password reset via email
Token refresh & secure session handling
🛠️ Tech Stack
Backend
Technology	Purpose
Django 6	Web framework
Django REST Framework	REST API
SimpleJWT	JWT Authentication
Celery + Redis	Background tasks & scheduling
SQLite (dev) / PostgreSQL (prod)	Database
Pillow	Image handling (profile photos)
Google Gemini AI	AI-powered analysis
django-filter	API filtering
django-cors-headers	Cross-origin support
Frontend
Technology	Purpose
React 18	UI framework
React Router v6	Client-side routing
Axios	HTTP client
Lucide React	Icons
React Hot Toast	Notifications
Vite	Build tool
Vanilla CSS	Styling (dark/light mode)
📁 Project Structure

SkillMatrix/
├── backend/
│   ├── apps/
│   │   ├── accounts/         # User auth, roles, permissions
│   │   ├── employees/        # Employee profiles, departments, positions
│   │   ├── skills/           # Skills catalog, competency framework
│   │   ├── certifications/   # Certification catalog & employee certs
│   │   ├── training/         # Training programs & enrollments
│   │   ├── notifications/    # In-app notification system
│   │   ├── dashboards/       # Dashboard aggregation endpoints
│   │   ├── ai_assistant/     # Gemini AI integrations
│   │   └── succession/       # Succession planning module
│   ├── config/               # Django settings & URL config
│   ├── requirements.txt
│   ├── manage.py
│   ├── setup.sh              # Linux/Mac setup script
│   └── setup.ps1             # Windows setup script
│
└── frontend/
    ├── src/
    │   ├── pages/            # All page components
    │   ├── components/       # Reusable UI components
    │   ├── api/              # Axios instance & interceptors
    │   ├── context/          # Auth context (global state)
    │   └── index.css         # Global design system
    └── vite.config.js
🚀 Getting Started
Prerequisites
Python 3.10+
Node.js 18+
Redis (for Celery — optional in development)
🔧 Backend Setup
bash

# 1. Clone the repository
git clone https://github.com/your-username/skillmatrix.git
cd skillmatrix/backend
# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
# 3. Install dependencies
pip install -r requirements.txt
# 4. Set up environment variables
cp .env.example .env
# Edit .env with your values
# 5. Run migrations
python manage.py migrate
# 6. (Optional) Seed sample data
python seed_data.py
# 7. Create a superuser
python manage.py createsuperuser
# 8. Start the development server
python manage.py runserver
The backend API will be available at http://127.0.0.1:8000/api/

🎨 Frontend Setup
bash

# Navigate to frontend directory
cd skillmatrix/frontend
# Install dependencies
npm install
# Start development server
npm run dev
The frontend will be available at http://localhost:5173

⚙️ Environment Variables
Create a .env file in the backend/ directory based on .env.example:

env

SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
# Database (leave blank to use SQLite in development)
DATABASE_URL=
# Email (for verification & password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-app-password
# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
🔑 Default Roles
Role	Permissions
admin	Full access — manage all employees, approve requests, view all data
manager	View & edit team employee profiles, view reports
hr	View & edit employee profiles, manage certifications & training
employee	View own dashboard, update own profile, self-assess skills
📡 Key API Endpoints
Method	Endpoint	Description
POST	/api/auth/login/	Obtain JWT tokens
POST	/api/auth/signup/	Register a new user
GET/PATCH	/api/employees/me/	Get/update current user profile
GET	/api/employees/	List all employees
GET	/api/employees/{id}/	Get employee details
GET	/api/departments/	List departments
GET	/api/positions/	List positions
GET	/api/skills/	Skills catalog
GET	/api/certifications/	Certifications catalog
GET	/api/employee-certifications/	Employee certifications
GET	/api/training/	Training programs
GET	/api/notifications/	User notifications
GET	/api/employees/{id}/competency_gaps/	AI gap analysis
🖌️ UI Themes
SkillMatrix supports Dark Mode and Light Mode, toggled from the Settings page. The theme is persisted in localStorage.

📌 Roadmap
 PostgreSQL production database support
 Export reports to PDF/Excel
 Succession planning module (in progress)
 Mobile-responsive layout improvements
 Bulk employee import via CSV
 Email digest for managers (weekly skills summary)
🤝 Contributing
Fork the repository
Create your feature branch: git checkout -b feature/your-feature
Commit your changes: git commit -m 'Add some feature'
Push to the branch: git push origin feature/your-feature
Open a Pull Request
📄 License
This project is licensed under the MIT License — see the 
LICENSE
 file for details.

👤 Author
Emmanuel Lagat

GitHub: @imlagat
Built with ❤️ using Django, React, and Google Gemini AI
