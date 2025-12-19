#!/bin/bash

# Script de teste para Schedules Module
# Execute após iniciar a API

API_URL="http://localhost:3333"
TENANT_ID="your-tenant-id"
TOKEN="your-jwt-token"
BARBER_ID="your-barber-id"
SERVICE_ID="your-service-id"

echo "🧪 Testando Schedules Module..."
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo "📝 Testando: $name"
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "x-tenant-id: $TENANT_ID")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "x-tenant-id: $TENANT_ID" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  status_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $status_code"
    echo "Response: $body"
  else
    echo -e "${RED}❌ FAIL${NC} - Status: $status_code"
    echo "Response: $body"
  fi
  
  echo ""
}

# 1. Atualizar horários de trabalho
test_endpoint \
  "Atualizar horários de trabalho" \
  "PATCH" \
  "/schedules/barbers/$BARBER_ID/working-hours" \
  '{
    "workingHours": {
      "monday": { "start": "09:00", "end": "18:00" },
      "tuesday": { "start": "09:00", "end": "18:00" },
      "wednesday": { "start": "09:00", "end": "18:00" },
      "thursday": { "start": "09:00", "end": "18:00" },
      "friday": { "start": "09:00", "end": "20:00" },
      "saturday": { "start": "09:00", "end": "14:00" }
    }
  }'

# 2. Consultar horários de trabalho
test_endpoint \
  "Consultar horários de trabalho" \
  "GET" \
  "/schedules/barbers/$BARBER_ID/working-hours"

# 3. Buscar slots disponíveis
test_endpoint \
  "Buscar slots disponíveis" \
  "GET" \
  "/schedules/available?barberId=$BARBER_ID&serviceId=$SERVICE_ID&date=2025-12-23"

# 4. Bloquear horário
test_endpoint \
  "Bloquear horário" \
  "POST" \
  "/schedules/block" \
  '{
    "barberId": "'"$BARBER_ID"'",
    "startTime": "2025-12-23T12:00:00Z",
    "endTime": "2025-12-23T13:00:00Z",
    "reason": "Almoço"
  }'

# 5. Listar bloqueios
test_endpoint \
  "Listar bloqueios" \
  "GET" \
  "/schedules/barbers/$BARBER_ID/blocked"

echo "✅ Testes concluídos!"
