# Quick Push to Vercel Script
# Run this to commit and push your changes to GitHub (which auto-deploys to Vercel)

Write-Host "🚀 Market Oracle - Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
    Write-Host "✓ Git initialized" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please add your GitHub remote:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/oracle.git" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Check for changes
$status = git status --porcelain
if (-not $status) {
    Write-Host "✓ No changes to commit" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your code is up to date!" -ForegroundColor Cyan
    exit
}

# Show status
Write-Host "📝 Changes detected:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Get commit message
$message = Read-Host "Enter commit message (or press Enter for default)"
if (-not $message) {
    $message = "Update Market Oracle"
}

# Stage all changes
Write-Host ""
Write-Host "📦 Staging changes..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m $message

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "Vercel will automatically deploy your changes." -ForegroundColor Cyan
Write-Host "Check your deployment at: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host ""
Write-Host "⏱️  Deployment usually takes 2-3 minutes." -ForegroundColor Gray
Write-Host ""
