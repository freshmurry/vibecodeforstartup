# VibeCoding SaaS Integration Test
Write-Host "VibeCoding SaaS Starter Integration Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check core files
Write-Host "`nChecking core SaaS files..." -ForegroundColor Yellow

$files = @(
    "src/lib/supabase.ts",
    "src/lib/database.types.ts", 
    "src/lib/stripe.ts",
    "src/lib/email.ts",
    "src/contexts/supabase-auth-context.tsx",
    "src/components/auth/auth-modal.tsx",
    "src/routes/dashboard.tsx",
    "src/routes/admin.tsx",
    "src/routes/auth/callback.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $file" -ForegroundColor Red
    }
}

# Check package.json for dependencies
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow
$packageContent = Get-Content "package.json" -Raw
if ($packageContent -match '@supabase/supabase-js') {
    Write-Host "  [OK] Supabase installed" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] Supabase not installed" -ForegroundColor Red
}

if ($packageContent -match '@stripe/stripe-js') {
    Write-Host "  [OK] Stripe installed" -ForegroundColor Green  
} else {
    Write-Host "  [MISSING] Stripe not installed" -ForegroundColor Red
}

if ($packageContent -match 'resend') {
    Write-Host "  [OK] Resend installed" -ForegroundColor Green
} else {
    Write-Host "  [MISSING] Resend not installed" -ForegroundColor Red
}

# Check routes
Write-Host "`nChecking routes..." -ForegroundColor Yellow
if (Test-Path "src/routes.ts") {
    $routeContent = Get-Content "src/routes.ts" -Raw
    if ($routeContent -match "dashboard") {
        Write-Host "  [OK] Dashboard route configured" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] Dashboard route not found" -ForegroundColor Red
    }
    
    if ($routeContent -match "admin") {
        Write-Host "  [OK] Admin route configured" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] Admin route not found" -ForegroundColor Red
    }
}

Write-Host "`nSaaS transformation complete!" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure .env.local with your Supabase and Stripe keys"
Write-Host "2. Set up Supabase database with the provided schema"
Write-Host "3. Test authentication and subscription flows"