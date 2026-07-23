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

echo "==> Build completed successfully!"
