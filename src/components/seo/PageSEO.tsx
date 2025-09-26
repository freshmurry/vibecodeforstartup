import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';

interface StructuredData {
  [key: string]: any;
}

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  structuredData?: StructuredData[];
}

// SEO data for different pages
const PAGE_SEO_DATA = {
  '/': {
    title: 'VibeCoding - AI-Powered App Development Platform',
    description: 'Build production-ready apps from idea to deployment with AI assistance. Code generation, templates, and deployment in minutes.',
    keywords: 'AI development, app builder, code generation, startup tools, React, TypeScript, no-code, low-code'
  },
  '/pricing': {
    title: 'Pricing Plans - VibeCoding',
    description: 'Choose the perfect plan for your development needs. From free tier to enterprise solutions with AI code generation and deployment.',
    keywords: 'pricing, plans, subscription, AI development cost, startup pricing, developer tools pricing'
  },
  '/enterprise': {
    title: 'Enterprise Solutions - VibeCoding',
    description: 'Scale your development team with enterprise-grade AI tools. Custom integrations, priority support, and advanced security.',
    keywords: 'enterprise development, team collaboration, AI tools for enterprise, custom development solutions'
  },
  '/resources': {
    title: 'Developer Resources - VibeCoding',
    description: 'Comprehensive guides, tutorials, and resources for building apps with AI. Documentation, examples, and best practices.',
    keywords: 'developer resources, tutorials, documentation, guides, AI development resources, learning materials'
  },
  '/learn': {
    title: 'Learn AI Development - VibeCoding',
    description: 'Master AI-powered development with our comprehensive learning resources. Tutorials, courses, and hands-on examples.',
    keywords: 'learn AI development, coding tutorials, AI programming courses, development education, tech learning'
  },
  '/discover': {
    title: 'Discover Apps - VibeCoding',
    description: 'Explore amazing apps created by the VibeCoding community. Get inspired and find templates for your next project.',
    keywords: 'discover apps, community apps, app templates, inspiration, app gallery'
  }
};

export function PageSEO({ 
  title, 
  description, 
  keywords, 
  image = 'https://vibesdk.com/og-image.jpg',
  type = 'website',
  noindex = false,
  structuredData = []
}: PageSEOProps) {
  const location = useLocation();
  
  // Get page-specific data or use props
  const pageData = PAGE_SEO_DATA[location.pathname as keyof typeof PAGE_SEO_DATA];
  const finalTitle = title || pageData?.title || 'VibeCoding - AI-Powered App Development';
  const finalDescription = description || pageData?.description || 'Build production-ready apps with AI assistance';
  const finalKeywords = keywords || pageData?.keywords || 'AI development, app builder, code generation';
  
  const currentUrl = `${window.location.origin}${location.pathname}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={noindex ? 'noindex,follow' : 'index,follow'} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="VibeCoding" />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={finalTitle} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@vibecoding" />
      <meta name="twitter:site" content="@vibecoding" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}