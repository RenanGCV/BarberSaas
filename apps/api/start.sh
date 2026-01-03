#!/bin/sh

echo "=== BarberSaas API Startup ==="
echo "Current directory: $(pwd)"
echo "Checking environment variables..."
echo "DATABASE_URL exists: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# List all environment variables (masking sensitive data)
echo "=== All ENV vars (names only) ==="
env | cut -d= -f1 | sort

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set!"
  echo "Waiting 30 seconds before exit for debugging..."
  sleep 30
  exit 1
fi

echo "DATABASE_URL is configured, running migrations..."

npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "Migration had issues, but continuing..."
fi

echo "Starting application on port ${PORT:-3333}..."
exec node dist/src/main
