import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image,
  url,
  type = 'website',
  author = 'ComponentSearch'
}) => {
  const siteTitle = 'Component Search';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'Find electronic components and parts from trusted suppliers. Search millions of components with real-time availability and pricing.';
  const defaultKeywords = 'electronic components, parts search, IC chips, semiconductors, electronic parts supplier';
  const defaultImage = '/og-image.jpg';
  const baseUrl = 'https://www.componentsearch.com';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <meta name="author" content={author} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || defaultImage} />
      <meta property="og:url" content={url || baseUrl} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || defaultImage} />
      
      {/* Additional SEO Tags */}
      <link rel="canonical" href={url || baseUrl} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Structured Data for Products (JSON-LD) */}
      {type === 'product' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": title,
            "description": description,
            "image": image,
            "brand": {
              "@type": "Brand",
              "name": author
            }
          })}
        </script>
      )}
      
      {/* Structured Data for Organization */}
      {type === 'website' && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": siteTitle,
            "url": baseUrl,
            "logo": `${baseUrl}/logo.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "1-800-PARTS",
              "contactType": "customer service",
              "availableLanguage": ["English"]
            },
            "sameAs": [
              "https://www.facebook.com/componentsearch",
              "https://www.twitter.com/componentsearch",
              "https://www.linkedin.com/company/componentsearch"
            ]
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;