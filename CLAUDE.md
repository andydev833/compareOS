# Oppick

## Project Goal

大阪を中心に、必要に応じて関西まで対象を広げた**地域特化型・比較サイト型Web集客事業**。

単なるSEO記事量産サイトではなく、以下の導線を作ることが目的。

```
検索 → 比較サイト流入 → サービス・企業比較 → 問い合わせ → 掲載企業への送客
  → 掲載課金・PR掲載・スポンサー等の収益化 → 将来的に売上改善サービスへ接続
```

そのため「ユーザーが比較・意思決定できる構造化された比較DB型サイト」として設計する。

## Tech Stack

- Astro 7 (静的出力 / `output: 'static'`)
- TypeScript strict
- Zod（`markets/*/` JSONのスキーマ検証）
- 市場データは `markets/{market-id}/` 配下の JSON / Markdown が Single Source of Truth

## リポジトリの2層構造（重要）

このリポジトリには **2種類の市場データ**が存在する。新規作業は必ず後者（JSON駆動）で行うこと。

1. **レガシー市場（12市場）** — `src/data/markets.ts` / `src/data/companies/*.ts` にハードコードされた既存の公開市場。`src/pages/[marketSlug]/`（汎用11市場）と `src/pages/commercial-aircon/`（特化1市場）で配信されている。**現状維持が前提。理由なく書き換えたり削除しない。**
2. **JSON駆動市場（v1.0以降の新規市場）** — `markets/{market-id}/market.json` 等から `src/lib/loadMarkets.ts` がビルド時に読み込み、`src/lib/marketSchema.ts` の Zod スキーマで検証し、既存の `Market` / `Company` 型（`src/data/types.ts`）へ変換して、レガシー市場と同じ `[marketSlug]` ルートおよび `pages.json` 駆動の追加ページで配信する。**新市場は必ずこちらで追加する。**

## 新市場作成のワークフロー（`/create-market`）

1. `market.json` 作成（市場定義）
2. SERP調査・競合分析・掲載候補企業調査（WebSearch/WebFetchで実施し、事実ベースで記録）
3. `research.md` 作成（調査結果 = 事実のみ）
4. `companies.json` 作成（掲載候補企業。不明値は `null`）
5. `keywords.json` 作成
6. `strategy.md` 作成（Researchを踏まえたAIの戦略判断。事実と判断を混同しない）
7. `pages.json` 作成（ranking / comparison / area / guide の4種類）
8. サイトへ反映（コンテンツ生成・内部リンク・Schema/metadata）
9. `npm run validate`
10. `npm run seo-check`
11. `npm run build`
12. エラーがあれば原因を特定し修正 → 再実行（build成功まで繰り返す）
13. 最終レポート出力

詳細な手順は [.claude/commands/create-market.md](.claude/commands/create-market.md) を参照。

## Data Quality Rules（最重要・妥協禁止）

- **推測禁止** — 企業情報について確認できない内容を推測・捏造しない
- **不明値は `null`**（または空配列）。無理に埋めない
- **公式情報を優先** — 一次情報（公式サイト）を最優先の情報源とする
- **`sources` を保持** — 重要な企業情報には `{ url, type, checkedAt }` を必ず添える
- **`checkedAt` を保持** — いつ確認した情報かを必ず記録する（`YYYY-MM-DD`）
- 以下は明確に禁止：架空の料金・架空の口コミ・架空の実績・架空の店舗・架空の営業時間・根拠のないランキング根拠・根拠のない「おすすめNo.1」表現
- `research.md`（事実）と `strategy.md`（AIの戦略判断）を混同しない

## Development Rules

- JSONをSingle Source of Truthにする。市場固有の情報（企業名・料金・FAQ等）をReactコンポーネントやAstroコンポーネントへ直接ハードコードしない
- 市場ごとに別ページ・別コンポーネントを大量生成しない。**共通コンポーネント + 共通テンプレート + 市場ごとのJSON** の構成を維持する
- 既存コンポーネント（`src/components/`）・ユーティリティ（`src/utils/`, `src/lib/`）を優先的に再利用する
- 同じUI・同じ説明文を市場ごとに重複実装しない
- buildエラーを残したまま作業を終えない。`npm run validate` → `npm run seo-check` → `npm run build` が全てPASSする状態を保つ
- 過剰設計をしない（v1.0時点ではマルチエージェント基盤・ベクトルDB・独自RAG・管理画面・ログイン・CRM・自動デプロイ等は不要。詳細は [docs/business.md](docs/business.md)）

## コンテンツ生成ルール

- SEOキーワードを不自然に連呼しない
- 「おすすめ10選」のようなテンプレ量産だけで終わらせない。比較理由を明示する
- 企業ごとの差異が分かるようにする。一般論と企業固有情報を区別する
- 読者が次に何をすればいいか（CTA）を明確にする
- 不明な情報は書かない
- 同じ説明文を複数ページへ大量コピーしない

## 参照ドキュメント

- [docs/business.md](docs/business.md) — 事業方針・v1.0のスコープ
- [docs/data-schema.md](docs/data-schema.md) — market.json / companies.json / keywords.json / pages.json のスキーマ定義
- [docs/seo-rules.md](docs/seo-rules.md) — SEO/AEO/GEOルール
- [docs/content-rules.md](docs/content-rules.md) — コンテンツ生成ルール詳細
- [README.md](README.md) — 新市場の追加方法（コマンド）
