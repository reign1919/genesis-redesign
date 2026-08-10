import { useEffect } from 'react';
import { SITE_DOMAIN, DEFAULT_SEO } from '../lib/seoData';

/**
 * Reusable SEO component for SPA routes.
 * Safely updates or replaces existing <head> metadata without producing duplicate elements.
 */
export default function SEO({
  title,
  description,
  canonical,
  noindex = false,
  ogType = 'website',
  ogImage,
  jsonLd,
}) {
  useEffect(() => {
    const finalTitle = title || DEFAULT_SEO.title;
    const finalDesc = description || DEFAULT_SEO.description;
    const finalOgImage = ogImage
      ? (ogImage.startsWith('http') ? ogImage : `${SITE_DOMAIN}${ogImage}`)
      : `${SITE_DOMAIN}${DEFAULT_SEO.ogImage}`;
    
    // Canonical URL construction
    const canonicalPath = canonical || window.location.pathname + window.location.search;
    const finalCanonicalUrl = canonicalPath.startsWith('http')
      ? canonicalPath
      : `${SITE_DOMAIN}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`;

    // 1. Update Document Title
    document.title = finalTitle;

    // Helper: Update or create <meta> tags
    const updateMeta = (nameAttr, nameVal, contentVal) => {
      let el = document.head.querySelector(`meta[${nameAttr}="${nameVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(nameAttr, nameVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // 2. Standard Meta Tags
    updateMeta('name', 'title', finalTitle);
    updateMeta('name', 'description', finalDesc);
    updateMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // 3. Open Graph Tags
    updateMeta('property', 'og:type', ogType);
    updateMeta('property', 'og:site_name', DEFAULT_SEO.siteName);
    updateMeta('property', 'og:title', finalTitle);
    updateMeta('property', 'og:description', finalDesc);
    updateMeta('property', 'og:url', finalCanonicalUrl);
    updateMeta('property', 'og:image', finalOgImage);

    // 4. Twitter Cards
    updateMeta('name', 'twitter:card', DEFAULT_SEO.twitterCard);
    updateMeta('property', 'twitter:title', finalTitle);
    updateMeta('property', 'twitter:description', finalDesc);
    updateMeta('property', 'twitter:image', finalOgImage);

    // 5. Canonical Link Tag
    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', finalCanonicalUrl);

    // 6. JSON-LD Structured Data
    let scriptEl = document.head.querySelector('#seo-jsonld');
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'seo-jsonld';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [title, description, canonical, noindex, ogType, ogImage, jsonLd]);

  return null;
}
