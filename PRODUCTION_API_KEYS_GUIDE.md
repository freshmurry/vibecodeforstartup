# 🔐 Production API Keys & Secrets Setup Guide

This comprehensive guide covers all the API keys, tokens, and secrets required for production deployment of the VibeCoding SaaS platform.

## 📋 Required API Keys & Secrets

### 🤖 AI Model Providers

#### Core AI Models (Required)
```bash
# Primary AI providers for code generation
wrangler secret put ANTHROPIC_API_KEY        # Claude models
wrangler secret put OPENAI_API_KEY           # GPT models
wrangler secret put GOOGLE_AI_STUDIO_API_KEY # Gemini models
```

#### Additional AI Providers (Optional)
```bash
# Extended AI model support
wrangler secret put OPENROUTER_API_KEY       # Multiple models via OpenRouter
wrangler secret put CEREBRAS_API_KEY         # High-performance inference
wrangler secret put GROQ_API_KEY            # Fast inference
```

**Where to get these:**
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) → API Keys
- **OpenAI**: [platform.openai.com](https://platform.openai.com) → API Keys
- **Google AI Studio**: [aistudio.google.com](https://aistudio.google.com) → Get API Key
- **OpenRouter**: [openrouter.ai](https://openrouter.ai) → API Keys
- **Cerebras**: [cloud.cerebras.ai](https://cloud.cerebras.ai) → API Keys
- **Groq**: [console.groq.com](https://console.groq.com) → API Keys

### 🔐 Authentication & Security

#### JWT & Encryption (Critical)
```bash
# Generate strong random strings (32+ characters each)
wrangler secret put JWT_SECRET               # JWT token signing
wrangler secret put SECRETS_ENCRYPTION_KEY   # Encrypt user secrets
wrangler secret put WEBHOOK_SECRET          # Webhook validation
wrangler secret put ENTROPY_KEY             # Additional entropy
```

**Generate secure secrets:**
```bash
# Use a secure random generator
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Or use online generators like: https://www.random.org/strings/
```

#### OAuth Providers
```bash
# Google OAuth (for user authentication)
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET

# GitHub OAuth (for user authentication & code export)
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# GitHub Exporter (separate app for code export)
wrangler secret put GITHUB_EXPORTER_CLIENT_ID
wrangler secret put GITHUB_EXPORTER_CLIENT_SECRET
```

**OAuth Setup:**
- **Google**: [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
- **GitHub**: [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps

### 💳 SaaS Platform Services

#### Supabase (Database & Auth)
```bash
# Frontend environment variables (set in .env.local)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Setup:**
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → API → Copy URL and anon key
3. Run the provided SQL schema to create tables

#### Stripe (Payments)
```bash
# Frontend environment variables (set in .env.local)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Stripe price IDs for subscription tiers
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Worker secrets (payment processing)
wrangler secret put STRIPE_SECRET_KEY        # sk_live_...
wrangler secret put STRIPE_WEBHOOK_SECRET    # whsec_...
```

**Setup:**
1. Create account at [stripe.com](https://stripe.com)
2. Dashboard → Developers → API keys
3. Create products and prices for subscription tiers
4. Set up webhooks for subscription events

#### Resend (Email Service)
```bash
# Frontend environment variable (set in .env.local)
VITE_RESEND_API_KEY=re_...

# Worker secret (server-side email sending)
wrangler secret put RESEND_API_KEY
```

**Setup:**
1. Create account at [resend.com](https://resend.com)
2. Generate API key in dashboard
3. Set up domain for sending emails

### ☁️ Cloudflare Services

#### Core Platform
```bash
# Cloudflare API access (for deployment & management)
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ACCOUNT_ID

# AI Gateway (optional - for AI request analytics)
wrangler secret put CLOUDFLARE_AI_GATEWAY_URL
wrangler secret put CLOUDFLARE_AI_GATEWAY_TOKEN

# Access (for securing admin features)
wrangler secret put CF_ACCESS_ID
wrangler secret put CF_ACCESS_SECRET
```

### 🔍 Additional Services

#### Search & Analytics
```bash
# SerpAPI (for web search features)
wrangler secret put SERPAPI_KEY

# Sentry (error tracking)
wrangler secret put SENTRY_DSN
```

#### Sandbox Environment
```bash
# Container sandbox API (if using external sandbox)
wrangler secret put SANDBOX_SERVICE_API_KEY
wrangler secret put SANDBOX_SERVICE_URL
wrangler secret put SANDBOX_SERVICE_TYPE
```

## 🚀 Deployment Commands

### Set All Required Secrets (Minimum)
```bash
# Core AI models
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_AI_STUDIO_API_KEY

# Security
wrangler secret put JWT_SECRET
wrangler secret put SECRETS_ENCRYPTION_KEY
wrangler secret put WEBHOOK_SECRET

# OAuth
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET

# SaaS Services
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put RESEND_API_KEY

# Cloudflare
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

### Frontend Environment Variables (.env.local)
```bash
# Create .env.local with these variables:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
VITE_RESEND_API_KEY=re_...
```

## 📋 Configuration Checklist

### Pre-Deployment Verification
- [ ] All AI model API keys obtained and tested
- [ ] Security secrets generated (32+ characters each)
- [ ] OAuth applications created and configured
- [ ] Supabase project created with schema deployed
- [ ] Stripe products and prices configured
- [ ] Resend domain verified and API key generated
- [ ] Cloudflare API token with necessary permissions
- [ ] Frontend environment variables set in .env.local
- [ ] All secrets uploaded to Cloudflare Workers

### Post-Deployment Testing
- [ ] AI code generation working
- [ ] User authentication (email, Google, GitHub)
- [ ] Subscription signup and payment processing
- [ ] Email notifications sending
- [ ] Admin dashboard accessible
- [ ] Error tracking and monitoring active

## 🔧 Development vs Production

### Development (.env.local)
Use test/sandbox versions of all services:
- Stripe test keys (`pk_test_`, `sk_test_`)
- Development OAuth redirect URLs
- Local Supabase instance or development project

### Production
Use live API keys and production configurations:
- Live Stripe keys (`pk_live_`, `sk_live_`)
- Production OAuth redirect URLs
- Production Supabase project
- Verified email domains in Resend

## ⚡ Quick Start Commands

```bash
# 1. Set minimum required secrets for basic functionality
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put SECRETS_ENCRYPTION_KEY

# 2. Deploy the application
bun run deploy

# 3. Test the deployment
curl https://your-domain.workers.dev/health
```

## 🆘 Troubleshooting

### Common Issues
1. **JWT_SECRET not configured**: Generate a secure 32+ character string
2. **Supabase connection failed**: Check URL and anon key in .env.local
3. **Stripe payments failing**: Verify publishable/secret key pair match
4. **OAuth redirect mismatch**: Update redirect URLs in provider settings
5. **Email delivery issues**: Confirm domain verification in Resend

### Debug Commands
```bash
# Check deployed secrets (will show if they exist but not values)
wrangler secret list

# View environment variables
wrangler secret list --name vibecodeforstartup

# Test deployment
curl https://your-domain.workers.dev/api/health
```

---

🎉 **Ready for Production!** With all these API keys configured, your VibeCoding SaaS platform will have full functionality including AI code generation, user authentication, subscription billing, and email notifications.