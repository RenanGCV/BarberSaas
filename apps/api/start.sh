#!/bin/sh

echo "=== BarberSaas API Startup ==="
echo "Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set!"
  echo "Please configure DATABASE_URL in Railway Variables"
  exit 1
fi

echo "DATABASE_URL is configured"
echo "Running Prisma migrations..."

cd /app/apps/api

npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "Migration failed, but continuing..."
fi

echo "Starting application..."
node dist/src/main
