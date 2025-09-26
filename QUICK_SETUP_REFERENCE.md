# 🚀 Quick Setup Reference Card

## Essential Commands

### Setup Secrets (PowerShell)
```powershell
# Interactive setup
.\scripts\setup-production-secrets.ps1

# Auto-generate security secrets
.\scripts\setup-production-secrets.ps1 -AutoGenerate

# Skip optional services
.\scripts\setup-production-secrets.ps1 -SkipOptional
```

### Setup Secrets (Bash)
```bash
# Make script executable
chmod +x scripts/setup-production-secrets.sh

# Run interactive setup
./scripts/setup-production-secrets.sh
```

### Validate Configuration
```powershell
# Check all secrets are configured
.\scripts\validate-production-secrets.ps1
```

### Manual Secret Commands
```bash
# Core required secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY
wrangler secret put GOOGLE_AI_STUDIO_API_KEY
wrangler secret put JWT_SECRET
wrangler secret put SECRETS_ENCRYPTION_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put RESEND_API_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
wrangler secret put CLOUDFLARE_ACCOUNT_ID

# OAuth secrets
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## Required .env.local Variables

```bash
# Supabase (Database & Auth)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_PRO_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
VITE_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...

# Email Service
VITE_RESEND_API_KEY=re_...
```

## Pre-Deployment Checklist

- [ ] **AI Models**: At least one of Anthropic/OpenAI/Google API keys
- [ ] **Security**: JWT_SECRET & SECRETS_ENCRYPTION_KEY (auto-generated)
- [ ] **OAuth**: Google/GitHub client IDs and secrets
- [ ] **Payments**: Stripe secret key + publishable key + price IDs
- [ ] **Email**: Resend API key
- [ ] **Platform**: Cloudflare API token + account ID
- [ ] **Database**: Supabase URL + anon key in .env.local
- [ ] **Frontend**: All VITE_ variables in .env.local

## Service Setup URLs

| Service | Setup URL | Get Keys |
|---------|-----------|----------|
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com) | API Keys |
| **OpenAI** | [platform.openai.com](https://platform.openai.com) | API Keys |
| **Google AI** | [aistudio.google.com](https://aistudio.google.com) | Get API Key |
| **Supabase** | [supabase.com](https://supabase.com) | Settings → API |
| **Stripe** | [stripe.com](https://stripe.com) | Developers → API keys |
| **Resend** | [resend.com](https://resend.com) | API Keys |
| **Google OAuth** | [console.cloud.google.com](https://console.cloud.google.com) | APIs & Services → Credentials |
| **GitHub OAuth** | [github.com/settings/developers](https://github.com/settings/developers) | OAuth Apps |

## Deployment Flow

1. **Configure Secrets** → Run setup script
2. **Validate Setup** → Run validation script  
3. **Deploy** → `bun run deploy`
4. **Test** → Visit deployed URL and test features

## Troubleshooting

```bash
# Check deployed secrets exist (shows names only)
wrangler secret list

# View deployment logs
wrangler tail

# Check deployment health
curl https://your-domain.workers.dev/health
```

---
📚 **Full Documentation**: See `PRODUCTION_API_KEYS_GUIDE.md` for complete setup instructions.