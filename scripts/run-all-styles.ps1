#!/usr/bin/env pwsh
# Run oracle predictions for all trading styles
# This script should be run 2 times per day via cron job or task scheduler

$baseUrl = if ($env:SITE_URL) { $env:SITE_URL } else { "http://localhost:3000" }
$endpoint = "$baseUrl/api/run-oracle-all-styles"

Write-Host "🚀 Generating predictions for all trading styles..." -ForegroundColor Cyan
Write-Host "📍 Endpoint: $endpoint" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method POST -TimeoutSec 600
    
    if ($response.ok) {
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "📊 Generated styles: $($response.styles -join ', ')" -ForegroundColor Green
        Write-Host "⏱️  Duration: $($response.duration)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "All predictions are now ready for instant switching!" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ ERROR: $_" -ForegroundColor Red
    exit 1
}
