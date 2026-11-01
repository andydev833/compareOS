/**
 * 共通TypeScript型定義
 * Oppick - 大阪の比較メディア
 */

// ------------------------------------
// 掲載区分
// ------------------------------------
export type ListingType = 'demo' | 'standard' | 'pr';

// ------------------------------------
// 公開状態
// ------------------------------------
export type PublishStatus = 'draft' | 'review' | 'published' | 'archived';

// ------------------------------------
// 不明情報ステータス
// ------------------------------------
export type InfoStatus =
  | '対応'
  | '非対応'
  | '公式サイトで確認できず'
  | '要問い合わせ'
  | '公開情報の範囲で記載';

// ------------------------------------
// 市場カテゴリー
// ------------------------------------
export type MarketCategory = 'equipment' | 'office' | 'hr-marketing' | 'life';

// ------------------------------------
// FAQ
// ------------------------------------
export interface FAQ {
  question: string;
  directAnswer: string;
  detail: string;
  conditions?: string;
  relatedLinks?: { text: string; href: string }[];
}

// ------------------------------------
// 費用情報
// ------------------------------------
export interface CostInfo {
  factors: string[];           // 費用を左右する条件
  included: string[];          // 基本料金に含まれやすい項目
  extra: string[];             // 追加費用が発生しやすい条件
  checkItems: string[];        // 見積もり時に確認する項目
}

// ------------------------------------
// 依頼の流れ
// ------------------------------------
export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

// ------------------------------------
// 絞り込みオプション
// ------------------------------------
export interface FilterOption {
  id: string;
  label: string;
  field: string;
  value: string;
}

// ------------------------------------
// 市場定義
// ------------------------------------
export interface Market {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: MarketCategory;
  h1: string;
  catchCopy: string;
  subCopy: string;
  description: string;
  targetUsers: string[];
  targetRegion: string;
  comparisonItems: string[];
  problems: {
    title: string;
    description: string;
  }[];
  selectionConclusion: {
    summary: string;
    reasons: string[];
    checkItems: string[];
    cautions: string[];
  };
  filterOptions: FilterOption[];
  processSteps: ProcessStep[];
  costInfo: CostInfo;
  faqs: FAQ[];
  status: PublishStatus;
  checkedDate: string;
  companyCount: number;
  /** 掲載企業の並び順。'completeness'＝公式サイトで確認できた比較項目の数が多い順（同数は社名のよみ順）。未指定は定義順 */
  companyOrder?: 'completeness';
}

// ------------------------------------
// 地域情報
// ------------------------------------
export interface RegionInfo {
  headquarters: string;         // 本社所在地
  branches: string[];           // 関西拠点
  prefectures: string[];        // 対応府県
  cities?: string[];            // 対応市区町村（任意）
  wideAreaKansai: boolean;      // 関西広域対応
  travelFee?: string;           // 出張費
  remoteConditions?: string;    // 遠方対応条件
}

// ------------------------------------
// 情報源
// ------------------------------------
export interface Source {
  label: string;
  url: string;
  checkedDate: string;
}

// ------------------------------------
// 公式サイトに掲載されている参考価格
// ------------------------------------
export interface PriceReference {
  label: string;        // プラン・用途・事例名
  price: string;        // 公式サイトの記載どおりの金額表記
  condition?: string;   // 広さ・遮音性能・想定用途など
  note?: string;        // 税込／税別・含まれない費用などの注記
  sourceUrl: string;    // 金額を確認した公式サイトのURL
  checkedDate: string;  // 確認日（YYYY-MM-DD）
}

// ------------------------------------
// 企業定義
// ------------------------------------
export interface Company {
  id: string;
  slug: string;
  marketId: string;
  name: string;
  nameKana?: string;            // 並び順の同点処理に使う社名のよみ（株式会社等を除く、ひらがな）
  listingType: ListingType;
  status: PublishStatus;
  region: RegionInfo;
  overview: string;
  features: string[];
  comparisonData: Record<string, InfoStatus | string>;
  services: string[];
  priceInfo?: string;
  priceReferences?: PriceReference[];
  warrantyInfo?: string;
  trackRecord?: string;
  officialUrl: string;
  sources: Source[];
}

// ------------------------------------
// 比較テーブル列定義
// ------------------------------------
export interface ComparisonColumn {
  key: string;
  label: string;
  description?: string;
}

// ------------------------------------
// SEO設定
// ------------------------------------
export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
}

// ------------------------------------
// クリック計測パラメータ
// ------------------------------------
export interface TrackingParams {
  marketId: string;
  companyId: string;
  pageType: 'market' | 'companies' | 'company' | 'compare' | 'cost' | 'guide' | 'faq' | 'top';
  placement: 'hero' | 'card' | 'detail' | 'comparison' | 'sidebar';
  listingType: ListingType;
}
