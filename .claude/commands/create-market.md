---
description: 新しい比較サイト市場をリサーチからbuild成功まで一気通貫で作成する
---

# /create-market

あなたはこのリポジトリ（Oppick）のシニアWebエンジニア兼リサーチャーとして、新しい市場を1つ追加する。
必ず [CLAUDE.md](../../CLAUDE.md) のルール（特に Data Quality Rules）に従うこと。**推測・捏造は禁止**。

## 入力

ユーザーは次のような形式で入力する（自由記述でもよいので、無ければ聞き返す）：

```
市場：大阪 結婚相談所
地域：大阪
副次地域：関西
主KW：大阪 結婚相談所 おすすめ
```

今回の入力：

$ARGUMENTS

上記から `market-id`（kebab-case。例: `marriage-agency-osaka`）を決め、`markets/{market-id}/` を作業ディレクトリとする。
既に同名ディレクトリが存在する場合は、上書きせずユーザーに確認する。

## 手順（順番厳守。各Phaseの完了を確認してから次へ進む）

### Phase A: Research

1. **市場定義** — `market.json` の下書きを作る（id/slug/name/category/primaryArea/secondaryArea/primaryKeyword/businessModel/status:"research"）。スキーマは [docs/data-schema.md](../../docs/data-schema.md) を参照。
2. **SERP調査** — WebSearchで主KW・副KWを検索し、上位に出るサイトの傾向（比較サイトか公式サイトか、掲載企業数、訴求軸）を調べる。
3. **競合分析** — 上位の比較サイトを2〜3件、WebFetchで確認し、サイトタイプ・強み・弱みを記録する。
4. **掲載候補企業調査** — 実在する企業をWebSearch/WebFetchで調査する。各企業について、公式サイトURL・対応エリア・料金・特徴など、**公式サイト等の一次情報で確認できた事実のみ**を記録する。確認できない項目は空欄のままにし、後で `null` にする。
5. **research.md 作成** — [docs/data-schema.md](../../docs/data-schema.md) のテンプレートに沿って、事実のみを記録する。AIの評価・提案は書かない。
6. **companies.json 作成** — 調査した企業を [docs/data-schema.md](../../docs/data-schema.md) の companies.json スキーマに従って記録する。**不明な値は必ず `null`**。`sources` に確認したURL・種別・確認日（今日の日付）を必ず入れる。架空の料金・口コミ・実績を書かない。
7. **keywords.json 作成** — 主KW・副KW・ロングテールKW・想定質問・検索意図・エリアを整理する。

### Phase B: Strategy

8. **strategy.md 作成** — research.md の内容を踏まえ、Positioning / Target User / Differentiation / Content Strategy / Area Strategy / Internal Link Strategy / Monetization Hypothesis / Risks を記述する。**ここはAIの戦略判断であり、research.mdの事実と混同しない。**
9. **pages.json 作成** — 4種類（ranking / comparison / area / guide）からページを設計する。`slug:"/"` の ranking ページは必須。area ページは research.md で確認できた実在エリアのみ作る（架空エリアを作らない）。

### Phase C: Build

10. **コンテンツ生成** — 各ページの `title` / `description` / `h1` / `intro` / `sections` / `faqs` を執筆する。[docs/content-rules.md](../../docs/content-rules.md) に従う（不自然なキーワード連呼禁止、テンプレ量産禁止、比較理由の明示、不明情報を書かない）。
11. **内部リンク** — pages.json のページ同士が RelatedPages / AreaLinks で自然につながるようにする（実装は既存の共通コンポーネントが自動で行う。ページ数・エリア数が整合しているか確認する）。
12. **反映確認** — `market.json` の `status` を `"building"` に更新する。

### Phase D: QA

13. `npm run validate -- {market-id}` を実行する。ERRORがあれば修正して再実行する。
14. `npm run seo-check -- {market-id}` を実行する。ERRORがあれば修正して再実行する。WARNは可能な範囲で解消する。
15. `npm run build` を実行する。失敗したら原因を特定し修正して再実行する。**buildが成功するまで繰り返す。**
16. すべて成功したら `market.json` の `status` を `"published"` に更新し、再度 validate/seo-check/build を実行して壊れていないことを確認する。

### Phase E: Report

最後に以下の形式で報告する（[docs/business.md](../../docs/business.md) のワークフローに対応）：

```
市場：
企業数：
ページ数：
主要KW数：
エリアページ数：
比較ページ数：
ガイドページ数：

Validation：
SEO Check：
Build：

要確認：
```

`npm run build:market -- {market-id}` を実行すると Phase D + Phase E のレポート出力までまとめて行える。

## 厳守事項

- 企業の料金・口コミ・実績・営業時間・ランキング根拠は、公式情報等で確認できたものだけを書く。確認できなければ `null`。
- `sources` の `checkedAt` は実際に確認した日付にする。
- レガシー市場（`src/data/markets.ts` / `src/data/companies/*.ts` / `src/pages/[marketSlug]/` の既存マークアップ / `src/pages/commercial-aircon/`）には触れない。
- build失敗・validateエラー・seo-checkエラーを残したまま作業を終えない。
