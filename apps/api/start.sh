#!/bin/sh

echo "=== BarberSaas API Startup ==="
echo "Current directory: $(pwd)"
echo "Checking environment variables..."
echo "DATABASE_URL exists: $(if [ -n "$DATABASE_URL" ]; then echo 'YES'; else echo 'NO'; fi)"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set!"
  exit 1
fi

echo "DATABASE_URL is configured, running migrations..."

npx prisma migrate deploy

if [ $? -ne 0 ]; then
  echo "Migration had issues, but continuing..."
fi

# Verificar se o banco está vazio e rodar seed
echo "Checking if database needs seeding..."
USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | grep -o '[0-9]*' | head -1)

if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  echo "Database is empty, running seed..."
  npx prisma db seed || echo "Seed failed or already seeded"
else
  echo "Database already has $USER_COUNT users, skipping seed"
fi

echo "Starting application on port ${PORT:-3333}..."
exec node dist/src/main
