export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export const DEFAULT_SEO: SEOData = {
  title: 'VibeCoding - AI-Powered App Development Platform',
  description: 'Build production-ready apps from idea to deployment with AI assistance. Code generation, templates, and deployment in minutes.',
  keywords: 'AI development, app builder, code generation, startup tools, React, TypeScript, Cloudflare Workers',
  image: 'https://vibesdk.com/og-image.jpg',
  type: 'website',
  siteName: 'VibeCoding',
  author: 'VibeCoding Team'
};

export const SEO_CONFIG: Record<string, SEOData> = {
  '/': {
    title: 'VibeCoding - AI-Powered App Development Platform',
    description: 'Build production-ready apps from idea to deployment with AI assistance. Code generation, templates, and deployment in minutes.',
    keywords: 'AI development, app builder, code generation, startup tools, React, TypeScript, no-code, low-code',
    type: 'website'
  },
  
  '/pricing': {
    title: 'Pricing Plans - VibeCoding',
    description: 'Choose the perfect plan for your development needs. From free tier to enterprise solutions with AI code generation and deployment.',
    keywords: 'pricing, plans, subscription, AI development cost, startup pricing, developer tools pricing',
    type: 'website'
  },
  
  '/enterprise': {
    title: 'Enterprise Solutions - VibeCoding',
    description: 'Scale your development team with enterprise-grade AI tools. Custom integrations, priority support, and advanced security.',
    keywords: 'enterprise development, team collaboration, AI tools for enterprise, custom development solutions',
    type: 'website'
  },
  
  '/resources': {
    title: 'Developer Resources - VibeCoding',
    description: 'Comprehensive guides, tutorials, and resources for building apps with AI. Documentation, examples, and best practices.',
    keywords: 'developer resources, tutorials, documentation, guides, AI development resources, learning materials',
    type: 'website'
  },
  
  '/learn': {
    title: 'Learn AI Development - VibeCoding',
    description: 'Master AI-powered development with our comprehensive learning resources. Tutorials, courses, and hands-on examples.',
    keywords: 'learn AI development, coding tutorials, AI programming courses, development education, tech learning',
    type: 'website'
  },
  
  '/privacy': {
    title: 'Privacy Policy - VibeCoding',
    description: 'How we protect your privacy and handle your data. Transparent policies for a secure development experience.',
    keywords: 'privacy policy, data protection, security, user privacy, GDPR compliance',
    type: 'website',
    noindex: false
  },
  
  '/terms': {
    title: 'Terms of Service - VibeCoding',
    description: 'Terms and conditions for using VibeCoding platform. Fair and transparent terms for developers and teams.',
    keywords: 'terms of service, user agreement, platform terms, legal terms, service conditions',
    type: 'website',
    noindex: false
  },
  
  '/profile': {
    title: 'User Profile - VibeCoding',
    description: 'Manage your VibeCoding profile, settings, and development preferences.',
    keywords: 'user profile, account settings, developer profile',
    type: 'website',
    noindex: true
  },
  
  '/dashboard': {
    title: 'Dashboard - VibeCoding',
    description: 'Your development dashboard with AI-generated apps, analytics, and project management tools.',
    keywords: 'developer dashboard, project management, AI apps, development analytics',
    type: 'website',
    noindex: true
  },
  
  '/settings': {
    title: 'Settings - VibeCoding',
    description: 'Configure your VibeCoding account settings, preferences, and integrations.',
    keywords: 'account settings, user preferences, app configuration',
    type: 'website',
    noindex: true
  },
  
  '/apps': {
    title: 'My Apps - VibeCoding',
    description: 'Manage your AI-generated applications and projects. Deploy, edit, and share your creations.',
    keywords: 'my apps, project management, AI generated apps, app deployment',
    type: 'website',
    noindex: true
  },
  
  '/discover': {
    title: 'Discover Apps - VibeCoding',
    description: 'Explore amazing apps created by the VibeCoding community. Get inspired and find templates for your next project.',
    keywords: 'discover apps, community apps, app templates, inspiration, app gallery',
    type: 'website'
  },
  
  '/stripe-test': {
    title: 'Stripe Testing Dashboard - VibeCoding',
    description: 'Test Stripe payment integration in sandbox mode. Validate payment flows and subscription handling.',
    keywords: 'stripe testing, payment testing, sandbox mode, development tools',
    type: 'website',
    noindex: true
  }
};

export const STRUCTURED_DATA_TEMPLATES = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VibeCoding',
    description: 'AI-Powered App Development Platform',
    url: 'https://vibesdk.com',
    logo: 'https://vibesdk.com/logo.png',
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'VibeCoding Team'
      }
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@vibesdk.com'
    },
    sameAs: [
      'https://twitter.com/vibecoding',
      'https://github.com/vibecoding',
      'https://discord.gg/vibecoding'
    ]
  },
  
  software: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VibeCoding Platform',
    description: 'AI-Powered App Development Platform for building production-ready applications',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150'
    },
    author: {
      '@type': 'Organization',
      name: 'VibeCoding'
    }
  },
  
  article: (title: string, description: string, publishedTime?: string, modifiedTime?: string, section?: string, tags?: string[]) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Organization',
      name: 'VibeCoding'
    },
    publisher: {
      '@type': 'Organization',
      name: 'VibeCoding',
      logo: {
        '@type': 'ImageObject',
        url: 'https://vibesdk.com/logo.png'
      }
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    articleSection: section,
    keywords: tags?.join(', ')
  })
};