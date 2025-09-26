# 🔐 VibeCoding SaaS - Production Secrets Setup Script (PowerShell)
# This script helps you set up all the required API keys and secrets for production deployment

param(
    [switch]$AutoGenerate,
    [switch]$SkipOptional
)

Write-Host "🔐 VibeCoding SaaS - Production Secrets Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "✅ Wrangler CLI is ready" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Wrangler CLI not found" -ForegroundColor Red
    Write-Host "Please install it with: npm install -g wrangler"
    exit 1
}

# Check if user is logged in to Wrangler
try {
    $null = wrangler whoami 2>$null
    Write-Host "✅ Logged in to Wrangler" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: Not logged in to Wrangler" -ForegroundColor Red
    Write-Host "Please login with: wrangler login"
    exit 1
}

Write-Host ""

# Function to set a secret
function Set-Secret {
    param(
        [string]$Name,
        [string]$Description,
        [bool]$Optional = $false,
        [string]$Example = ""
    )
    
    Write-Host "🔑 Setting up: $Name" -ForegroundColor Blue
    Write-Host "   Description: $Description"
    if ($Example) {
        Write-Host "   Example: $Example"
    }
    Write-Host ""
    
    if ($SkipOptional -and $Optional) {
        Write-Host "   ⏭️  Skipped $Name (optional)" -ForegroundColor Yellow
        Write-Host ""
        return
    }
    
    $response = Read-Host "   Do you want to set $Name now? (y/n/s to skip)"
    
    switch ($response.ToLower()) {
        { $_ -in @('y', 'yes') } {
            Write-Host "   Enter the value for ${Name}:" -ForegroundColor Yellow
            try {
                wrangler secret put $Name
                Write-Host "   ✅ $Name set successfully" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ Failed to set $Name" -ForegroundColor Red
            }
        }
        { $_ -in @('s', 'skip') } {
            if ($Optional) {
                Write-Host "   ⏭️  Skipped $Name (optional)" -ForegroundColor Yellow
            }
            else {
                Write-Host "   ⚠️  Skipped $Name (required for full functionality)" -ForegroundColor Yellow
            }
        }
        default {
            if ($Optional) {
                Write-Host "   ⏭️  Skipped $Name (optional)" -ForegroundColor Yellow
            }
            else {
                Write-Host "   ❌ Skipped $Name (required)" -ForegroundColor Red
            }
        }
    }
    Write-Host ""
}

# Generate random secret helper
function Generate-Secret {
    $bytes = New-Object byte[] 32
    ([System.Security.Cryptography.RNGCryptoServiceProvider]::Create()).GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

# Set secrets with auto-generation
function Set-SecretWithGeneration {
    param(
        [string]$Name,
        [string]$Description
    )
    
    Write-Host "🔑 $Name" -ForegroundColor Blue
    Write-Host "   Description: $Description (required)"
    Write-Host ""
    
    if ($AutoGenerate) {
        $secret = Generate-Secret
        Write-Host "   Generated secret: $secret"
        $secret | wrangler secret put $Name
        Write-Host "   ✅ $Name set successfully" -ForegroundColor Green
    }
    else {
        $generate = Read-Host "   Generate a random $Name automatically? (y/n)"
        if ($generate -match '^[yY]') {
            $secret = Generate-Secret
            Write-Host "   Generated secret: $secret"
            $secret | wrangler secret put $Name
            Write-Host "   ✅ $Name set successfully" -ForegroundColor Green
        }
        else {
            Set-Secret $Name "$Description (64-character hex string)" $false
        }
    }
    Write-Host ""
}

Write-Host "🤖 AI MODEL PROVIDERS" -ForegroundColor Magenta
Write-Host "===================="
Set-Secret "ANTHROPIC_API_KEY" "Claude models from Anthropic" $false "sk-ant-..."
Set-Secret "OPENAI_API_KEY" "GPT models from OpenAI" $false "sk-..."
Set-Secret "GOOGLE_AI_STUDIO_API_KEY" "Gemini models from Google" $false "AI..."

Write-Host "🔐 SECURITY & AUTHENTICATION" -ForegroundColor Magenta
Write-Host "============================"
Set-SecretWithGeneration "JWT_SECRET" "Secret for signing JWT tokens"
Set-SecretWithGeneration "SECRETS_ENCRYPTION_KEY" "Key for encrypting user secrets"
Set-Secret "WEBHOOK_SECRET" "Secret for webhook validation" $false

Write-Host "🔑 OAuth Authentication" -ForegroundColor Magenta
Write-Host "-----------------------"
Set-Secret "GOOGLE_CLIENT_ID" "Google OAuth client ID" $false
Set-Secret "GOOGLE_CLIENT_SECRET" "Google OAuth client secret" $false
Set-Secret "GITHUB_CLIENT_ID" "GitHub OAuth client ID" $false
Set-Secret "GITHUB_CLIENT_SECRET" "GitHub OAuth client secret" $false

Write-Host "💳 SAAS PLATFORM SERVICES" -ForegroundColor Magenta
Write-Host "========================="
Set-Secret "STRIPE_SECRET_KEY" "Stripe secret key for payment processing" $false "sk_live_..."
Set-Secret "RESEND_API_KEY" "Resend API key for email service" $false "re_..."

Write-Host "☁️ CLOUDFLARE SERVICES" -ForegroundColor Magenta
Write-Host "======================"
Set-Secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token for platform management" $false
Set-Secret "CLOUDFLARE_ACCOUNT_ID" "Cloudflare account ID" $false

if (-not $SkipOptional) {
    Write-Host "🔍 OPTIONAL SERVICES" -ForegroundColor Magenta
    Write-Host "===================="
    Set-Secret "OPENROUTER_API_KEY" "OpenRouter for additional AI models" $true
    Set-Secret "CEREBRAS_API_KEY" "Cerebras for high-performance inference" $true
    Set-Secret "GROQ_API_KEY" "Groq for fast inference" $true
    Set-Secret "SERPAPI_KEY" "SerpAPI for web search features" $true
    Set-Secret "SENTRY_DSN" "Sentry DSN for error tracking" $true
    Set-Secret "CLOUDFLARE_AI_GATEWAY_TOKEN" "AI Gateway token for request analytics" $true
}

Write-Host ""
Write-Host "🎯 FRONTEND ENVIRONMENT VARIABLES" -ForegroundColor Magenta
Write-Host "================================="
Write-Host "⚠️  Don't forget to set up your frontend environment variables!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Create a .env.local file with:"
Write-Host "VITE_SUPABASE_URL=https://your-project.supabase.co"
Write-Host "VITE_SUPABASE_ANON_KEY=your-anon-key"
Write-Host "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
Write-Host "VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_..."
Write-Host "VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_..."
Write-Host "VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_..."
Write-Host "VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_..."
Write-Host "VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_..."
Write-Host "VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_..."
Write-Host ""

# Offer to create .env.local template
$createEnv = Read-Host "Create a template .env.local file? (y/n)"
if ($createEnv -match '^[yY]') {
    $envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe Price IDs (create these in your Stripe dashboard)
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Email Service
VITE_RESEND_API_KEY=re_...
"@
    
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Created .env.local template file" -ForegroundColor Green
    Write-Host "   Please edit .env.local with your actual values" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 DEPLOYMENT CHECKLIST" -ForegroundColor Magenta
Write-Host "======================="
Write-Host "□ AI model API keys configured"
Write-Host "□ Security secrets generated and set"
Write-Host "□ OAuth applications created"
Write-Host "□ Supabase project created with schema"
Write-Host "□ Stripe products and prices configured"
Write-Host "□ Resend domain verified"
Write-Host "□ Frontend .env.local file created"
Write-Host "□ Ready to run: bun run deploy"
Write-Host ""

Write-Host "🎉 Secret setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit your .env.local file with actual values"
Write-Host "2. Set up your Supabase database schema"
Write-Host "3. Configure your Stripe products and prices"
Write-Host "4. Run: bun run deploy"
Write-Host ""
Write-Host "For detailed setup instructions, see: PRODUCTION_API_KEYS_GUIDE.md"

# Usage examples
Write-Host ""
Write-Host "Script Usage Examples:" -ForegroundColor Cyan
Write-Host "  .\setup-production-secrets.ps1                    # Interactive setup"
Write-Host "  .\setup-production-secrets.ps1 -AutoGenerate      # Auto-generate security secrets"
Write-Host "  .\setup-production-secrets.ps1 -SkipOptional      # Skip optional services"