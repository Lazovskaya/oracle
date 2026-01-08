# Pre-Deployment Checklist Script
# Run this before deploying to ensure everything is configured correctly

Write-Host ""
Write-Host "🔍 Market Oracle - Pre-Deployment Checklist" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check 1: Node modules
Write-Host "📦 Checking dependencies..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗ node_modules not found" -ForegroundColor Red
    Write-Host "   Run: npm install" -ForegroundColor Yellow
    $allGood = $false
}

# Check 2: .env.local exists
Write-Host "🔐 Checking .env.local file..." -NoNewline
if (Test-Path ".env.local") {
    Write-Host " ✓" -ForegroundColor Green
    
    # Check if it has actual values
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "your-database-url" -or $envContent -match "your_auth_token_here" -or $envContent -match "your-openai-api-key-here") {
        Write-Host "   ⚠️  Warning: .env.local still has placeholder values" -ForegroundColor Yellow
        Write-Host "   Please update with your actual credentials" -ForegroundColor Gray
        $allGood = $false
    }
} else {
    Write-Host " ✗ .env.local not found" -ForegroundColor Red
    Write-Host "   Copy .env.example to .env.local and fill in values" -ForegroundColor Yellow
    $allGood = $false
}

# Check 3: Required files
Write-Host "📄 Checking required files..." -NoNewline
$requiredFiles = @("package.json", "next.config.ts", "vercel.json", ".env.example", "README.md")
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}
if ($missingFiles.Count -eq 0) {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗ Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Git initialized
Write-Host "🔧 Checking Git repository..." -NoNewline
if (Test-Path ".git") {
    Write-Host " ✓" -ForegroundColor Green
    
    # Check if remote exists
    $remote = git remote -v 2>$null
    if ($remote) {
        Write-Host "   ✓ Git remote configured" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  No Git remote configured" -ForegroundColor Yellow
        Write-Host "   Add remote: git remote add origin https://github.com/USERNAME/oracle.git" -ForegroundColor Gray
    }
} else {
    Write-Host " ✗ Not a Git repository" -ForegroundColor Red
    Write-Host "   Run: git init" -ForegroundColor Yellow
    $allGood = $false
}

# Check 5: Build test
Write-Host "🏗️  Testing build..." -NoNewline
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✓" -ForegroundColor Green
} else {
    Write-Host " ✗ Build failed" -ForegroundColor Red
    Write-Host "   Check error output above" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host ""
    Write-Host "✅ Everything looks good! You're ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Commit your changes: git add . && git commit -m 'Ready for deployment'" -ForegroundColor Gray
    Write-Host "  2. Push to GitHub: git push" -ForegroundColor Gray
    Write-Host "  3. Deploy to Vercel: vercel or import on vercel.com" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Please fix the issues above before deploying" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📚 Need help? Check:" -ForegroundColor Cyan
Write-Host "   • QUICKSTART.md - 5-minute setup guide" -ForegroundColor Gray
Write-Host "   • DEPLOYMENT.md - Detailed deployment guide" -ForegroundColor Gray
Write-Host "   • README.md - Full documentation" -ForegroundColor Gray
Write-Host ""
