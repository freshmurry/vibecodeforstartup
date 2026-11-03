# Supabase Authentication Setup for Cloudflare Workers

## Quick Fix for "Something went wrong" Error

Your authentication error is caused by missing Supabase configuration in your frontend environment. Since you're using Cloudflare Workers with Variables and Secrets, you need to configure both the worker environment AND the local development environment.

### Current Issue
- Your Supabase credentials are stored in Cloudflare Variables/Secrets (worker-side)
- Your frontend code runs in the browser and needs `VITE_` prefixed environment variables
- The browser can't access Cloudflare worker environment variables directly

### Option 1: Configure Local Development Environment

### Option 1: Configure Local Development Environment

Since your Supabase credentials are in Cloudflare, you need to:

1. **Get Your Cloudflare Supabase Values**:
   - Go to Cloudflare Dashboard → Workers & Pages → Your App → Settings → Variables
   - Copy your `SUPABASE_URL` and `SUPABASE_ANON_KEY` values

2. **Update Your Local `.env.local`**:
   ```bash
   # Frontend environment variables (VITE_ prefix required)
   VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   
   # Backend environment variables (for worker development)
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

3. **Verify Cloudflare Variables**:
   Make sure these are set in your Cloudflare Workers environment:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_ROLE_KEY` (as a Secret)

4. **Development vs Production**:
   - **Local development**: Uses `.env.local` file
   - **Production**: Uses Cloudflare Variables and Secrets

### Option 2: Use Wrangler for Local Development

You can also use Wrangler to sync your Cloudflare environment locally:

1. **Install Wrangler** (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Pull Environment Variables**:
   ```bash
   wrangler secret list
   wrangler secret put VITE_SUPABASE_URL
   wrangler secret put VITE_SUPABASE_ANON_KEY
   ```

### Option 3: Environment Variable Proxy (Advanced)

Create an API endpoint in your worker to serve frontend config:

1. Add to your worker routes:
   ```typescript
   // GET /api/config
   export async function onRequestGet(context) {
     return new Response(JSON.stringify({
       VITE_SUPABASE_URL: context.env.SUPABASE_URL,
       VITE_SUPABASE_ANON_KEY: context.env.SUPABASE_ANON_KEY
     }));
   }
   ```

2. Update frontend to fetch config on startup

5. **Restart Your Development Server**:
   ```bash
   npm run dev
   ```

### Option 4: Use Backend Authentication Only

Since you already have a robust backend authentication system in your worker, you could bypass Supabase entirely:

1. Disable Supabase authentication in the frontend
2. Connect your auth modal directly to your worker endpoints (`/api/auth/register`, `/api/auth/login`)
3. This gives you full control and eliminates the need for frontend Supabase config

**Quick Test**: Try accessing your worker auth endpoints:
- `POST /api/auth/register` - for user registration
- `POST /api/auth/login` - for user login

### Recommended Approach

**For immediate fix**: Use Option 1 - copy your Cloudflare Supabase values to `.env.local`

**For production setup**: Ensure your Cloudflare Variables and Secrets are properly configured

### Check Your Current Cloudflare Setup

In your Cloudflare Dashboard → Workers & Pages → vibecodeforstartup → Settings:

**Variables should include:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Secrets should include:**
- `SUPABASE_SERVICE_ROLE_KEY`
- Any other sensitive keys

### Testing

After setup, try signing up again. You should see:
- ✅ Successful account creation
- ✅ Email confirmation (if enabled)
- ✅ Automatic login after confirmation

### Common Issues

- **"Invalid API key"**: Double-check you copied the anon key correctly
- **CORS errors**: Make sure Site URL is set correctly in Supabase
- **Email not sending**: Check spam folder, or disable email confirmation for testing

### Need Help?

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase project is active (not paused)
3. Ensure your internet connection is stable