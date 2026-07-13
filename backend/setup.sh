#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Employee Skills & Competency Management System — Backend Setup (Mac/Linux)
# Run this from inside Employees_system/backend/
# ---------------------------------------------------------------------------
set -e

echo "=== 1. Creating Python virtual environment ==="
python3 -m venv venv
source venv/bin/activate

echo "=== 2. Upgrading pip ==="
pip install --upgrade pip

echo "=== 3. Installing dependencies from requirements.txt ==="
pip install -r requirements.txt

echo "=== 4. Creating .env from template (edit this before continuing) ==="
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env — open it and set SECRET_KEY, DB credentials, etc."
else
    echo ".env already exists, skipping."
fi

echo "=== 5. Applying database migrations ==="
python manage.py migrate

echo "=== 6. Setup complete ==="
echo "Next steps:"
echo "  1. Edit .env with your real DB/Redis credentials"
echo "  2. Create a superuser:  python manage.py createsuperuser"
echo "  3. Run the server:      python manage.py runserver"
