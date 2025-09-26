# VibeCoding Platform - SaaS Transformation 🚀

This document describes the comprehensive SaaS transformation applied to the **VibeCoding platform** itself, converting it from a free development tool into a fully monetized, subscription-based service with robust authentication, billing, and user management.

> **Note**: This is different from the `templates/saas-starter/` directory, which contains an Astro-based template for creating new SaaS projects. This document covers the React/Vite-based SaaS features integrated directly into the VibeCoding platform.

## 🌟 Features Added to VibeCoding

### 🔐 Authentication & User Management
- **Supabase Authentication** - OAuth (Google, GitHub) + email/password
- **User Profiles** - Complete profile management with avatars
- **Role-based Access Control** - Admin, Pro, Team, Enterprise tiers
- **Session Management** - Secure, persistent authentication
- **Email Verification** - Production-ready email flows

### 💳 Subscription & Billing
- **Stripe Integration** - Complete payment processing
- **Tiered Plans** - Free, Pro ($29.99), Team ($79.99), Enterprise ($199.99)
- **Credit-based System** - Usage tracking and limits
- **Subscription Management** - Upgrades, downgrades, cancellations
- **Webhook Handling** - Real-time subscription updates

### 📊 Analytics & Management
- **User Dashboard** - Credit usage, subscription status, analytics
- **Admin Dashboard** - Platform management, user analytics, revenue tracking
- **Usage Tracking** - Detailed API usage and credit consumption
- **Email Notifications** - Welcome emails, credit alerts, subscription updates

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first approach
- **Dark/Light Themes** - User preference support
- **Modern Components** - Shadcn/ui component library
- **Professional Branding** - SaaS-focused design system

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Payments**: Stripe
- **Email**: Resend + React Email
- **Styling**: Tailwind CSS + Shadcn/ui

### Key Components

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client configuration
│   ├── database.types.ts    # TypeScript database schemas
│   ├── stripe.ts           # Stripe payment utilities
│   └── email.ts            # Email templates and sending
├── contexts/
│   └── supabase-auth-context.tsx  # Authentication context
├── components/
│   ├── auth/
│   │   ├── auth-modal.tsx   # Modern auth modal
│   │   └── AuthModalProvider.tsx
├── routes/
│   ├── dashboard.tsx        # User dashboard
│   ├── admin.tsx           # Admin dashboard
│   └── auth/
│       └── callback.tsx     # OAuth callback handler
```

## 🚀 Quick Start

### 1. Environment Setup

Copy `.env.example` to `.env.local` and configure:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# Site Configuration
VITE_SITE_URL=http://localhost:5174
VITE_SITE_NAME="VibeCoding for Startups"
```

### 2. Database Setup

Run this SQL in your Supabase SQL editor:

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  credits integer default 1000,
  plan text default 'free' check (plan in ('free', 'pro', 'team', 'enterprise')),
  subscription_id text,
  subscription_status text check (subscription_status in ('active', 'canceled', 'past_due', 'unpaid')),
  trial_ends_at timestamp with time zone,
  onboarding_completed boolean default false,
  preferences jsonb default '{}'::jsonb,
  primary key (id)
);

-- Subscriptions table
create table subscriptions (
  id text primary key,
  user_id uuid references profiles(id) on delete cascade,
  plan_id text not null,
  status text not null,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Usage records table
create table usage_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  credits_used integer not null default 0,
  operation_type text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Audit logs table
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  resource_type text,
  resource_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table usage_records enable row level security;
alter table audit_logs enable row level security;

-- Policies for profiles
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Policies for subscriptions  
create policy "Users can view own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);

-- Policies for usage records
create policy "Users can view own usage" on usage_records
  for select using (auth.uid() = user_id);

-- Function to handle new user registration
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### 3. Stripe Setup

1. Create products in Stripe Dashboard:
   - **Pro Plan**: $29.99/month - `price_pro_monthly`
   - **Team Plan**: $79.99/month - `price_team_monthly` 
   - **Enterprise Plan**: $199.99/month - `price_enterprise_monthly`

2. Configure webhooks to point to your app:
   - `http://yourapp.com/api/stripe/webhooks`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run integration test
./scripts/test-integration.ps1  # Windows
./scripts/test-saas-integration.sh  # Linux/Mac
```

## 🎯 User Flows

### New User Registration
1. User clicks "Sign Up" → Auth Modal opens
2. User chooses OAuth (Google/GitHub) or email/password
3. Supabase handles authentication + email verification
4. Profile created with 1000 free credits
5. Welcome email sent via Resend
6. Redirected to onboarding/dashboard

### Subscription Flow
1. User visits `/pricing` page
2. Selects plan → Stripe Checkout
3. Payment processed → Webhook updates subscription
4. Credits allocated based on plan
5. Confirmation email sent
6. Dashboard updated with new limits

### Credit Management
1. Each API call deducts credits
2. Usage tracked in `usage_records` table
3. Real-time credit display in dashboard
4. Alert emails when credits run low
5. Automatic upgrade prompts

## � Related Documentation

- **[Main README](./README.md)** - VibeCoding platform overview and deployment
- **[Astro SaaS Template](./templates/saas-starter/README.md)** - Template for new SaaS projects
- **[Documentation Index](./docs/DOCUMENTATION_INDEX.md)** - Complete documentation guide

## �🔧 Configuration

### Subscription Plans

Edit `src/lib/stripe.ts` to modify plans:

```typescript
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    credits: 1000,
    price: 0,
    features: ['Basic AI chat', '5 apps', 'Community support']
  },
  pro: {
    name: 'Pro',  
    credits: 10000,
    price: 29.99,
    stripePriceId: 'price_pro_monthly',
    features: ['Advanced AI', '50 apps', 'Priority support', 'Custom templates']
  }
  // ... more plans
};
```

### Email Templates

Customize emails in `src/lib/email.ts`:

```typescript
export async function sendWelcomeEmail({ to, name }: WelcomeEmailData) {
  // Customize welcome email template
}

export async function sendCreditAlertEmail({ to, remainingCredits }: CreditAlertEmailData) {
  // Customize credit alert template  
}
```

## 📊 Admin Features

### Admin Dashboard (`/admin`)
- **User Management**: View all users, subscriptions, usage
- **Analytics**: Revenue tracking, user growth, credit consumption
- **Support Tools**: User impersonation, manual credit adjustments
- **System Health**: Database stats, API performance

Access requires admin role in user profile.

## 🔐 Security Features

- **Row Level Security**: Supabase RLS policies protect user data
- **Input Validation**: Comprehensive validation on all forms
- **Rate Limiting**: Prevent API abuse and spam
- **Audit Logging**: Track all user actions and changes
- **Secure Sessions**: JWT-based authentication with refresh tokens

## 🚀 Deployment

### Environment Variables (Production)
```bash
# Use production URLs and keys
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
VITE_SITE_URL=https://yourapp.com
```

### Vercel Deployment
```bash
# Deploy to Vercel
vercel --prod

# Set environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... etc
```

### Cloudflare Workers (Alternative)
Use the existing Cloudflare Workers setup for API routes and webhooks.

## 📈 Monitoring & Analytics

### Key Metrics to Track
- **User Growth**: New registrations, churn rate
- **Revenue**: MRR, subscription conversions
- **Usage**: Credits consumed, API calls, feature adoption
- **Support**: Ticket volume, response times

### Tools Integration
- **Analytics**: Google Analytics 4, Mixpanel
- **Error Monitoring**: Sentry (already configured)
- **Uptime**: Pingdom, StatusPage
- **Customer Support**: Intercom, Crisp

## 🆘 Support & Maintenance

### Common Issues
1. **Auth Errors**: Check Supabase URL/keys in environment
2. **Stripe Webhooks**: Verify endpoint URL and signing secret
3. **Email Delivery**: Confirm Resend API key and domain setup
4. **Build Errors**: Run `npm run type-check` for TypeScript issues

### Database Maintenance
```sql
-- Clean up old usage records (monthly)
DELETE FROM usage_records WHERE created_at < NOW() - INTERVAL '90 days';

-- Update user credit limits
UPDATE profiles SET credits = credits + 1000 WHERE plan = 'pro';
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 Success! 

Your VibeCoding platform is now a fully-functional SaaS application with:

✅ **Professional Authentication** - No more CSRF token errors  
✅ **Subscription Billing** - Recurring revenue with Stripe  
✅ **User Management** - Comprehensive admin tools  
✅ **Credit System** - Usage-based monetization  
✅ **Modern UI** - Professional SaaS design  
✅ **Email System** - Transactional email automation  
✅ **Analytics** - Revenue and usage tracking  
✅ **Security** - Production-ready security measures  

**Ready to launch your SaaS! 🚀**

---

## 🎯 Want to Create a New SaaS Project?

If you're looking to create a brand new SaaS application from scratch, check out our **Astro-based SaaS Starter Template**:

📁 **Template Location**: [`templates/saas-starter/`](./templates/saas-starter/)

This template includes:
- ⚡ **Astro + React** - Modern web framework with React components
- 🔐 **Supabase Auth** - Complete authentication system
- 💳 **Stripe Billing** - Subscription management
- 📧 **Email System** - Transactional emails with Resend
- 🎨 **shadcn/ui** - Beautiful UI components
- 📊 **Admin Dashboard** - User management and analytics
- 🧪 **Testing Setup** - Vitest + Playwright
- 🚀 **Deploy Ready** - Vercel, Netlify, Cloudflare

Perfect for launching new SaaS products quickly!