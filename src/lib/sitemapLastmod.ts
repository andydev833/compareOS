/**
 * sitemap.xmlのlastmodを、各市場・企業が既に保持しているcheckedDate/sources[].checkedDate
 * から導出する。新しい日付データを作らず、既存の「情報確認日」をそのまま再利用する。
 */
import { markets } from '../data/markets.js';
import { companiesByMarket } from '../data/companies/other-markets.js';
import { airconCompanies } from '../data/companies/commercial-aircon.js';
import { loadJsonMarkets } from './loadMarkets.js';
import { pagePath } from './pagePath.js';
import { getLatestCheckedDate } from '../utils/dates.js';
import type { Company } from '../data/types.js';

const AIRCON_SLUG = 'commercial-aircon';
const AIRCON_SUB_PATHS = ['/companies/', '/cost/', '/faq/', '/guide/'];
const GENERIC_SUB_PATHS = ['/cost/', '/guide/'];

function companyLastmod(company: Company, fallback: string): string {
  return getLatestCheckedDate([company], fallback);
}

function buildLastmodMap(): Map<string, string> {
  const map = new Map<string, string>();

  for (const market of markets) {
    if (market.slug === AIRCON_SLUG) continue;
    const companies = companiesByMarket[market.id] || [];
    const marketLastmod = getLatestCheckedDate(companies, market.checkedDate);
    map.set(`/${market.slug}/`, marketLastmod);
    for (const subPath of GENERIC_SUB_PATHS) {
      map.set(`/${market.slug}${subPath}`, marketLastmod);
    }
    for (const company of companies) {
      map.set(`/${market.slug}/company/${company.slug}/`, companyLastmod(company, marketLastmod));
    }
  }

  const aircon = markets.find((m) => m.slug === AIRCON_SLUG);
  if (aircon) {
    const airconLastmod = getLatestCheckedDate(airconCompanies, aircon.checkedDate);
    map.set(`/${AIRCON_SLUG}/`, airconLastmod);
    for (const subPath of AIRCON_SUB_PATHS) {
      map.set(`/${AIRCON_SLUG}${subPath}`, airconLastmod);
    }
    for (const company of airconCompanies) {
      map.set(`/${AIRCON_SLUG}/company/${company.slug}/`, companyLastmod(company, airconLastmod));
    }
  }

  for (const jm of loadJsonMarkets()) {
    const marketLastmod = jm.market.checkedDate;
    for (const page of jm.pages) {
      map.set(pagePath(jm.market.slug, page.slug), marketLastmod);
    }
    for (const company of jm.companies) {
      map.set(`/${jm.market.slug}/company/${company.slug}/`, companyLastmod(company, marketLastmod));
    }
  }

  return map;
}

let cachedMap: Map<string, string> | null = null;

export function getSitemapLastmod(url: string): string | null {
  if (!cachedMap) cachedMap = buildLastmodMap();
  const path = new URL(url).pathname;
  return cachedMap.get(path) ?? null;
}
