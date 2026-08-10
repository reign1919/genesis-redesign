/**
 * SEO Master Configuration & JSON-LD Structured Data Generators for Genesis 2026
 */

export const SITE_DOMAIN = import.meta.env.VITE_SITE_URL || 'https://genesisfest.ivwschool.com';

export const DEFAULT_SEO = {
  title: 'Genesis 2026 — git commit -m "Ideate, Innovate, Inspire"',
  description: 'Genesis 2026 is the premier inter-school tech festival by Indus Valley World School. Explore hackathons, coding contests, robotics wars, cybersecurity CTF, and digital art challenges.',
  siteName: 'Genesis 2026 Tech Fest',
  ogImage: '/og-image.png',
  twitterCard: 'summary_large_image',
};

/**
 * Valid Organization & Event JSON-LD for Genesis 2026
 */
export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  'name': 'Indus Valley World School',
  'url': 'https://www.ivwschool.com',
  'sameAs': [SITE_DOMAIN],
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Kolkata',
    'addressRegion': 'West Bengal',
    'addressCountry': 'IN',
  },
});

export const getMainEventSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  'name': 'Genesis 2026 Tech Fest',
  'description': 'The premier first-edition inter-school tech festival organized by Indus Valley World School featuring 10 flagship, technical, and creative competitions.',
  'startDate': '2026-10-24T09:00:00+05:30',
  'endDate': '2026-10-26T19:00:00+05:30',
  'eventStatus': 'https://schema.org/EventScheduled',
  'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
  'location': {
    '@type': 'Place',
    'name': 'Indus Valley World School',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Kolkata',
      'addressRegion': 'West Bengal',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': 22.4845545,
      'longitude': 88.3960671,
    },
  },
  'organizer': {
    '@type': 'Organization',
    'name': 'The Genesis Council — Indus Valley World School',
    'url': SITE_DOMAIN,
  },
  'performer': {
    '@type': 'PerformingGroup',
    'name': 'Participant Schools & Student Innovators',
  },
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'INR',
    'availability': 'https://schema.org/InStock',
    'url': SITE_DOMAIN,
  },
  'image': `${SITE_DOMAIN}/og-image.png`,
});

export const getSpecificEventSchema = (event) => {
  if (!event) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    'name': `${event.title} — Genesis 2026`,
    'description': event.brief,
    'startDate': '2026-10-24T09:00:00+05:30',
    'endDate': '2026-10-26T19:00:00+05:30',
    'eventStatus': 'https://schema.org/EventScheduled',
    'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
    'location': {
      '@type': 'Place',
      'name': 'Indus Valley World School',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': 'Kolkata',
        'addressRegion': 'West Bengal',
        'addressCountry': 'IN',
      },
    },
    'organizer': {
      '@type': 'Organization',
      'name': 'The Genesis Council',
      'url': SITE_DOMAIN,
    },
    'performer': {
      '@type': 'PerformingGroup',
      'name': 'Participant Schools & Student Innovators',
    },
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'INR',
      'availability': 'https://schema.org/InStock',
      'url': `${SITE_DOMAIN}/events?id=${event.id}`,
    },
    'image': `${SITE_DOMAIN}/og-image.png`,
  };
};
