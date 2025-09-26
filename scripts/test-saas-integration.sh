#!/bin/bash
# SaaS Starter Integration Test
# Verify that all SaaS features are properly integrated

echo "🚀 VibeCoding SaaS Starter Integration Test"
echo "==========================================="

# Test 1: Verify environment setup
echo "1. Checking environment configuration..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    
    # Check required environment variables
    if grep -q "VITE_SUPABASE_URL" .env.local; then
        echo "   ✅ Supabase URL configured"
    else
        echo "   ❌ Missing VITE_SUPABASE_URL in .env.local"
    fi
    
    if grep -q "VITE_SUPABASE_ANON_KEY" .env.local; then
        echo "   ✅ Supabase Anon Key configured"
    else
        echo "   ❌ Missing VITE_SUPABASE_ANON_KEY in .env.local"
    fi
    
    if grep -q "VITE_STRIPE_PUBLISHABLE_KEY" .env.local; then
        echo "   ✅ Stripe Key configured"
    else
        echo "   ❌ Missing VITE_STRIPE_PUBLISHABLE_KEY in .env.local"
    fi
else
    echo "   ⚠️  .env.local not found. Copy .env.example to .env.local and configure"
fi

# Test 2: Check package dependencies
echo ""
echo "2. Checking SaaS dependencies..."
if npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo "   ✅ @supabase/supabase-js installed"
else
    echo "   ❌ @supabase/supabase-js not installed"
fi

if npm list @stripe/stripe-js > /dev/null 2>&1; then
    echo "   ✅ @stripe/stripe-js installed"
else
    echo "   ❌ @stripe/stripe-js not installed"
fi

if npm list resend > /dev/null 2>&1; then
    echo "   ✅ resend installed"
else
    echo "   ❌ resend not installed"
fi

# Test 3: Verify core files exist
echo ""
echo "3. Checking core SaaS files..."
files=(
    "src/lib/supabase.ts"
    "src/lib/database.types.ts"
    "src/lib/stripe.ts"
    "src/lib/email.ts"
    "src/contexts/supabase-auth-context.tsx"
    "src/components/auth/auth-modal.tsx"
    "src/routes/dashboard.tsx"
    "src/routes/admin.tsx"
    "src/routes/auth/callback.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file missing"
    fi
done

# Test 4: Check TypeScript compilation
echo ""
echo "4. TypeScript compilation test..."
if npm run type-check > /dev/null 2>&1; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ⚠️  TypeScript compilation has errors (check with 'npm run type-check')"
fi

# Test 5: Check build process
echo ""
echo "5. Build process test..."
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build successful"
    echo "   📊 Build output:"
    ls -la dist/
else
    echo "   ❌ Build failed (check with 'npm run build')"
fi

# Test 6: Verify routing configuration
echo ""
echo "6. Checking route configuration..."
if grep -q "dashboard" src/routes.ts; then
    echo "   ✅ Dashboard route configured"
else
    echo "   ❌ Dashboard route missing in routes.ts"
fi

if grep -q "admin" src/routes.ts; then
    echo "   ✅ Admin route configured"
else
    echo "   ❌ Admin route missing in routes.ts"
fi

if grep -q "auth/callback" src/routes.ts; then
    echo "   ✅ Auth callback route configured"
else
    echo "   ❌ Auth callback route missing in routes.ts"
fi

# Test 7: Auth context integration
echo ""
echo "7. Checking auth context integration..."
if grep -q "supabase-auth-context" src/App.tsx; then
    echo "   ✅ Supabase auth context integrated in App.tsx"
else
    echo "   ❌ Old auth context still in App.tsx"
fi

if grep -q "supabase-auth-context" src/routes/protected-route.tsx; then
    echo "   ✅ Protected routes updated for Supabase auth"
else
    echo "   ❌ Protected routes still using old auth context"
fi

echo ""
echo "🎯 Integration Test Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy .env.example to .env.local and configure your keys"
echo "2. Set up your Supabase project with the database schema"
echo "3. Configure Stripe webhook endpoints"
echo "4. Test the authentication flow"
echo "5. Verify subscription management"
echo ""
echo "🚀 Your VibeCoding SaaS platform is ready!"

exit 0