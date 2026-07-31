# SEO / AEO / GEO ルール

## 基本方針

現在の検索エンジンだけでなく、AI検索・回答エンジン（AEO/GEO）でも理解しやすい構造にする。
ただし「AEOのため」という理由だけで不自然な文章を生成しない。ユーザー価値を優先する。

## 各ページ必須要素

- `title`（重複禁止・市場内でユニーク）
- `description`
- `H1`（1ページ1つ）
- `canonical`
- `index` / `noindex` の明示
- 内部リンク（パンくず・関連ページ・エリアリンク）
- sitemap対象かどうか
- JSON-LD（構造化データ）

## AEO/GEO観点で重視する要素

- 端的な結論（DirectAnswer）を本文冒頭で示す
- 明確な比較表（ComparisonTable）
- FAQ（質問と回答をHTMLに含める。アコーディオンで閉じていても本文に含める）
- 構造化された企業情報（Organization / ItemList等のJSON-LD）
- 情報源（sources）と更新日（checkedAt）の明示
- 「誰向けのページか」（targetUser）の明示
- 選定基準（selectionConclusion / reasons / checkItems）の明示
- 地域情報（対応エリア）の明示
- Entity（企業名・市場名）の一貫した表記

## Validation観点（`npm run validate`）

- market.json / companies.json / keywords.json / pages.json の存在とパース可否
- スキーマ適合性（Zod）
- company id の重複なし
- pages.json の slug 重複なし
- 必須項目の欠落なし
- URL形式の妥当性
- source の形式（url / type / checkedAt）の妥当性
- checkedAt の日付形式（`YYYY-MM-DD`）妥当性

## SEO Check観点（`npm run seo-check`）

pages.json の各エントリに対して以下をチェックし、`PASS` / `WARN` / `ERROR` で分類する。

- title の存在・重複
- description の存在・長さ
- h1 の存在
- slug の重複
- index/noindexの明示
- FAQの有無（AEO観点、WARNのみ）
- 比較ページに比較対象企業が存在するか

`ERROR` が1件でもある場合はbuildへ進む前に修正する。`WARN` は許容されるが、可能な限り解消する。
