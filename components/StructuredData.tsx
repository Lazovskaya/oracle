export default function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Market Oracle',
    alternateName: 'FinForesee',
    url: 'https://finforesee.com',
    description: 'Professional swing trading analysis using Elliott Wave theory and AI',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://finforesee.com/oracle?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Market Oracle',
    alternateName: 'FinForesee',
    url: 'https://finforesee.com',
    logo: 'https://finforesee.com/logo.png',
    description: 'Professional trading analysis platform using Elliott Wave theory and AI',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@finforesee.com',
      availableLanguage: ['English', 'Russian', 'Spanish', 'French', 'Chinese'],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function ServiceStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Finforesee',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: 'https://finforesee.com',
    description: 'AI-powered market analysis platform for stocks and crypto with Elliott Wave theory. Professional swing trading ideas with clear entry points, stop losses, and profit targets.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free Plan',
        price: '0',
        priceCurrency: 'USD',
        description: 'Access to basic market analysis and predictions',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Premium Plan',
        price: '9',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '9',
          priceCurrency: 'USD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'MON',
          },
        },
        description: 'Monthly subscription with advanced analytics and trade tracking',
        availability: 'https://schema.org/InStock',
      },
      {
        '@type': 'Offer',
        name: 'Pro Plan',
        price: '19',
        priceCurrency: 'USD',
        billingDuration: 'P1M',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '19',
          priceCurrency: 'USD',
          referenceQuantity: {
            '@type': 'QuantitativeValue',
            value: '1',
            unitCode: 'MON',
          },
        },
        description: 'Premium monthly subscription with unlimited access and priority support',
        availability: 'https://schema.org/InStock',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function FAQStructuredData({ faqs }: { faqs: Array<{ q: string; a: string }> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
