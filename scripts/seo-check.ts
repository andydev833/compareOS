/**
 * markets/{market-id}/pages.json のSEO/AEO観点チェック。
 * PASS / WARN / ERROR に分類してレポートする。ERRORが1件でもあれば非ゼロ終了する。
 *
 * Usage:
 *   npm run seo-check
 *   npm run seo-check -- <market-id>
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { marketSchema, companiesSchema, pagesSchema, type PageJson } from '../src/lib/marketSchema.js';

const MARKETS_ROOT = join(process.cwd(), 'markets');

type Level = 'PASS' | 'WARN' | 'ERROR';
interface Result {
  level: Level;
  message: string;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function pagePath(marketSlug: string, slug: string): string {
  return slug === '/' ? `/${marketSlug}/` : `/${marketSlug}${slug}`;
}

function checkMarket(dir: string): Result[] {
  const base = join(MARKETS_ROOT, dir);
  const results: Result[] = [];

  const marketPath = join(base, 'market.json');
  const pagesPath = join(base, 'pages.json');
  const companiesPath = join(base, 'companies.json');
  if (!existsSync(marketPath) || !existsSync(pagesPath)) {
    return [{ level: 'ERROR', message: 'market.json / pages.json が存在しません（先に npm run validate を実行してください）' }];
  }

  const marketResult = marketSchema.safeParse(readJson(marketPath));
  const pagesResult = pagesSchema.safeParse(readJson(pagesPath));
  const companiesResult = existsSync(companiesPath) ? companiesSchema.safeParse(readJson(companiesPath)) : { success: true as const, data: [] };

  if (!marketResult.success || !pagesResult.success || !companiesResult.success) {
    return [{ level: 'ERROR', message: 'JSONのスキーマ検証に失敗しています（npm run validate の結果を確認してください）' }];
  }

  const market = marketResult.data;
  const pages = pagesResult.data;
  const companies = companiesResult.data;
  const marketSlug = market.slug ?? market.id;
  const companyIds = new Set(companies.map((c) => c.id));

  // --- market全体 ---
  if (companies.length === 0) {
    results.push({ level: 'WARN', message: '[market] 掲載企業が0件です' });
  } else {
    results.push({ level: 'PASS', message: `[market] 掲載企業 ${companies.length}件` });
  }

  // --- title / slug 重複チェック（market内） ---
  const titleCount = new Map<string, number>();
  const slugCount = new Map<string, number>();
  for (const page of pages) {
    titleCount.set(page.title, (titleCount.get(page.title) ?? 0) + 1);
    slugCount.set(page.slug, (slugCount.get(page.slug) ?? 0) + 1);
  }
  for (const [title, count] of titleCount) {
    if (count > 1) results.push({ level: 'ERROR', message: `[title重複] "${title}" が${count}ページで重複しています` });
  }
  for (const [slug, count] of slugCount) {
    if (count > 1) results.push({ level: 'ERROR', message: `[URL重複] slug "${slug}" が${count}ページで重複しています` });
  }
  if ([...titleCount.values()].every((c) => c === 1)) {
    results.push({ level: 'PASS', message: '[title重複] 重複なし' });
  }
  if ([...slugCount.values()].every((c) => c === 1)) {
    results.push({ level: 'PASS', message: '[URL重複] 重複なし' });
  }

  // --- ページ単位 ---
  for (const page of pages) {
    const url = pagePath(marketSlug, page.slug);
    const prefix = `[${url}]`;

    // title
    if (!page.title) {
      results.push({ level: 'ERROR', message: `${prefix} title が空です` });
    } else if (page.title.length > 35) {
      results.push({ level: 'WARN', message: `${prefix} title が${page.title.length}文字です（目安35文字以内、検索結果で切れる可能性）` });
    } else {
      results.push({ level: 'PASS', message: `${prefix} title OK` });
    }

    // description
    if (!page.description) {
      results.push({ level: 'WARN', message: `${prefix} description が未設定です` });
    } else if (page.description.length > 120) {
      results.push({ level: 'WARN', message: `${prefix} description が${page.description.length}文字です（目安120文字以内）` });
    } else {
      results.push({ level: 'PASS', message: `${prefix} description OK` });
    }

    // h1
    if (!page.h1) {
      results.push({ level: 'ERROR', message: `${prefix} h1 が空です` });
    } else {
      results.push({ level: 'PASS', message: `${prefix} h1 OK` });
    }

    // index/noindex
    results.push({ level: 'PASS', message: `${prefix} index=${page.index}` });

    // FAQ (AEO)
    if (page.faqs.length === 0) {
      results.push({ level: 'WARN', message: `${prefix} FAQが未設定です（AEO観点で推奨）` });
    } else {
      results.push({ level: 'PASS', message: `${prefix} FAQ ${page.faqs.length}件` });
    }

    // companyIds整合性
    const withCompanyIds = page as Extract<PageJson, { companyIds: string[] }>;
    if ('companyIds' in page && withCompanyIds.companyIds.length > 0) {
      const unknown = withCompanyIds.companyIds.filter((id) => !companyIds.has(id));
      if (unknown.length > 0) {
        results.push({ level: 'ERROR', message: `${prefix} companies.jsonに存在しないcompanyIdsを参照しています: ${unknown.join(', ')}` });
      }
    }

    // ranking/comparison/areaページで比較対象が0件
    if ((page.type === 'ranking' || page.type === 'comparison') && companies.length === 0) {
      results.push({ level: 'WARN', message: `${prefix} 比較対象企業が0件です` });
    }
  }

  return results;
}

function main() {
  const target = process.argv[2];

  if (!existsSync(MARKETS_ROOT)) {
    console.log('markets/ ディレクトリが存在しません。検証対象がありません。');
    process.exit(0);
  }

  const allDirs = readdirSync(MARKETS_ROOT).filter((name) => statSync(join(MARKETS_ROOT, name)).isDirectory());
  const dirs = target ? allDirs.filter((d) => d === target) : allDirs;

  if (dirs.length === 0) {
    console.log('検証対象の市場がありません。');
    process.exit(0);
  }

  let errorCount = 0;
  let warnCount = 0;
  console.log(`\n=== SEO/AEO Check: ${dirs.length}市場 ===\n`);

  for (const dir of dirs) {
    console.log(`--- ${dir} ---`);
    const results = checkMarket(dir);
    for (const r of results) {
      const icon = r.level === 'PASS' ? '✅' : r.level === 'WARN' ? '⚠️ ' : '❌';
      console.log(`${icon} [${r.level}] ${r.message}`);
      if (r.level === 'ERROR') errorCount++;
      if (r.level === 'WARN') warnCount++;
    }
    console.log('');
  }

  console.log(`ERROR: ${errorCount}件 / WARN: ${warnCount}件`);
  if (errorCount > 0) {
    console.error('SEO Check failed (ERRORが存在します)。');
    process.exit(1);
  }
  console.log('SEO Check passed.');
}

main();
