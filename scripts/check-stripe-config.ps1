# Stripe Configuration Verification Script
# Run this after setting up your Stripe products and prices

Write-Host "🔍 Stripe Configuration Check" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Check .env.local file
Write-Host "`n📋 Frontend Environment Variables:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    # Check Stripe publishable key
    if ($envContent -match "VITE_STRIPE_PUBLISHABLE_KEY=pk_(test_|live_)") {
        Write-Host "✅ Stripe publishable key configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Stripe publishable key missing or invalid format" -ForegroundColor Red
    }
    
    # Check price IDs
    $priceIds = @(
        "VITE_STRIPE_PRO_MONTHLY_PRICE_ID",
        "VITE_STRIPE_PRO_ANNUAL_PRICE_ID", 
        "VITE_STRIPE_TEAM_MONTHLY_PRICE_ID",
        "VITE_STRIPE_TEAM_ANNUAL_PRICE_ID",
        "VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID",
        "VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID"
    )
    
    foreach ($priceId in $priceIds) {
        if ($envContent -match "$priceId=price_\w+") {
            Write-Host "✅ $priceId configured" -ForegroundColor Green
        } else {
            Write-Host "❌ $priceId missing or invalid format" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ .env.local file not found" -ForegroundColor Red
}

# Check Wrangler secrets
Write-Host "`n🔐 Cloudflare Worker Secrets:" -ForegroundColor Yellow
try {
    $secrets = wrangler secret list --json | ConvertFrom-Json
    $secretNames = $secrets | ForEach-Object { $_.name }
    
    if ("STRIPE_SECRET_KEY" -in $secretNames) {
        Write-Host "✅ STRIPE_SECRET_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "❌ STRIPE_SECRET_KEY not set" -ForegroundColor Red
        Write-Host "   Run: wrangler secret put STRIPE_SECRET_KEY" -ForegroundColor Yellow
    }
    
    if ("STRIPE_WEBHOOK_SECRET" -in $secretNames) {
        Write-Host "✅ STRIPE_WEBHOOK_SECRET configured" -ForegroundColor Green
    } else {
        Write-Host "❌ STRIPE_WEBHOOK_SECRET not set" -ForegroundColor Red
        Write-Host "   Run: wrangler secret put STRIPE_WEBHOOK_SECRET" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Could not check secrets - ensure you're logged in to Wrangler" -ForegroundColor Red
}

Write-Host "`n📋 Stripe Dashboard Checklist:" -ForegroundColor Yellow
Write-Host "□ Products created (Pro, Team, Enterprise)" 
Write-Host "□ Monthly and annual prices set for each product"
Write-Host "□ Price IDs copied to .env.local"
Write-Host "□ Webhook endpoint added with required events"
Write-Host "□ Webhook signing secret copied to Wrangler secrets"
Write-Host "□ API keys (publishable & secret) configured"

Write-Host "`n🎯 Next Steps:" -ForegroundColor Magenta
Write-Host "1. Complete any missing configuration items above"
Write-Host "2. Test a subscription flow in Stripe's test mode"
Write-Host "3. Switch to live keys when ready for production"
Write-Host "4. Set up OAuth providers (Google and GitHub)"

Write-Host "`n💡 Stripe Dashboard URLs:" -ForegroundColor Cyan
Write-Host "Products: https://dashboard.stripe.com/products"
Write-Host "API Keys: https://dashboard.stripe.com/apikeys"  
Write-Host "Webhooks: https://dashboard.stripe.com/webhooks"
Write-Host "Test Data: https://dashboard.stripe.com/test/dashboard"