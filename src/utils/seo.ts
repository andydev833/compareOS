/**
 * SEO・JSON-LD生成ユーティリティ
 */

import type { Market, Company, SEOConfig } from '../data/types.js';

const SITE_NAME = 'compareOS 大阪法人向けサービス比較';
const SITE_URL = 'https://uto-inc.jp'; // 本番URLに変更

/**
 * ページのSEO設定を生成する
 */
export function generateSEO(config: SEOConfig): SEOConfig {
  return {
    ...config,
    canonical: config.canonical.startsWith('http') 
      ? config.canonical 
      : `${SITE_URL}${config.canonical}`,
  };
}

/**
 * WebSite構造化データ
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: '大阪府を中心とした法人向けサービス会社の比較メディア。設備工事、オフィス、研修、Web集客などのサービス会社を条件から比較できます。',
  };
}

/**
 * Organization構造化データ
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: '大阪を中心とした法人向けサービス比較メディア',
  };
}

/**
 * BreadcrumbList構造化データ
 */
export function getBreadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
    })),
  };
}

/**
 * 市場トップのItemList構造化データ
 */
export function getMarketItemListSchema(market: Pick<Market, 'h1' | 'description' | 'slug'>, companies: Company[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${market.h1} - 掲載企業一覧`,
    description: market.description,
    numberOfItems: companies.length,
    itemListElement: companies.map((company, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: company.name,
      url: `${SITE_URL}/${market.slug}/company/${company.slug}/`,
    })),
  };
}

/**
 * 企業詳細のOrganization構造化データ
 */
export function getCompanySchema(company: Company, _market?: unknown) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: company.officialUrl,
    description: company.overview,
    areaServed: company.region.prefectures,
  };

  if (company.region.headquarters) {
    schema.address = {
      '@type': 'PostalAddress',
      addressRegion: company.region.headquarters,
      addressCountry: 'JP',
    };
  }

  return schema;
}

/**
 * FAQPage構造化データ
 */
export function getFAQSchema(faqs: { question: string; directAnswer: string; detail: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `${faq.directAnswer} ${faq.detail}`,
      },
    })),
  };
}

/**
 * Article構造化データ（費用・選び方ページ用）
 */
export function getArticleSchema(params: {
  title: string;
  description: string;
  url: string;
  dateModified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    url: params.url.startsWith('http') ? params.url : `${SITE_URL}${params.url}`,
    dateModified: params.dateModified,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
