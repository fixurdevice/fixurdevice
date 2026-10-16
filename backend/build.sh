#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "📦 Upgrading pip..."
pip install --upgrade pip

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

echo "🎨 Collecting static files..."
python manage.py collectstatic --no-input

echo "🗄️ Applying database migrations..."
python manage.py migrate --no-input

echo "🌱 Seeding initial database records (admin, staff, services)..."
python seed_data.py

echo "✅ Backend build finished successfully!"
