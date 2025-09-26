import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router';
import { SEO_CONFIG, DEFAULT_SEO, type SEOData, type StructuredData } from './seo-config';

interface SEOProps extends Partial<SEOData> {
  structuredData?: StructuredData[];
  children?: React.ReactNode;
}

export function SEO({ 
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  siteName = 'VibeCoding',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  canonicalUrl,
  noindex = false,
  nofollow = false,
  structuredData,
  children
}: SEOProps) {
  const location = useLocation();
  
  // Get route-specific SEO data or use provided props
  const routeConfig = SEO_CONFIG[location.pathname] || {};
  const seoData = {
    title: title || routeConfig.title || DEFAULT_SEO.title,
    description: description || routeConfig.description || DEFAULT_SEO.description,
    keywords: keywords || routeConfig.keywords || DEFAULT_SEO.keywords,
    image: image || routeConfig.image || DEFAULT_SEO.image,
    url: url || `${window.location.origin}${location.pathname}`,
    type: type || routeConfig.type || DEFAULT_SEO.type,
    siteName: siteName || routeConfig.siteName || DEFAULT_SEO.siteName,
    author: author || routeConfig.author || DEFAULT_SEO.author,
    publishedTime: publishedTime || routeConfig.publishedTime,
    modifiedTime: modifiedTime || routeConfig.modifiedTime,
    section: section || routeConfig.section,
    tags: tags || routeConfig.tags,
    canonicalUrl: canonicalUrl || routeConfig.canonicalUrl,
    noindex: noindex || routeConfig.noindex || false,
    nofollow: nofollow || routeConfig.nofollow || false,
  };

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      {seoData.keywords && <meta name="keywords" content={seoData.keywords} />}
      {seoData.author && <meta name="author" content={seoData.author} />}
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seoData.canonicalUrl || seoData.url} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:type" content={seoData.type} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:site_name" content={seoData.siteName} />
      {seoData.image && <meta property="og:image" content={seoData.image} />}
      {seoData.image && <meta property="og:image:alt" content={seoData.title} />}
      {seoData.publishedTime && <meta property="article:published_time" content={seoData.publishedTime} />}
      {seoData.modifiedTime && <meta property="article:modified_time" content={seoData.modifiedTime} />}
      {seoData.section && <meta property="article:section" content={seoData.section} />}
      {seoData.tags && seoData.tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      {seoData.image && <meta name="twitter:image" content={seoData.image} />}
      <meta name="twitter:creator" content="@vibecoding" />
      <meta name="twitter:site" content="@vibecoding" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data */}
      {structuredData && structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data)
          }}
        />
      ))}
      
      {children}
    </Helmet>
  );
}

// Hook for easy SEO management
export function useSEO(seoData?: Partial<SEOData>, structuredData?: StructuredData[]) {
  const location = useLocation();
  
  // Auto-update based on route if no specific data provided
  const routeConfig = SEO_CONFIG[location.pathname];
  
  return {
    seoData: { ...routeConfig, ...seoData },
    structuredData,
    SEOComponent: (props: SEOProps) => (
      <SEO {...seoData} {...props} structuredData={structuredData} />
    )
  };
}