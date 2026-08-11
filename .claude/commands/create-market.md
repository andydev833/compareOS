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

### Phase 0: 市場選定（候補市場がまだ決まっていない場合）

ユーザーから具体的な市場名が指定されておらず、「新しい市場の候補を出して」「次はどの市場をやるべき？」等の依頼を受けた場合は、市場を選ぶ前に**必ず**このPhaseを実行する。すでに具体的な市場名が指定されている場合はPhase Aから開始してよい。

コスト意識（DataForSEO等の有料ボリュームAPIはこの環境に未接続。原則使わない）を前提に、以下の順で進める。

1. **一次スクリーニング** — 候補となりうる市場を複数挙げ、各候補についてWebSearchで軽く以下を確認する。
   - 大阪・関西に実在する企業がどれだけ見つかるか（掲載に必要な5〜8社が現実的に集まりそうか）
   - 広告主としての性質（民間の中小企業が中心か、NPO・公的機関・大企業グループが中心か）。後者が多い市場は広告出稿の意思決定構造がなく営業しづらい（corporate-aed-training市場で実際にD ランク企業が多数出た前例を参照）
   - 競合となる既存の比較サイトの強さ（SERP上位に強い比較サイトが何社いるか）
   この時点で明らかに不利な候補（実在企業が少なすぎる、公的セクターばかり、強い競合サイトが上位独占）は除外する。

2. **市場単価・キーワード一覧化** — 一次スクリーニングを通過した候補について、公開情報から市場単価感を調べる。あわせて、キーワードボリュームを確認すべきキーワードを一覧化する。「○○ 比較」だけでなく「○○ 費用」「○○ おすすめ」等、検索意図の異なる派生語も含める。

3. **ユーザーへボリューム確認を依頼** — 上記のキーワード一覧をユーザーに提示し、キーワードボリューム確認（Google広告キーワードプランナー等、手動）を依頼する。ユーザーからデータが返ってくるまで先へ進まない。

4. **スコアリング** — ユーザーから連携されたボリュームデータと、1・2で調べた内容（実在企業数・広告主適性・競合の強さ・市場単価）を統合し、候補市場ごとに「伸びる可能性」をスコアリングする。**スコアの根拠を必ず明示し、推測で数値を作らない。**

5. **意思決定はユーザーに委ねる** — スコアリング結果と根拠を提示し、どの市場を選ぶかはユーザーの判断を待つ。市場が決まったら、Phase Aへ進む。

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

### Phase F: 公開後の営業準備

buildが成功しPRがマージ・デプロイされたら、以下を行う。

1. **sitemap確認** — `astro.config.mjs`の`serialize()`により`lastmod`は自動反映される。手動作業は不要。
2. **Googleへのインデックス登録依頼** — Search Consoleでの「URL検査→インデックス登録をリクエスト」は、Google アカウントへのログインが必要なためユーザーが手動で行う。優先対象は新市場のランキングページ（`/{market-id}/`）。
3. **営業候補リストの更新** — Phase Aで作成した`companies.json`のうち掲載価値の高い企業を、`sales-research/outreach-targets.md`と同じ形式で追記する（新規に採点し直す必要はなく、companies.jsonの情報を転記すればよい）。
4. **初回アプローチメールの下書き** — `sales-research/outreach-message-templates.md`のメッセージ1テンプレートの`【　】`を埋めて下書きを作成する。**実際の送信はユーザーが行う**（安全ルール上、Claudeが企業へ一括送信することはできない）。

## 厳守事項

- 企業の料金・口コミ・実績・営業時間・ランキング根拠は、公式情報等で確認できたものだけを書く。確認できなければ `null`。
- `sources` の `checkedAt` は実際に確認した日付にする。
- レガシー市場（`src/data/markets.ts` / `src/data/companies/*.ts` / `src/pages/[marketSlug]/` の既存マークアップ / `src/pages/commercial-aircon/`）には触れない。
- build失敗・validateエラー・seo-checkエラーを残したまま作業を終えない。
