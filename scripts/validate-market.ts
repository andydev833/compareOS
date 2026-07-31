/**
 * markets/{market-id}/ のデータをZodスキーマで検証する。
 *
 * Usage:
 *   npm run validate                 # markets/ 配下すべてを検証
 *   npm run validate -- <market-id>  # 指定した市場のみ検証
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  marketSchema,
  companiesSchema,
  keywordsSchema,
  pagesSchema,
} from '../src/lib/marketSchema.js';

const MARKETS_ROOT = join(process.cwd(), 'markets');

interface Issue {
  level: 'ERROR' | 'WARN';
  message: string;
}

function readJson(path: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(readFileSync(path, 'utf-8')) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function validateMarketDir(dir: string): Issue[] {
  const issues: Issue[] = [];
  const base = join(MARKETS_ROOT, dir);

  const requiredFiles = ['market.json', 'companies.json', 'keywords.json', 'pages.json', 'research.md', 'strategy.md'];
  for (const file of requiredFiles) {
    if (!existsSync(join(base, file))) {
      issues.push({ level: 'ERROR', message: `${file} が存在しません` });
    }
  }
  if (issues.length > 0) return issues; // ファイルが揃っていなければこれ以上は検証しない

  // market.json
  const marketRaw = readJson(join(base, 'market.json'));
  if (!marketRaw.ok) {
    issues.push({ level: 'ERROR', message: `market.json のJSONパースに失敗: ${marketRaw.error}` });
    return issues;
  }
  const marketResult = marketSchema.safeParse(marketRaw.data);
  if (!marketResult.success) {
    for (const issue of marketResult.error.issues) {
      issues.push({ level: 'ERROR', message: `market.json ${issue.path.join('.')}: ${issue.message}` });
    }
    return issues;
  }
  const market = marketResult.data;
  if (market.id !== dir) {
    issues.push({ level: 'ERROR', message: `market.json の id ("${market.id}") がディレクトリ名 ("${dir}") と一致しません` });
  }

  // companies.json
  const companiesRaw = readJson(join(base, 'companies.json'));
  if (!companiesRaw.ok) {
    issues.push({ level: 'ERROR', message: `companies.json のJSONパースに失敗: ${companiesRaw.error}` });
  } else {
    const companiesResult = companiesSchema.safeParse(companiesRaw.data);
    if (!companiesResult.success) {
      for (const issue of companiesResult.error.issues) {
        issues.push({ level: 'ERROR', message: `companies.json ${issue.path.join('.')}: ${issue.message}` });
      }
    } else {
      const companies = companiesResult.data;
      if (companies.length === 0) {
        issues.push({ level: 'WARN', message: 'companies.json に企業が1件もありません' });
      }
      const ids = new Set<string>();
      for (const company of companies) {
        if (ids.has(company.id)) {
          issues.push({ level: 'ERROR', message: `companies.json の企業id "${company.id}" が重複しています` });
        }
        ids.add(company.id);
        if (company.sources.length === 0) {
          issues.push({ level: 'WARN', message: `企業 "${company.id}" に sources がありません（情報源不明）` });
        }
      }
    }
  }

  // keywords.json
  const keywordsRaw = readJson(join(base, 'keywords.json'));
  if (!keywordsRaw.ok) {
    issues.push({ level: 'ERROR', message: `keywords.json のJSONパースに失敗: ${keywordsRaw.error}` });
  } else {
    const keywordsResult = keywordsSchema.safeParse(keywordsRaw.data);
    if (!keywordsResult.success) {
      for (const issue of keywordsResult.error.issues) {
        issues.push({ level: 'ERROR', message: `keywords.json ${issue.path.join('.')}: ${issue.message}` });
      }
    }
  }

  // pages.json
  const pagesRaw = readJson(join(base, 'pages.json'));
  if (!pagesRaw.ok) {
    issues.push({ level: 'ERROR', message: `pages.json のJSONパースに失敗: ${pagesRaw.error}` });
  } else {
    const pagesResult = pagesSchema.safeParse(pagesRaw.data);
    if (!pagesResult.success) {
      for (const issue of pagesResult.error.issues) {
        issues.push({ level: 'ERROR', message: `pages.json ${issue.path.join('.')}: ${issue.message}` });
      }
    } else {
      const pages = pagesResult.data;
      const rankingPages = pages.filter((p) => p.type === 'ranking');
      if (rankingPages.length === 0) {
        issues.push({ level: 'ERROR', message: 'pages.json に type:"ranking" のページがありません' });
      }
      if (!pages.some((p) => p.slug === '/' && p.type === 'ranking')) {
        issues.push({ level: 'ERROR', message: 'pages.json には slug:"/" type:"ranking" のページが1つ必要です' });
      }
      const slugs = new Set<string>();
      for (const page of pages) {
        if (slugs.has(page.slug)) {
          issues.push({ level: 'ERROR', message: `pages.json の slug "${page.slug}" が重複しています` });
        }
        slugs.add(page.slug);
      }
    }
  }

  // research.md / strategy.md は最低限「空でないこと」を確認する
  for (const file of ['research.md', 'strategy.md']) {
    const content = readFileSync(join(base, file), 'utf-8').trim();
    if (content.length === 0) {
      issues.push({ level: 'WARN', message: `${file} が空です` });
    }
  }

  return issues;
}

function main() {
  const target = process.argv[2];

  if (!existsSync(MARKETS_ROOT)) {
    console.log('markets/ ディレクトリが存在しません。検証対象がありません。');
    process.exit(0);
  }

  const allDirs = readdirSync(MARKETS_ROOT).filter((name) => statSync(join(MARKETS_ROOT, name)).isDirectory());
  const dirs = target ? allDirs.filter((d) => d === target) : allDirs;

  if (target && dirs.length === 0) {
    console.error(`markets/${target} が見つかりません`);
    process.exit(1);
  }

  if (dirs.length === 0) {
    console.log('markets/ 配下に市場ディレクトリがありません。検証対象がありません。');
    process.exit(0);
  }

  let hasError = false;
  console.log(`\n=== Validation: ${dirs.length}市場 ===\n`);

  for (const dir of dirs) {
    const issues = validateMarketDir(dir);
    const errors = issues.filter((i) => i.level === 'ERROR');
    const warns = issues.filter((i) => i.level === 'WARN');

    if (errors.length === 0) {
      console.log(`✅ PASS  ${dir}${warns.length > 0 ? `（WARN ${warns.length}件）` : ''}`);
    } else {
      console.log(`❌ FAIL  ${dir}（ERROR ${errors.length}件 / WARN ${warns.length}件）`);
      hasError = true;
    }
    for (const issue of issues) {
      console.log(`   [${issue.level}] ${issue.message}`);
    }
  }

  console.log('');
  if (hasError) {
    console.error('Validation failed.');
    process.exit(1);
  }
  console.log('Validation passed.');
}

main();
