/**
 * Test Authentication System
 * Tests both environment configuration and auth endpoints
 */

console.log('🔍 Testing Hybrid Authentication System...\n');

// Test environment variables
console.log('📱 Frontend Variables (VITE_*):');
const frontendVars = {
  'VITE_SUPABASE_URL': import.meta?.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  'VITE_SUPABASE_ANON_KEY': import.meta?.env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY,
};

Object.entries(frontendVars).forEach(([key, value]) => {
  const status = value && !value.includes('your-') ? '✅' : '❌';
  const maskedValue = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'Not set';
  console.log(`  ${status} ${key}: ${maskedValue}`);
});

// Test worker auth endpoints
console.log('\n🔧 Testing Worker Auth Endpoints:');

async function testWorkerAuth() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5174';
  
  try {
    // Test auth check endpoint
    console.log('  🔍 Testing /api/auth/check...');
    const checkResponse = await fetch(`${baseUrl}/api/auth/check`);
    console.log(`    ${checkResponse.ok ? '✅' : '❌'} Status: ${checkResponse.status}`);
    
    // Test auth providers endpoint  
    console.log('  🔍 Testing /api/auth/providers...');
    const providersResponse = await fetch(`${baseUrl}/api/auth/providers`);
    console.log(`    ${providersResponse.ok ? '✅' : '❌'} Status: ${providersResponse.status}`);
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      console.log(`    📊 Available providers:`, providers);
    }
    
  } catch (error) {
    console.log('    ❌ Worker auth endpoints not available:', error.message);
    console.log('    💡 Make sure your worker is running!');
  }
}

// Test authentication flow
async function testAuthFlow() {
  console.log('\n🧪 Testing Authentication Flow:');
  
  // Test with sample credentials (don't actually register)
  const testEmail = 'test@example.com';
  const testPassword = 'TestPassword123!';
  
  console.log(`  📝 Test credentials: ${testEmail} / ${testPassword}`);
  console.log('  ⚠️  Note: This is a dry run - no actual registration will occur');
  
  // Would test registration endpoint here in a real scenario
  console.log('  � Registration test: Ready (manual testing required)');
  console.log('  🔄 Login test: Ready (manual testing required)');
}

// Run tests
if (typeof window !== 'undefined') {
  // Browser environment
  testWorkerAuth().then(() => testAuthFlow());
} else {
  // Node environment
  console.log('\n💻 Running in Node.js - browser tests skipped');
  testAuthFlow();
}

console.log('\n📋 Recommendations:');
const hasValidFrontend = frontendVars.VITE_SUPABASE_URL && !frontendVars.VITE_SUPABASE_URL.includes('your-');

if (!hasValidFrontend) {
  console.log('  ⚠️  Add VITE_SUPABASE_* variables to .env.local for OAuth fallback');
  console.log('  ✅ Worker auth will work without Supabase configuration');
}

console.log('\n🚀 Next Steps:');
console.log('  1. Start your dev server: npm run dev');
console.log('  2. Open browser and try signing up');
console.log('  3. Check console for "Worker Backend Auth" messages');
console.log('  4. Authentication should work via your worker endpoints!');