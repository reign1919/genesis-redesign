import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import SEO from './SEO';
import { SITE_DOMAIN, getOrganizationSchema, getMainEventSchema } from '../lib/seoData';

describe('SEO Component', () => {
  beforeEach(() => {
    document.title = '';
    const desc = document.head.querySelector('meta[name="description"]');
    if (desc) desc.remove();
    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.remove();
    const robots = document.head.querySelector('meta[name="robots"]');
    if (robots) robots.remove();
    const jsonLd = document.head.querySelector('#seo-jsonld');
    if (jsonLd) jsonLd.remove();
  });

  it('updates document title, description, and canonical URL on production domain', () => {
    render(
      <SEO
        title="Test Page Title — Genesis 2026"
        description="Test page description for Genesis 2026."
        canonical="/events"
      />
    );

    expect(document.title).toBe('Test Page Title — Genesis 2026');

    const descMeta = document.head.querySelector('meta[name="description"]');
    expect(descMeta).not.toBeNull();
    expect(descMeta.getAttribute('content')).toBe('Test page description for Genesis 2026.');

    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    expect(canonicalLink).not.toBeNull();
    expect(canonicalLink.getAttribute('href')).toBe(`${SITE_DOMAIN}/events`);

    const robotsMeta = document.head.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta.getAttribute('content')).toBe('index, follow');
  });

  it('sets noindex directive for protected routes', () => {
    render(
      <SEO
        title="School Dashboard — Genesis 2026"
        canonical="/dashboard"
        noindex={true}
      />
    );

    const robotsMeta = document.head.querySelector('meta[name="robots"]');
    expect(robotsMeta).not.toBeNull();
    expect(robotsMeta.getAttribute('content')).toBe('noindex, nofollow');
  });

  it('injects JSON-LD structured data when provided', () => {
    const orgSchema = getOrganizationSchema();
    render(
      <SEO
        title="Genesis 2026"
        canonical="/"
        jsonLd={orgSchema}
      />
    );

    const scriptEl = document.getElementById('seo-jsonld');
    expect(scriptEl).not.toBeNull();
    expect(scriptEl.type).toBe('application/ld+json');
    expect(JSON.parse(scriptEl.textContent)).toEqual(orgSchema);
  });
});
