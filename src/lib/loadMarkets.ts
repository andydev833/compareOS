/**
 * markets/{market-id}/ 配下のJSONを読み込み、Zodで検証し、
 * 既存の Company 型（src/data/types.ts）へ変換する。
 *
 * レガシー市場（src/data/markets.ts / src/data/companies/*.ts）には一切触れない。
 * ここで読み込んだJSON駆動市場は [marketSlug] ルート側でレガシー市場とマージして描画する。
 */
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Company, InfoStatus, MarketCategory, Source } from '../data/types.js';
import {
  marketSchema,
  companiesSchema,
  keywordsSchema,
  pagesSchema,
  type MarketJson,
  type CompanyJson,
  type KeywordsJson,
  type PageJson,
  type SourceJson,
} from './marketSchema.js';

export interface SimpleMarket {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: MarketCategory;
  h1: string;
  catchCopy: string;
  subCopy: string;
  description: string;
  targetRegion: string;
  comparisonItems: string[];
  companyCount: number;
  checkedDate: string;
}

export interface LoadedMarket {
  dir: string;
  market: SimpleMarket;
  companies: Company[];
  keywords: KeywordsJson;
  pages: PageJson[];
}

const MARKETS_ROOT = join(process.cwd(), 'markets');
const COMPARISON_ITEMS = ['初期費用', '月額費用', '成功報酬', '無料相談', 'オンライン対応', '土日対応'];

const SOURCE_LABEL: Record<SourceJson['type'], string> = {
  official: '公式サイト',
  listing: '掲載情報',
  review: '口コミ・レビュー',
  other: 'その他情報源',
};

function formatYen(value: number | null): string {
  if (value === null) return '要問い合わせ';
  return `¥${value.toLocaleString('ja-JP')}`;
}

function formatBoolStatus(value: boolean | null): InfoStatus {
  if (value === null) return '公式サイトで確認できず';
  return value ? '対応' : '非対応';
}

function toLegacySource(source: SourceJson): Source {
  return {
    label: SOURCE_LABEL[source.type] ?? 'その他情報源',
    url: source.url,
    checkedDate: source.checkedAt,
  };
}

function toLegacyCompany(company: CompanyJson, market: MarketJson, marketId: string): Company {
  const prefectures = company.areas.length > 0 ? company.areas : [market.primaryArea];
  const overview =
    company.features.length > 0
      ? `${company.features.slice(0, 2).join('。')}。`
      : `${prefectures.join('・')}で対応。詳細は公式サイトでご確認ください。`;

  const comparisonData: Record<string, InfoStatus | string> = {
    初期費用: formatYen(company.price.initial),
    月額費用: formatYen(company.price.monthly),
    成功報酬: formatYen(company.price.successFee),
    無料相談: formatBoolStatus(company.freeConsultation),
    オンライン対応: formatBoolStatus(company.onlineAvailable),
    土日対応: formatBoolStatus(company.weekendAvailable),
  };

  return {
    id: company.id,
    slug: company.id,
    marketId,
    name: company.name,
    listingType: 'standard',
    status: 'published',
    region: {
      headquarters: company.address ?? '公式サイトで確認できず',
      branches: [],
      prefectures,
      wideAreaKansai: market.secondaryArea ? company.areas.includes(market.secondaryArea) : false,
    },
    overview,
    features: company.features,
    comparisonData,
    services: company.features,
    priceInfo: `初期費用：${formatYen(company.price.initial)}／月額費用：${formatYen(company.price.monthly)}／成功報酬：${formatYen(company.price.successFee)}${company.price.note ? `（${company.price.note}）` : ''}`,
    officialUrl: company.officialUrl,
    sources: company.sources.map(toLegacySource),
  };
}

function toSimpleMarket(market: MarketJson, companies: Company[]): SimpleMarket {
  const slug = market.slug ?? market.id;
  const shortName = market.shortName ?? market.name;
  const targetRegion = market.secondaryArea
    ? `${market.primaryArea}を中心に、${market.secondaryArea}`
    : market.primaryArea;

  const checkedDates = companies
    .flatMap((c) => c.sources.map((s) => s.checkedDate))
    .filter((d): d is string => Boolean(d))
    .sort();
  const checkedDate =
    checkedDates[checkedDates.length - 1] ?? market.updatedAt ?? market.createdAt ?? new Date().toISOString().slice(0, 10);

  return {
    id: market.id,
    slug,
    name: market.name,
    shortName,
    category: market.category,
    h1: market.h1 ?? `${market.primaryArea}の${market.name}を比較`,
    catchCopy: market.catchCopy ?? `${market.primaryArea}の${market.name}を比較`,
    subCopy: market.subCopy ?? '公式サイト等の公開情報を基に整理しています。',
    description:
      market.description ?? `${market.primaryArea}${market.secondaryArea ? `・${market.secondaryArea}` : ''}で${market.name}の情報を整理しています。`,
    targetRegion,
    comparisonItems: COMPARISON_ITEMS,
    companyCount: companies.length,
    checkedDate,
  };
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

let cache: LoadedMarket[] | null = null;

/**
 * markets 配下の各ディレクトリを読み込み、Zod検証・型変換したうえで返す。
 * 不正なJSONがあればビルドを止めるため例外を投げる。
 */
export function loadJsonMarkets(): LoadedMarket[] {
  if (cache) return cache;
  if (!existsSync(MARKETS_ROOT)) {
    cache = [];
    return cache;
  }

  const dirs = readdirSync(MARKETS_ROOT).filter((name) => statSync(join(MARKETS_ROOT, name)).isDirectory());

  const results: LoadedMarket[] = [];

  for (const dir of dirs) {
    const base = join(MARKETS_ROOT, dir);
    const marketPath = join(base, 'market.json');
    if (!existsSync(marketPath)) continue; // market.json がないディレクトリはスキップ

    const marketRaw = readJson<unknown>(marketPath);
    const marketResult = marketSchema.safeParse(marketRaw);
    if (!marketResult.success) {
      throw new Error(`[loadMarkets] markets/${dir}/market.json が不正です:\n${marketResult.error.toString()}`);
    }
    const market = marketResult.data;

    if (market.id !== dir) {
      throw new Error(`[loadMarkets] markets/${dir}/market.json の id ("${market.id}") はディレクトリ名と一致させてください。`);
    }

    const companiesPath = join(base, 'companies.json');
    const companiesRaw = existsSync(companiesPath) ? readJson<unknown>(companiesPath) : [];
    const companiesResult = companiesSchema.safeParse(companiesRaw);
    if (!companiesResult.success) {
      throw new Error(`[loadMarkets] markets/${dir}/companies.json が不正です:\n${companiesResult.error.toString()}`);
    }

    const keywordsPath = join(base, 'keywords.json');
    const keywordsRaw = existsSync(keywordsPath)
      ? readJson<unknown>(keywordsPath)
      : { primaryKeyword: market.primaryKeyword };
    const keywordsResult = keywordsSchema.safeParse(keywordsRaw);
    if (!keywordsResult.success) {
      throw new Error(`[loadMarkets] markets/${dir}/keywords.json が不正です:\n${keywordsResult.error.toString()}`);
    }

    const pagesPath = join(base, 'pages.json');
    const pagesRaw = existsSync(pagesPath) ? readJson<unknown>(pagesPath) : [];
    const pagesResult = pagesSchema.safeParse(pagesRaw);
    if (!pagesResult.success) {
      throw new Error(`[loadMarkets] markets/${dir}/pages.json が不正です:\n${pagesResult.error.toString()}`);
    }
    if (!pagesResult.data.some((p) => p.slug === '/' && p.type === 'ranking')) {
      throw new Error(`[loadMarkets] markets/${dir}/pages.json には slug:"/" type:"ranking" のページが1つ必要です。`);
    }

    const companies = companiesResult.data.map((c) => toLegacyCompany(c, market, market.id));

    results.push({
      dir,
      market: toSimpleMarket(market, companies),
      companies,
      keywords: keywordsResult.data,
      pages: pagesResult.data,
    });
  }

  cache = results;
  return results;
}
