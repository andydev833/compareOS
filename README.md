# compareOS

大阪を中心に、必要に応じて関西まで対象を広げた地域特化型・比較サイト型Web集客サイト。
Astro 7 + TypeScript（静的出力）で構築している。

事業方針・データ品質ルール・開発ルールの全体像は [CLAUDE.md](CLAUDE.md) を参照。

## セットアップ

Node.js のバージョンは `.nvmrc`（22.23.2）に固定している。

```bash
nvm use
npm install
npm run dev
```

## コマンド

| コマンド | 内容 |
| :-- | :-- |
| `npm run dev` | 開発サーバー起動（`localhost:4321`） |
| `npm run build` | サイト全体を `./dist/` にビルド |
| `npm run preview` | ビルド結果をローカルでプレビュー |
| `npm run validate [-- <market-id>]` | `markets/` 配下のJSONをスキーマ検証 |
| `npm run seo-check [-- <market-id>]` | `markets/` 配下のページをSEO/AEO観点でチェック（PASS/WARN/ERROR） |
| `npm run build:market [-- <market-id>]` | validate → seo-check → build を順に実行し、最後にレポートを出力 |

## リポジトリの2層構造

1. **レガシー市場（12市場）** — `src/data/markets.ts` / `src/data/companies/*.ts` にハードコードされた既存の公開市場。`src/pages/[marketSlug]/`（汎用11市場）と `src/pages/commercial-aircon/`（特化1市場）で配信。
2. **JSON駆動市場** — `markets/{market-id}/` のJSON/Markdownを [src/lib/loadMarkets.ts](src/lib/loadMarkets.ts) がビルド時に読み込み、レガシー市場と同じ `[marketSlug]` ルートで配信する。**新市場は必ずこちらで追加する。**

## 新市場の追加方法

### 方法1: `/create-market` スラッシュコマンド（推奨）

Claude Codeで以下のように実行すると、リサーチ〜JSON生成〜Validation〜SEO Check〜Buildまでを一気通貫で行う。

```
/create-market

市場：大阪 結婚相談所
地域：大阪
副次地域：関西
主KW：大阪 結婚相談所 おすすめ
```

詳細な手順は [.claude/commands/create-market.md](.claude/commands/create-market.md) を参照。

### 方法2: 手動で追加する

1. `markets/{market-id}/` ディレクトリを作成し、以下の6ファイルを用意する（スキーマは [docs/data-schema.md](docs/data-schema.md)）。
   - `market.json`
   - `companies.json`
   - `keywords.json`
   - `pages.json`（`slug:"/"` の `ranking` ページが1つ必須。他に `comparison` / `area` / `guide` を任意で追加）
   - `research.md`
   - `strategy.md`
2. `npm run validate -- {market-id}` でスキーマ・整合性を検証する。
3. `npm run seo-check -- {market-id}` でtitle/description/h1/FAQ等を確認する。
4. `npm run build` でサイト全体をビルドする（`/{market-id}/` 配下に自動でページが生成される）。
5. まとめて実行したい場合は `npm run build:market -- {market-id}` で 2〜4 を一括実行できる。

企業情報は**確認できた事実のみ**を記載し、不明な項目は `null` にする（[docs/content-rules.md](docs/content-rules.md)）。

## サンプル市場

`markets/marriage-agency-osaka/`（大阪の結婚相談所）を動作確認用のサンプルとして同梱している。
WebSearch/WebFetchで実在企業4社（パートナーエージェント大阪店・IBJメンバーズ大阪店・ツヴァイ・サンマリエ大阪心斎橋サロン）を調査し、公式サイトで確認できた情報のみを掲載している。

## ドキュメント

- [CLAUDE.md](CLAUDE.md) — プロジェクト方針・ワークフロー・データ品質ルール
- [docs/business.md](docs/business.md) — 事業方針・v1.0のスコープ
- [docs/data-schema.md](docs/data-schema.md) — market.json / companies.json / keywords.json / pages.json のスキーマ
- [docs/seo-rules.md](docs/seo-rules.md) — SEO/AEO/GEOルール
- [docs/content-rules.md](docs/content-rules.md) — コンテンツ生成ルール
