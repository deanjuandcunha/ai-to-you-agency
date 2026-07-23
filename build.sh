#!/usr/bin/env bash
# build.sh — Render.com Deployment Build Script for AI-->TO-->YOU Technologies

# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing production Python dependencies..."
pip install -r requirements.txt

echo "==> Gathering static assets with WhiteNoise..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Ensuring Executive Superuser exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
username = 'deandcunha@gmail.com'
email = 'deandcunha@gmail.com'
password = 'deanjuan26$'

user, created = User.objects.get_or_create(username=username, defaults={'email': email, 'is_staff': True, 'is_superuser': True})
user.set_password(password)
user.email = email
user.is_staff = True
user.is_superuser = True
user.save()

if created:
    print('==> Executive Superuser created successfully.')
else:
    print('==> Executive Superuser password/permissions updated.')
"

echo "==> Build completed successfully!"

