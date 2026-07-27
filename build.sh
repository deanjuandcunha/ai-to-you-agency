#!/usr/bin/env bash
# build.sh — Render.com Deployment Build Script for AI-TO-YOU Technologies

# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing production Python dependencies..."
pip install -r requirements.txt

echo "==> Gathering static assets with WhiteNoise..."
python manage.py collectstatic --no-input

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Ensuring Executive Superuser exists from environment variables..."
python manage.py shell -c "
import os
from django.contrib.auth import get_user_model

username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL') or username
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if username and password:
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username=username,
        defaults={'email': email, 'is_staff': True, 'is_superuser': True}
    )
    user.set_password(password)
    if email:
        user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.save()
    if created:
        print('==> Executive Superuser created successfully from environment variables.')
    else:
        print('==> Executive Superuser password and permissions updated.')
else:
    print('==> Skipping automated superuser creation: DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD not set in environment.')
"

echo "==> Build completed successfully!"
