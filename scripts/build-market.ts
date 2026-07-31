/**
 * validate → seo-check → astro build を順に実行し、最後にPhase Eレポートを出力する。
 * いずれかのステップが失敗した場合、後続は実行せず非ゼロ終了する。
 *
 * Usage:
 *   npm run build:market                 # markets/ 配下すべてを対象
 *   npm run build:market -- <market-id>  # 指定した市場のみ対象にレポートを出す（buildはサイト全体）
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { marketSchema, companiesSchema, keywordsSchema, pagesSchema } from '../src/lib/marketSchema.js';

const MARKETS_ROOT = join(process.cwd(), 'markets');

function run(command: string, args: string[]): boolean {
  console.log(`\n$ ${command} ${args.join(' ')}\n`);
  const result = spawnSync(command, args, { stdio: 'inherit' });
  return result.status === 0;
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function printReport(dir: string) {
  const base = join(MARKETS_ROOT, dir);
  const market = marketSchema.safeParse(readJson(join(base, 'market.json')));
  const companies = companiesSchema.safeParse(existsSync(join(base, 'companies.json')) ? readJson(join(base, 'companies.json')) : []);
  const keywords = keywordsSchema.safeParse(existsSync(join(base, 'keywords.json')) ? readJson(join(base, 'keywords.json')) : {});
  const pages = pagesSchema.safeParse(existsSync(join(base, 'pages.json')) ? readJson(join(base, 'pages.json')) : []);

  if (!market.success || !companies.success || !pages.success) {
    console.log(`\n市場：${dir}（レポート生成に必要なデータの読み込みに失敗しました）`);
    return;
  }

  const pageList = pages.data;
  const kwCount = keywords.success
    ? new Set([keywords.data.primaryKeyword, ...keywords.data.secondaryKeywords, ...keywords.data.longTailKeywords]).size
    : 0;

  console.log(`
市場：${market.data.name}（${dir}）
企業数：${companies.data.length}
ページ数：${pageList.length}
主要KW数：${kwCount}
エリアページ数：${pageList.filter((p) => p.type === 'area').length}
比較ページ数：${pageList.filter((p) => p.type === 'comparison').length}
ガイドページ数：${pageList.filter((p) => p.type === 'guide').length}
`);
}

function main() {
  const target = process.argv[2];

  const validateOk = run('npx', target ? ['tsx', 'scripts/validate-market.ts', target] : ['tsx', 'scripts/validate-market.ts']);
  if (!validateOk) {
    console.error('\n[build-market] Validation failed. buildを中断します。');
    process.exit(1);
  }

  const seoOk = run('npx', target ? ['tsx', 'scripts/seo-check.ts', target] : ['tsx', 'scripts/seo-check.ts']);
  if (!seoOk) {
    console.error('\n[build-market] SEO Check failed. buildを中断します。');
    process.exit(1);
  }

  const buildOk = run('npx', ['astro', 'build']);
  if (!buildOk) {
    console.error('\n[build-market] astro build failed.');
    process.exit(1);
  }

  console.log('\n=== Phase E: 最終レポート ===');

  if (!existsSync(MARKETS_ROOT)) {
    console.log('markets/ ディレクトリがありません。');
    return;
  }

  const allDirs = readdirSync(MARKETS_ROOT).filter((name) => statSync(join(MARKETS_ROOT, name)).isDirectory());
  const dirs = target ? allDirs.filter((d) => d === target) : allDirs;

  for (const dir of dirs) {
    printReport(dir);
  }

  console.log('Validation：PASS');
  console.log('SEO Check：PASS');
  console.log('Build：PASS');
  console.log('\n要確認：特になし（詳細はコンソール出力のWARNを参照してください）');
}

main();
