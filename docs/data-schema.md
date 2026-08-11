# データスキーマ定義

新市場は `markets/{market-id}/` 配下に以下の6ファイルを置く。実体のZod定義は
[src/lib/marketSchema.ts](../src/lib/marketSchema.ts)。`npm run validate` はこのスキーマで検証する。

```
markets/{market-id}/
├── market.json      # 市場定義
├── companies.json   # 掲載候補企業
├── keywords.json    # キーワード
├── pages.json        # ページ構成（ranking/comparison/area/guide）
├── research.md       # 市場調査結果（事実のみ）
└── strategy.md        # サイト戦略（AIの判断）
```

`{market-id}` はディレクトリ名であり、`market.json` の `id` と一致していなければならない（kebab-case）。

## market.json

```json
{
  "id": "marriage-agency-osaka",
  "slug": "marriage-agency-osaka",
  "name": "大阪の結婚相談所",
  "shortName": "結婚相談所",
  "category": "life",
  "primaryArea": "大阪",
  "secondaryArea": "関西",
  "primaryKeyword": "大阪 結婚相談所 おすすめ",
  "businessModel": "listing",
  "status": "research",
  "h1": "大阪の結婚相談所を比較",
  "catchCopy": "大阪の結婚相談所を、料金・サポート体制・成婚実績の公開状況で比較",
  "subCopy": "公式サイト等の公開情報を基に整理しています。",
  "description": "大阪府内で活動する結婚相談所の情報を、公式サイトに基づいて整理しています。",
  "targetUser": ["婚活を始めたい方", "他社との違いを比較したい方"],
  "conversionGoal": "掲載企業の公式サイト・無料相談への送客",
  "monetization": "掲載課金・PR掲載",
  "createdAt": "2026-07-31",
  "updatedAt": "2026-07-31"
}
```

| フィールド | 必須 | 型 | 説明 |
|---|---|---|---|
| id | ✓ | string (kebab-case) | ディレクトリ名と一致 |
| slug | | string | URLスラッグ。省略時は `id` |
| name | ✓ | string | 市場名 |
| shortName | | string | 短縮名。省略時は `name` |
| category | ✓ | `'equipment'\|'office'\|'hr-marketing'\|'life'` | サイト内カテゴリ |
| primaryArea | ✓ | string | 主要地域 |
| secondaryArea | | string | 副次地域 |
| primaryKeyword | ✓ | string | 主要検索キーワード |
| businessModel | ✓ | string | 例: `listing` |
| status | ✓ | `'research'\|'strategy'\|'building'\|'qa'\|'published'` | 制作パイプライン上の進捗 |
| h1 / catchCopy / subCopy / description | | string | 省略時は `name`/`primaryArea` から自動生成 |
| targetUser | | string[] | ターゲットユーザー像 |
| conversionGoal | | string | コンバージョン定義 |
| monetization | | string | 収益化方針 |
| createdAt / updatedAt | | string (YYYY-MM-DD) | |

## companies.json

```json
[
  {
    "id": "company-001",
    "name": "企業名",
    "officialUrl": "https://example.com",
    "areas": ["大阪"],
    "address": null,
    "price": {
      "initial": null,
      "monthly": null,
      "successFee": null,
      "note": null
    },
    "features": [],
    "freeConsultation": null,
    "onlineAvailable": null,
    "weekendAvailable": null,
    "sources": [
      {
        "url": "https://example.com/price",
        "type": "official",
        "checkedAt": "2026-07-31"
      }
    ]
  }
]
```

| フィールド | 必須 | 型 | 説明 |
|---|---|---|---|
| id | ✓ | string | market内でユニーク |
| name | ✓ | string | |
| officialUrl | ✓ | string (URL) | 一次情報源 |
| areas | | string[] | 対応エリア。デフォルト `[]` |
| address | | string \| null | 不明時は `null` |
| price.initial/monthly/successFee | | number \| null | 円。不明時は `null` |
| price.note | | string \| null | 料金の補足（税抜/税込など） |
| features | | string[] | 公式情報で確認できた特徴のみ |
| freeConsultation/onlineAvailable/weekendAvailable | | boolean \| null | 不明時は `null` |
| sources | | Source[] | `type` は `'official'\|'listing'\|'review'\|'other'` |

`officialUrl` は一次情報源として必須。それ以外の値は確認できない場合すべて `null` にする。
**架空の料金・口コミ・実績・営業時間を書かない。**

## keywords.json

```json
{
  "primaryKeyword": "大阪 結婚相談所 おすすめ",
  "secondaryKeywords": [],
  "longTailKeywords": [],
  "questions": [],
  "searchIntents": [],
  "areas": []
}
```

## pages.json

4種類のページタイプのみ使用する。

| type | 例 | 内容 |
|---|---|---|
| `ranking` | 大阪 結婚相談所 おすすめ | 市場トップページ（1市場に必ず1つ、`slug: "/"`） |
| `comparison` | 大阪 結婚相談所 料金 | 特定軸（料金など）での比較ページ |
| `area` | 梅田 結婚相談所 | エリア別ページ |
| `guide` | 結婚相談所 選び方 | 選び方・ガイドページ |

```json
[
  {
    "slug": "/",
    "type": "ranking",
    "targetKeyword": "大阪 結婚相談所 おすすめ",
    "title": "大阪の結婚相談所おすすめ比較 | Oppick",
    "description": "",
    "h1": "大阪の結婚相談所を比較",
    "index": true,
    "intro": "",
    "faqs": []
  },
  {
    "slug": "/price/",
    "type": "comparison",
    "targetKeyword": "大阪 結婚相談所 料金",
    "title": "大阪の結婚相談所料金比較 | Oppick",
    "description": "",
    "h1": "大阪の結婚相談所料金を比較",
    "index": true,
    "intro": "",
    "companyIds": [],
    "faqs": []
  },
  {
    "slug": "/area/umeda/",
    "type": "area",
    "targetKeyword": "梅田 結婚相談所",
    "title": "梅田の結婚相談所 | Oppick",
    "description": "",
    "h1": "梅田エリアの結婚相談所",
    "index": true,
    "intro": "",
    "areaName": "梅田",
    "companyIds": []
  },
  {
    "slug": "/guide/",
    "type": "guide",
    "targetKeyword": "結婚相談所 選び方",
    "title": "結婚相談所の選び方 | Oppick",
    "description": "",
    "h1": "結婚相談所の選び方",
    "index": true,
    "intro": "",
    "sections": [
      { "heading": "", "body": "" }
    ],
    "faqs": []
  }
]
```

共通フィールド：`slug`（`/`始まり`/`終わり）、`type`、`targetKeyword`、`title`、`description`、`h1`、`index`。
`title`・`slug` は市場内でユニークでなければならない。

## research.md

```markdown
# 市場調査

## 市場概要

## ユーザーの検索意図

## 主な比較軸

## SERP分析

### 競合1
- URL
- サイトタイプ
- 主な特徴
- 掲載企業数
- 強み
- 弱み

### 競合2

## 掲載候補企業

## SERP上の不足情報

## 市場で確認できた特徴

## 情報不足・追加確認事項
```

事実のみを書く。AIの判断・提案は書かない（→ strategy.md へ）。

## strategy.md

```markdown
# Site Strategy

## Positioning

## Target User

## Main Conversion

## Differentiation

## Primary Comparison Axes

## Content Strategy

## Area Strategy

## Internal Link Strategy

## Monetization Hypothesis

## Risks
```
