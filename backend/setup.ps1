# ---------------------------------------------------------------------------
# Employee Skills & Competency Management System — Backend Setup (Windows)
# Run this from inside Employees_system\backend\  (PowerShell)
# ---------------------------------------------------------------------------

Write-Host "=== 1. Creating Python virtual environment ===" -ForegroundColor Cyan
python -m venv venv
.\venv\Scripts\Activate.ps1

Write-Host "=== 2. Upgrading pip ===" -ForegroundColor Cyan
python -m pip install --upgrade pip

Write-Host "=== 3. Installing dependencies from requirements.txt ===" -ForegroundColor Cyan
pip install -r requirements.txt

Write-Host "=== 4. Creating .env from template ===" -ForegroundColor Cyan
if (-Not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env — open it and set SECRET_KEY, DB credentials, etc." -ForegroundColor Yellow
} else {
    Write-Host ".env already exists, skipping." -ForegroundColor Yellow
}

Write-Host "=== 5. Applying database migrations ===" -ForegroundColor Cyan
python manage.py migrate

Write-Host "=== 6. Setup complete ===" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "  1. Edit .env with your real DB/Redis credentials"
Write-Host "  2. Create a superuser:  python manage.py createsuperuser"
Write-Host "  3. Run the server:      python manage.py runserver"
