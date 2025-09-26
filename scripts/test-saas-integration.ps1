# VibeCoding SaaS Starter Integration Test (PowerShell)
# Verify that all SaaS features are properly integrated

Write-Host "🚀 VibeCoding SaaS Starter Integration Test" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Test 1: Verify environment setup
Write-Host "`n1. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "   ✅ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing VITE_SUPABASE_URL in .env.local" -ForegroundColor Red
    }
    
    if ($envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "   ✅ Supabase Anon Key configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing VITE_SUPABASE_ANON_KEY in .env.local" -ForegroundColor Red
    }
    
    if ($envContent -match "VITE_STRIPE_PUBLISHABLE_KEY") {
        Write-Host "   ✅ Stripe Key configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Missing VITE_STRIPE_PUBLISHABLE_KEY in .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  .env.local not found. Copy .env.example to .env.local and configure" -ForegroundColor Yellow
}

# Test 2: Check package dependencies
Write-Host "`n2. Checking SaaS dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

if ($packageJson.dependencies.'@supabase/supabase-js') {
    Write-Host "   ✅ @supabase/supabase-js installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ @supabase/supabase-js not installed" -ForegroundColor Red
}

if ($packageJson.dependencies.'@stripe/stripe-js') {
    Write-Host "   ✅ @stripe/stripe-js installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ @stripe/stripe-js not installed" -ForegroundColor Red
}

if ($packageJson.dependencies.'resend') {
    Write-Host "   ✅ resend installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ resend not installed" -ForegroundColor Red
}

# Test 3: Verify core files exist
Write-Host "`n3. Checking core SaaS files..." -ForegroundColor Yellow
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
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file missing" -ForegroundColor Red
    }
}

# Test 4: Check routing configuration
Write-Host "`n4. Checking route configuration..." -ForegroundColor Yellow
if (Test-Path "src/routes.ts") {
    $routesContent = Get-Content "src/routes.ts" -Raw
    
    if ($routesContent -match "dashboard") {
        Write-Host "   ✅ Dashboard route configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Dashboard route missing in routes.ts" -ForegroundColor Red
    }
    
    if ($routesContent -match "admin") {
        Write-Host "   ✅ Admin route configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Admin route missing in routes.ts" -ForegroundColor Red
    }
    
    if ($routesContent -match "auth/callback") {
        Write-Host "   ✅ Auth callback route configured" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Auth callback route missing in routes.ts" -ForegroundColor Red
    }
}

# Test 5: Auth context integration
Write-Host "`n5. Checking auth context integration..." -ForegroundColor Yellow
if (Test-Path "src/App.tsx") {
    $appContent = Get-Content "src/App.tsx" -Raw
    if ($appContent -match "supabase-auth-context") {
        Write-Host "   ✅ Supabase auth context integrated in App.tsx" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Old auth context still in App.tsx" -ForegroundColor Red
    }
}

if (Test-Path "src/routes/protected-route.tsx") {
    $protectedRouteContent = Get-Content "src/routes/protected-route.tsx" -Raw
    if ($protectedRouteContent -match "supabase-auth-context") {
        Write-Host "   ✅ Protected routes updated for Supabase auth" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Protected routes still using old auth context" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Integration Test Complete!" -ForegroundColor Cyan
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Copy .env.example to .env.local and configure your keys"
Write-Host "2. Set up your Supabase project with the database schema"
Write-Host "3. Configure Stripe webhook endpoints" 
Write-Host "4. Test the authentication flow"
Write-Host "5. Verify subscription management"
Write-Host "`n🚀 Your VibeCoding SaaS platform is ready!" -ForegroundColor Green

# Additional helpful info
Write-Host "`nDevelopment Commands:" -ForegroundColor Magenta
Write-Host "• npm run dev        - Start development server"
Write-Host "• npm run build      - Build for production"
Write-Host "• npm run type-check - Check TypeScript types"
Write-Host "• npm run preview    - Preview production build"

Write-Host "`nImportant URLs (after setup):" -ForegroundColor Magenta
Write-Host "• http://localhost:5174/dashboard - User Dashboard"
Write-Host "• http://localhost:5174/admin     - Admin Dashboard"
Write-Host "• http://localhost:5174/pricing   - Pricing Plans"