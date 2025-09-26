# 🔍 VibeCoding SaaS - Production Secrets Validation Script
# This script validates that all required API keys and secrets are properly configured

Write-Host "🔍 VibeCoding SaaS - Production Secrets Validation" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$errors = @()
$warnings = @()
$successes = @()

# Check if wrangler is available
try {
    $null = Get-Command wrangler -ErrorAction Stop
    $successes += "✅ Wrangler CLI is available"
}
catch {
    $errors += "❌ Wrangler CLI not found - install with: npm install -g wrangler"
    Write-Host $errors[-1] -ForegroundColor Red
    exit 1
}

# Get list of configured secrets
try {
    $secretsList = wrangler secret list --json 2>$null | ConvertFrom-Json
    $configuredSecrets = $secretsList | ForEach-Object { $_.name }
}
catch {
    $errors += "❌ Unable to retrieve secrets list - ensure you're logged in to Wrangler"
    Write-Host $errors[-1] -ForegroundColor Red
    exit 1
}

# Function to check if a secret is configured
function Test-Secret {
    param(
        [string]$SecretName,
        [string]$Description,
        [bool]$Required = $true
    )
    
    if ($configuredSecrets -contains $SecretName) {
        $successes += "✅ $SecretName - $Description"
        return $true
    }
    else {
        if ($Required) {
            $errors += "❌ $SecretName - $Description (REQUIRED)"
        }
        else {
            $warnings += "⚠️  $SecretName - $Description (optional)"
        }
        return $false
    }
}

# Function to check frontend environment variable
function Test-EnvVar {
    param(
        [string]$VarName,
        [string]$Description,
        [bool]$Required = $true
    )
    
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        if ($envContent -match "$VarName=.+") {
            $successes += "✅ $VarName - $Description (in .env.local)"
            return $true
        }
    }
    
    if ($Required) {
        $errors += "❌ $VarName - $Description (missing from .env.local)"
    }
    else {
        $warnings += "⚠️  $VarName - $Description (missing from .env.local)"
    }
    return $false
}

Write-Host "🤖 AI MODEL PROVIDERS" -ForegroundColor Magenta
Write-Host "===================="
$hasAI = $false
$hasAI = Test-Secret "ANTHROPIC_API_KEY" "Claude models from Anthropic" $false || $hasAI
$hasAI = Test-Secret "OPENAI_API_KEY" "GPT models from OpenAI" $false || $hasAI
$hasAI = Test-Secret "GOOGLE_AI_STUDIO_API_KEY" "Gemini models from Google" $false || $hasAI

if (-not $hasAI) {
    $errors += "❌ At least one AI model provider API key is required"
}

Test-Secret "OPENROUTER_API_KEY" "OpenRouter for additional AI models" $false
Test-Secret "CEREBRAS_API_KEY" "Cerebras for high-performance inference" $false
Test-Secret "GROQ_API_KEY" "Groq for fast inference" $false
Write-Host ""

Write-Host "🔐 SECURITY & AUTHENTICATION" -ForegroundColor Magenta
Write-Host "============================"
Test-Secret "JWT_SECRET" "JWT token signing secret"
Test-Secret "SECRETS_ENCRYPTION_KEY" "User secrets encryption key"
Test-Secret "WEBHOOK_SECRET" "Webhook validation secret" $false
Test-Secret "ENTROPY_KEY" "Additional entropy for security" $false
Write-Host ""

Write-Host "🔑 OAuth Authentication" -ForegroundColor Magenta
Write-Host "-----------------------"
$hasGoogleOAuth = Test-Secret "GOOGLE_CLIENT_ID" "Google OAuth client ID" $false
Test-Secret "GOOGLE_CLIENT_SECRET" "Google OAuth client secret" $hasGoogleOAuth

$hasGitHubOAuth = Test-Secret "GITHUB_CLIENT_ID" "GitHub OAuth client ID" $false  
Test-Secret "GITHUB_CLIENT_SECRET" "GitHub OAuth client secret" $hasGitHubOAuth

Test-Secret "GITHUB_EXPORTER_CLIENT_ID" "GitHub code export client ID" $false
Test-Secret "GITHUB_EXPORTER_CLIENT_SECRET" "GitHub code export client secret" $false
Write-Host ""

Write-Host "💳 SAAS PLATFORM SERVICES" -ForegroundColor Magenta
Write-Host "========================="
$hasStripeSecret = Test-Secret "STRIPE_SECRET_KEY" "Stripe payment processing"
Test-Secret "RESEND_API_KEY" "Email service API key"
Write-Host ""

Write-Host "☁️ CLOUDFLARE SERVICES" -ForegroundColor Magenta
Write-Host "======================"
Test-Secret "CLOUDFLARE_API_TOKEN" "Platform management API token"
Test-Secret "CLOUDFLARE_ACCOUNT_ID" "Cloudflare account identifier"
Test-Secret "CLOUDFLARE_AI_GATEWAY_URL" "AI Gateway URL for analytics" $false
Test-Secret "CLOUDFLARE_AI_GATEWAY_TOKEN" "AI Gateway authentication token" $false
Test-Secret "CF_ACCESS_ID" "Cloudflare Access service ID" $false
Test-Secret "CF_ACCESS_SECRET" "Cloudflare Access service secret" $false
Write-Host ""

Write-Host "🔍 ADDITIONAL SERVICES" -ForegroundColor Magenta
Write-Host "======================"
Test-Secret "SERPAPI_KEY" "Web search API key" $false
Test-Secret "SENTRY_DSN" "Error tracking DSN" $false
Test-Secret "SANDBOX_SERVICE_API_KEY" "External sandbox service API" $false
Write-Host ""

Write-Host "🎯 FRONTEND ENVIRONMENT VARIABLES" -ForegroundColor Magenta
Write-Host "================================="
if (-not (Test-Path ".env.local")) {
    $errors += "❌ .env.local file not found - create this file for frontend configuration"
}
else {
    Test-EnvVar "VITE_SUPABASE_URL" "Supabase project URL"
    Test-EnvVar "VITE_SUPABASE_ANON_KEY" "Supabase anonymous key"
    
    if ($hasStripeSecret) {
        Test-EnvVar "VITE_STRIPE_PUBLISHABLE_KEY" "Stripe publishable key"
        Test-EnvVar "VITE_STRIPE_PRO_MONTHLY_PRICE_ID" "Pro monthly subscription price ID"
        Test-EnvVar "VITE_STRIPE_PRO_ANNUAL_PRICE_ID" "Pro annual subscription price ID" $false
        Test-EnvVar "VITE_STRIPE_TEAM_MONTHLY_PRICE_ID" "Team monthly subscription price ID" $false
        Test-EnvVar "VITE_STRIPE_TEAM_ANNUAL_PRICE_ID" "Team annual subscription price ID" $false
        Test-EnvVar "VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID" "Enterprise monthly subscription price ID" $false
        Test-EnvVar "VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID" "Enterprise annual subscription price ID" $false
    }
    
    Test-EnvVar "VITE_RESEND_API_KEY" "Email service API key (frontend)" $false
}
Write-Host ""

# Summary
Write-Host "📊 VALIDATION SUMMARY" -ForegroundColor Magenta
Write-Host "===================="

if ($successes) {
    Write-Host ""
    Write-Host "✅ CONFIGURED SUCCESSFULLY:" -ForegroundColor Green
    $successes | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
}

if ($warnings) {
    Write-Host ""
    Write-Host "⚠️  OPTIONAL/WARNINGS:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}

if ($errors) {
    Write-Host ""
    Write-Host "❌ ERRORS/MISSING REQUIRED:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "📈 CONFIGURATION STATUS" -ForegroundColor Magenta
Write-Host "======================="
$totalRequired = ($errors | Where-Object { $_ -like "*REQUIRED*" -or $_ -like "*missing from .env.local*" }).Count
$totalConfigured = $successes.Count
$totalWarnings = $warnings.Count

Write-Host "✅ Successfully configured: $totalConfigured" -ForegroundColor Green
Write-Host "⚠️  Optional/warnings: $totalWarnings" -ForegroundColor Yellow
Write-Host "❌ Missing required: $totalRequired" -ForegroundColor Red

Write-Host ""
if ($totalRequired -eq 0) {
    Write-Host "🎉 READY FOR PRODUCTION!" -ForegroundColor Green
    Write-Host "All required secrets and environment variables are configured."
    Write-Host "You can now deploy with: bun run deploy"
}
else {
    Write-Host "⚠️  NOT READY FOR PRODUCTION" -ForegroundColor Red
    Write-Host "Please configure the missing required secrets and environment variables."
    Write-Host ""
    Write-Host "Quick setup commands:"
    Write-Host "  .\scripts\setup-production-secrets.ps1    # Interactive setup"
    Write-Host "  .\scripts\setup-production-secrets.ps1 -AutoGenerate  # Auto-generate secrets"
}

Write-Host ""
Write-Host "📋 NEXT STEPS" -ForegroundColor Magenta
Write-Host "============="
if ($totalRequired -eq 0) {
    Write-Host "1. ✅ All secrets configured"
    Write-Host "2. 🚀 Deploy: bun run deploy"
    Write-Host "3. 🧪 Test deployment functionality"
    Write-Host "4. 📊 Monitor deployment in Cloudflare dashboard"
}
else {
    Write-Host "1. 🔧 Configure missing required secrets"
    Write-Host "2. 📝 Create/update .env.local file"  
    Write-Host "3. ⚡ Re-run this validation script"
    Write-Host "4. 🚀 Deploy when all required items are configured"
}

Write-Host ""
Write-Host "For detailed setup instructions, see: PRODUCTION_API_KEYS_GUIDE.md" -ForegroundColor Cyan

# Return appropriate exit code
if ($totalRequired -eq 0) {
    exit 0
}
else {
    exit 1
}