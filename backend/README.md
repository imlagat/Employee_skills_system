# Employee Skills & Competency Management System — Backend Setup

Folder layout expected on your machine:

```
Employees_system/
├── backend/        ← Django + DRF API (this README)
└── frontend/        ← React app (added later)
```

## Prerequisites (install these first)

You need three things installed system-wide before running the setup script:

1. **Python 3.11+** — https://www.python.org/downloads/
2. **PostgreSQL 14+** — https://www.postgresql.org/download/
3. **Redis** (for Celery background jobs / notifications)

### Installing PostgreSQL

**Windows:** download the installer from the link above, run it, remember the password you set for the `postgres` user.

**Mac (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

Then create the database and user (run inside `psql`, or `psql -U postgres` on Windows):
```sql
CREATE DATABASE skillsystem;
CREATE USER skillsystem_user WITH PASSWORD 'changeme';
ALTER ROLE skillsystem_user SET client_encoding TO 'utf8';
GRANT ALL PRIVILEGES ON DATABASE skillsystem TO skillsystem_user;
```

### Installing Redis

**Windows:** easiest option is Redis via WSL, or use the Memurai (Redis-compatible) Windows build: https://www.memurai.com/get-memurai
```bash
# inside WSL
sudo apt install redis-server
sudo service redis-server start
```

**Mac (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

Verify Redis is running:
```bash
redis-cli ping
# should return: PONG
```

## Backend setup

1. Put the `backend/` folder inside `Employees_system/` on your Desktop.
2. Open a terminal **inside** `Employees_system/backend/`.
3. Run the setup script for your OS:

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows (PowerShell):**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

This will:
- create a virtual environment (`venv/`)
- install all Python dependencies from `requirements.txt`
- copy `.env.example` → `.env`
- run database migrations (against SQLite by default, until you flip on Postgres — see below)

4. **Edit `.env`** with your real values:

```ini
SECRET_KEY=generate-a-long-random-string-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

USE_POSTGRES=True
DB_NAME=skillsystem
DB_USER=skillsystem_user
DB_PASSWORD=changeme
DB_HOST=localhost
DB_PORT=5432

CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

To generate a strong `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

5. Re-run migrations now that Postgres is configured:
```bash
python manage.py migrate
```

6. Create your admin account:
```bash
python manage.py createsuperuser
```

7. Run the dev server:
```bash
python manage.py runserver
```

Visit **http://localhost:8000/admin/** to log in and confirm everything works. You should see: Users, Employees, Departments, Skills, Certifications, Training Programs, Succession Plans, and Notifications in the admin sidebar.

## Running Celery (background notifications)

The system automatically checks for expiring certifications and overdue mandatory training. This runs via Celery, which needs Redis running (see above) plus two extra processes, each in **its own terminal** (remember to activate `venv` in each):

**Worker** (executes tasks):
```bash
celery -A config worker -l info
```

**Beat** (schedules recurring tasks — e.g. daily expiry checks):
```bash
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
```

You can configure the actual schedule (e.g. "daily at 7am") later in the Django admin under **Periodic Tasks**, or we can wire up default schedules in code next.

## Quick verification checklist

- [ ] `python manage.py check` → "System check identified no issues"
- [ ] `python manage.py migrate` → runs without errors
- [ ] Admin panel loads at `/admin/` and you can log in
- [ ] `POST /api/auth/login/` with your superuser credentials returns `access` and `refresh` tokens
- [ ] `redis-cli ping` returns `PONG`
- [ ] Celery worker starts without connection errors

## Troubleshooting

| Problem | Fix |
|---|---|
| `psycopg2` fails to install | Make sure PostgreSQL client libraries are installed (`libpq-dev` on Linux, or use the Postgres.app on Mac which bundles them) |
| `django.db.utils.OperationalError: could not connect to server` | Postgres isn't running, or wrong host/port in `.env` |
| Celery can't connect to broker | Redis isn't running — check `redis-cli ping` |
| `ModuleNotFoundError` on manage.py commands | You forgot to activate the venv — run `source venv/bin/activate` (Mac/Linux) or `.\venv\Scripts\Activate.ps1` (Windows) |
