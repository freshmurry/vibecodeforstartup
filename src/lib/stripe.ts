/**
 * Stripe Configuration and Utilities
 * Handles subscription management and payments
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Payment features will be disabled.');
}

// Initialize Stripe
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);
  }
  return stripePromise;
};

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    credits: 500,
    maxApps: Infinity,
    features: [
      '500 credits per month',
      'Unlimited apps',
      'All AI models',
      'Priority support',
      'Custom domains',
      'Private projects',
      'Export to GitHub',
    ],
    monthlyPriceId: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    annualPriceId: import.meta.env.VITE_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_pro_annual',
    monthlyPrice: 29,
    annualPrice: 23, // 20% discount
  },
  team: {
    name: 'Team',
    credits: 2000,
    maxApps: Infinity,
    features: [
      '2,000 shared credits per month',
      'Unlimited apps',
      'Everything in Pro',
      '5 team members',
      'Collaboration tools',
      'Team analytics',
      'SSO integration',
    ],
    monthlyPriceId: import.meta.env.VITE_STRIPE_TEAM_MONTHLY_PRICE_ID || 'price_team_monthly',
    annualPriceId: import.meta.env.VITE_STRIPE_TEAM_ANNUAL_PRICE_ID || 'price_team_annual',
    monthlyPrice: 99,
    annualPrice: 79, // 20% discount
  },
} as const;

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

// Subscription management functions
export const createCheckoutSession = async (params: {
  priceId: string;
  userId: string;
  email: string;
  successUrl?: string;
  cancelUrl?: string;
}) => {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
};

export const createCustomerPortalSession = async (customerId: string) => {
  const response = await fetch('/api/stripe/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ customerId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create portal session');
  }

  return response.json();
};

// Helper functions
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
};

export const getPlanByPriceId = (priceId: string) => {
  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (plan.monthlyPriceId === priceId || plan.annualPriceId === priceId) {
      return { 
        key: planKey as PlanType, 
        ...plan,
        isAnnual: plan.annualPriceId === priceId 
      };
    }
  }
  return null;
};

export const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
  const monthlyCost = monthlyPrice * 12;
  const annualCost = annualPrice * 12;
  return monthlyCost - annualCost;
};