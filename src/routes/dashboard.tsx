/**
 * SaaS Dashboard - Main user dashboard with metrics and management
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/supabase-auth-context';
import { supabase } from '@/lib/supabase';
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe';
import { formatCredits } from '@/utils/credit-system';

// Simple icon components
const CreditCard = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const Zap = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TrendingUp = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ArrowUpRight = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const Settings = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const Plus = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Sparkles = ({ className = "size-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

interface DashboardStats {
  totalApps: number;
  totalCreditsUsed: number;
  totalStars: number;
  monthlyApps: number;
  monthlyCredits: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        // Get user stats
        const { data: statsData } = await supabase.rpc('get_user_stats', {
          user_id: user.id,
        });

        if (statsData) {
          setStats(statsData);
        }

        // Get recent apps
        const { data: appsData } = await supabase
          .from('apps')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(5);

        if (appsData) {
          setRecentApps(appsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Get current plan info
  const getCurrentPlanInfo = () => {
    if (!profile) return null;
    
    if (profile.plan === 'free') {
      return {
        name: 'Free',
        credits: 45,
        maxApps: 2,
        price: 0,
      };
    }
    
    const planInfo = SUBSCRIPTION_PLANS[profile.plan as keyof typeof SUBSCRIPTION_PLANS];
    return planInfo ? {
      name: planInfo.name,
      credits: planInfo.credits,
      maxApps: planInfo.maxApps,
      price: planInfo.monthlyPrice,
    } : null;
  };

  const currentPlan = getCurrentPlanInfo();
  const creditsPercentage = profile && currentPlan ? 
    Math.round((profile.credits / currentPlan.credits) * 100) : 0;

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-primary/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome back, {profile.full_name?.split(' ')[0] || 'there'}! 👋
            </h1>
            <p className="text-text-primary/70 mt-1">
              Here's what's happening with your account today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link to="/settings">
                <Settings className="size-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild>
              <Link to="/chat/new">
                <Plus className="size-4 mr-2" />
                Create App
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Credits Remaining */}
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-primary">
                Credits Remaining
              </CardTitle>
              <Zap className="size-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {formatCredits(profile.credits)}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-bg-3 rounded-full h-2">
                  <div 
                    className="bg-accent rounded-full h-2 transition-all duration-300"
                    style={{ width: `${creditsPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-text-primary/60">
                  {creditsPercentage}%
                </span>
              </div>
              <p className="text-xs text-text-primary/60 mt-1">
                of {currentPlan ? formatCredits(currentPlan.credits) : 'N/A'} monthly credits
              </p>
            </CardContent>
          </Card>

          {/* Total Apps */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-primary">
                Total Apps
              </CardTitle>
              <TrendingUp className="size-4 text-text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                {stats?.totalApps || 0}
              </div>
              <p className="text-xs text-text-primary/60 mt-1">
                {stats?.monthlyApps || 0} created this month
              </p>
            </CardContent>
          </Card>

          {/* Credits Used */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-primary">
                Credits Used
              </CardTitle>
              <Sparkles className="size-4 text-text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-text-primary">
                {formatCredits(stats?.totalCreditsUsed || 0)}
              </div>
              <p className="text-xs text-text-primary/60 mt-1">
                {formatCredits(stats?.monthlyCredits || 0)} this month
              </p>
            </CardContent>
          </Card>

          {/* Current Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-text-primary">
                Current Plan
              </CardTitle>
              <CreditCard className="size-4 text-text-primary/60" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold text-text-primary">
                  {currentPlan?.name || 'Free'}
                </div>
                {profile.plan !== 'free' && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-primary/60">
                {currentPlan?.price ? formatPrice(currentPlan.price) + '/month' : 'Forever free'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Apps */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-text-primary">
                  Recent Apps
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/apps">
                    View All <ArrowUpRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-bg-3 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-bg-3 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentApps.length > 0 ? (
                <div className="space-y-4">
                  {recentApps.map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-bg-2/50 rounded-lg hover:bg-bg-2 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">
                          {app.title}
                        </h4>
                        <p className="text-sm text-text-primary/60 mt-1">
                          {app.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-text-primary/50">
                          <span>
                            {new Date(app.updated_at).toLocaleDateString()}
                          </span>
                          <span>{app.credits_used} credits used</span>
                          {app.is_public && (
                            <Badge variant="secondary" className="text-xs">
                              Public
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/apps/${app.id}`}>
                          Open <ArrowUpRight className="size-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-text-primary/40 mb-4">
                    <TrendingUp className="size-12 mx-auto" />
                  </div>
                  <h4 className="font-medium text-text-primary mb-2">
                    No apps yet
                  </h4>
                  <p className="text-text-primary/60 text-sm mb-4">
                    Create your first app to see it here.
                  </p>
                  <Button asChild>
                    <Link to="/chat/new">
                      <Plus className="size-4 mr-2" />
                      Create Your First App
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Plan Info */}
          <div className="space-y-6">
            {/* Plan Upgrade CTA (if on free plan) */}
            {profile.plan === 'free' && (
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-text-primary flex items-center gap-2">
                    <Sparkles className="size-5 text-accent" />
                    Upgrade Your Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-text-primary/70 text-sm mb-4">
                    Get more credits, unlimited apps, and advanced features.
                  </p>
                  <Button asChild className="w-full">
                    <Link to="/pricing">
                      View Plans
                      <ArrowUpRight className="size-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-text-primary">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/chat/new">
                    <Plus className="size-4 mr-2" />
                    Create New App
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/apps">
                    <TrendingUp className="size-4 mr-2" />
                    View All Apps
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/settings/billing">
                    <CreditCard className="size-4 mr-2" />
                    Billing & Usage
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/settings">
                    <Settings className="size-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}