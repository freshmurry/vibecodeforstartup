#!/bin/bash

# 🔐 VibeCoding SaaS - Production Secrets Setup Script
# This script helps you set up all the required API keys and secrets for production deployment

set -e

echo "🔐 VibeCoding SaaS - Production Secrets Setup"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Error: Wrangler CLI not found${NC}"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Wrangler
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Error: Not logged in to Wrangler${NC}"
    echo "Please login with: wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI is ready${NC}"
echo ""

# Function to set a secret
set_secret() {
    local name=$1
    local description=$2
    local optional=${3:-false}
    local example=$4
    
    echo -e "${BLUE}🔑 Setting up: ${name}${NC}"
    echo "   Description: ${description}"
    if [ ! -z "$example" ]; then
        echo "   Example: ${example}"
    fi
    echo ""
    
    read -p "   Do you want to set ${name} now? (y/n/s to skip): " response
    
    case $response in
        [yY]*)
            echo "   Enter the value for ${name}:"
            wrangler secret put "$name"
            if [ $? -eq 0 ]; then
                echo -e "   ${GREEN}✅ ${name} set successfully${NC}"
            else
                echo -e "   ${RED}❌ Failed to set ${name}${NC}"
            fi
            ;;
        [sS]*)
            if [ "$optional" = true ]; then
                echo -e "   ${YELLOW}⏭️  Skipped ${name} (optional)${NC}"
            else
                echo -e "   ${YELLOW}⚠️  Skipped ${name} (required for full functionality)${NC}"
            fi
            ;;
        *)
            if [ "$optional" = true ]; then
                echo -e "   ${YELLOW}⏭️  Skipped ${name} (optional)${NC}"
            else
                echo -e "   ${RED}❌ Skipped ${name} (required)${NC}"
            fi
            ;;
    esac
    echo ""
}

# Generate random secret helper
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    elif command -v node &> /dev/null; then
        node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    else
        echo "Please generate a 64-character hex string"
    fi
}

echo "🤖 AI MODEL PROVIDERS"
echo "===================="
set_secret "ANTHROPIC_API_KEY" "Claude models from Anthropic" false "sk-ant-..."
set_secret "OPENAI_API_KEY" "GPT models from OpenAI" false "sk-..."
set_secret "GOOGLE_AI_STUDIO_API_KEY" "Gemini models from Google" false "AI..."

echo "🔐 SECURITY & AUTHENTICATION"
echo "============================"

echo -e "${BLUE}🔑 JWT_SECRET${NC}"
echo "   Description: Secret for signing JWT tokens (required)"
echo ""
read -p "   Generate a random JWT secret automatically? (y/n): " generate_jwt
if [[ $generate_jwt =~ ^[yY] ]]; then
    jwt_secret=$(generate_secret)
    echo "   Generated secret: $jwt_secret"
    echo "$jwt_secret" | wrangler secret put JWT_SECRET
    echo -e "   ${GREEN}✅ JWT_SECRET set successfully${NC}"
else
    set_secret "JWT_SECRET" "Secret for signing JWT tokens (64-character hex string)" false
fi
echo ""

echo -e "${BLUE}🔑 SECRETS_ENCRYPTION_KEY${NC}"
echo "   Description: Key for encrypting user secrets (required)"
echo ""
read -p "   Generate a random encryption key automatically? (y/n): " generate_enc
if [[ $generate_enc =~ ^[yY] ]]; then
    enc_secret=$(generate_secret)
    echo "   Generated key: $enc_secret"
    echo "$enc_secret" | wrangler secret put SECRETS_ENCRYPTION_KEY
    echo -e "   ${GREEN}✅ SECRETS_ENCRYPTION_KEY set successfully${NC}"
else
    set_secret "SECRETS_ENCRYPTION_KEY" "Key for encrypting user secrets (64-character hex string)" false
fi
echo ""

set_secret "WEBHOOK_SECRET" "Secret for webhook validation" false

echo "🔑 OAuth Authentication"
echo "-----------------------"
set_secret "GOOGLE_CLIENT_ID" "Google OAuth client ID" false
set_secret "GOOGLE_CLIENT_SECRET" "Google OAuth client secret" false
set_secret "GITHUB_CLIENT_ID" "GitHub OAuth client ID" false  
set_secret "GITHUB_CLIENT_SECRET" "GitHub OAuth client secret" false

echo "💳 SAAS PLATFORM SERVICES"
echo "========================="
set_secret "STRIPE_SECRET_KEY" "Stripe secret key for payment processing" false "sk_live_..."
set_secret "RESEND_API_KEY" "Resend API key for email service" false "re_..."

echo "☁️ CLOUDFLARE SERVICES"
echo "======================"
set_secret "CLOUDFLARE_API_TOKEN" "Cloudflare API token for platform management" false
set_secret "CLOUDFLARE_ACCOUNT_ID" "Cloudflare account ID" false

echo "🔍 OPTIONAL SERVICES"
echo "===================="
set_secret "OPENROUTER_API_KEY" "OpenRouter for additional AI models" true
set_secret "CEREBRAS_API_KEY" "Cerebras for high-performance inference" true
set_secret "GROQ_API_KEY" "Groq for fast inference" true
set_secret "SERPAPI_KEY" "SerpAPI for web search features" true
set_secret "SENTRY_DSN" "Sentry DSN for error tracking" true
set_secret "CLOUDFLARE_AI_GATEWAY_TOKEN" "AI Gateway token for request analytics" true

echo ""
echo "🎯 FRONTEND ENVIRONMENT VARIABLES"
echo "================================="
echo -e "${YELLOW}⚠️  Don't forget to set up your frontend environment variables!${NC}"
echo ""
echo "Create a .env.local file with:"
echo "VITE_SUPABASE_URL=https://your-project.supabase.co"
echo "VITE_SUPABASE_ANON_KEY=your-anon-key"
echo "VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
echo "VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_..."
echo "VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_..."
echo "VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_..."
echo "VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_..."
echo "VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_..."
echo "VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_..."
echo ""

echo "📋 DEPLOYMENT CHECKLIST"
echo "======================="
echo "□ AI model API keys configured"
echo "□ Security secrets generated and set"
echo "□ OAuth applications created"
echo "□ Supabase project created with schema"
echo "□ Stripe products and prices configured"
echo "□ Resend domain verified"
echo "□ Frontend .env.local file created"
echo "□ Ready to run: bun run deploy"
echo ""

echo -e "${GREEN}🎉 Secret setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create your .env.local file with frontend environment variables"
echo "2. Set up your Supabase database schema"
echo "3. Configure your Stripe products and prices"
echo "4. Run: bun run deploy"
echo ""
echo "For detailed setup instructions, see: PRODUCTION_API_KEYS_GUIDE.md"