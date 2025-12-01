# Script para corrigir nomes de campos para corresponder ao Prisma schema

$files = @(
    "apps\api\src\appointments\appointments.service.ts",
    "apps\api\src\barbers\barbers.service.ts",
    "apps\api\src\cash-flow\cash-flow.service.ts",
    "apps\api\src\transactions\transactions.service.ts",
    "apps\api\src\services\services.service.ts"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw -Encoding UTF8
    
    # Substituir scheduledDate por scheduledAt
    $content = $content -replace 'scheduledDate', 'scheduledAt'
    
    Set-Content $file -Value $content -Encoding UTF8 -NoNewline
    Write-Host "Corrigido: $file"
}

Write-Host "`nCorre��o concluída!"
