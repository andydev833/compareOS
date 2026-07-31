/**
 * 業務用エアコン市場 - DEMO企業データ
 * すべてDEMOデータです。実在企業ではありません。
 */

import type { Company } from '../types.js';

export const airconCompanies: Company[] = [
  {
    id: 'demo-aircon-001',
    slug: 'demo-aircon-service',
    marketId: 'commercial-aircon',
    name: 'デモ空調サービス株式会社',
    listingType: 'demo',
    status: 'published',
    region: {
      headquarters: '大阪府大阪市中央区（※架空の住所）',
      branches: ['大阪府北区', '大阪府南区'],
      prefectures: ['大阪府', '兵庫県', '京都府'],
      wideAreaKansai: true,
      travelFee: '公式サイトで確認できず',
    },
    overview: 'DEMOデータです。実在企業ではありません。業務用エアコンの新設・交換・修理・定期保守に対応するという設定の架空企業です。',
    features: [
      '緊急対応に関する記載を公式サイトで確認',
      '大阪府内・関西圏への対応が記載されている',
      '保守契約に関する記載を公式サイトで確認',
    ],
    comparisonData: {
      '新設・交換・修理': '対応',
      '緊急対応': '対応',
      '対応施設': '店舗・オフィス・工場（公開情報の範囲で記載）',
      '対応メーカー': '公式サイトで確認できず',
      '工事範囲': '公開情報の範囲で記載',
      '現地調査': '対応',
      '保守契約': '対応',
      '対応地域': '大阪府・兵庫県・京都府（公開情報の範囲で記載）',
    },
    services: ['業務用エアコン新設', '業務用エアコン交換', '修理・故障対応', '定期保守', '現地調査・見積もり'],
    priceInfo: '公式サイトで確認できず',
    warrantyInfo: '公式サイトで確認できず',
    trackRecord: '公式サイトで確認できず',
    officialUrl: 'https://example.com/demo-aircon-service',
    sources: [
      {
        label: '公式サイト（架空）',
        url: 'https://example.com/demo-aircon-service',
        checkedDate: '2025-01-01',
      },
    ],
  },
  {
    id: 'demo-aircon-002',
    slug: 'sample-setsubi-kogyo',
    marketId: 'commercial-aircon',
    name: 'サンプル設備工業株式会社',
    listingType: 'demo',
    status: 'published',
    region: {
      headquarters: '大阪府堺市（※架空の住所）',
      branches: ['大阪府南部エリア'],
      prefectures: ['大阪府', '奈良県', '和歌山県'],
      wideAreaKansai: false,
      travelFee: '公式サイトで確認できず',
    },
    overview: 'DEMOデータです。実在企業ではありません。主に大阪南部・奈良・和歌山エリアで業務用空調工事を行うという設定の架空企業です。',
    features: [
      '大阪南部エリアへの対応が記載されている',
      '工場・倉庫対応に関する記載を公式サイトで確認',
      '現地調査・見積もりに関する記載を公式サイトで確認',
    ],
    comparisonData: {
      '新設・交換・修理': '対応',
      '緊急対応': '公式サイトで確認できず',
      '対応施設': '工場・倉庫・店舗（公開情報の範囲で記載）',
      '対応メーカー': '公式サイトで確認できず',
      '工事範囲': '公開情報の範囲で記載',
      '現地調査': '対応',
      '保守契約': '公式サイトで確認できず',
      '対応地域': '大阪府・奈良県・和歌山県（公開情報の範囲で記載）',
    },
    services: ['業務用エアコン新設', '業務用エアコン交換', '修理・故障対応', '現地調査・見積もり'],
    priceInfo: '公式サイトで確認できず',
    warrantyInfo: '公式サイトで確認できず',
    trackRecord: '公式サイトで確認できず',
    officialUrl: 'https://example.com/sample-setsubi-kogyo',
    sources: [
      {
        label: '公式サイト（架空）',
        url: 'https://example.com/sample-setsubi-kogyo',
        checkedDate: '2025-01-01',
      },
    ],
  },
  {
    id: 'demo-aircon-003',
    slug: 'test-hojin-support',
    marketId: 'commercial-aircon',
    name: 'テスト法人サポート株式会社',
    listingType: 'pr',
    status: 'published',
    region: {
      headquarters: '大阪府大阪市北区（※架空の住所）',
      branches: ['大阪府全域', '兵庫県'],
      prefectures: ['大阪府', '兵庫県', '京都府', '奈良県', '滋賀県', '和歌山県'],
      wideAreaKansai: true,
      travelFee: '公式サイトで確認できず',
    },
    overview: 'DEMOデータです。実在企業ではありません。関西圏全域で業務用エアコン工事・保守を行うという設定の架空企業です。このデータはPR掲載のデモです。',
    features: [
      '関西圏全域への対応が記載されている',
      '緊急対応・夜間対応に関する記載を公式サイトで確認',
      '複数メーカー対応に関する記載を公式サイトで確認',
    ],
    comparisonData: {
      '新設・交換・修理': '対応',
      '緊急対応': '対応',
      '対応施設': '店舗・オフィス・工場・医療施設（公開情報の範囲で記載）',
      '対応メーカー': '公開情報の範囲で記載',
      '工事範囲': '対応',
      '現地調査': '対応',
      '保守契約': '対応',
      '対応地域': '大阪府・兵庫県・京都府・奈良県・滋賀県・和歌山県（公開情報の範囲で記載）',
    },
    services: ['業務用エアコン新設', '業務用エアコン交換', '修理・故障対応', '緊急対応', '定期保守', '現地調査・見積もり'],
    priceInfo: '公式サイトで確認できず',
    warrantyInfo: '公式サイトで確認できず',
    trackRecord: '公式サイトで確認できず',
    officialUrl: 'https://example.com/test-hojin-support',
    sources: [
      {
        label: '公式サイト（架空）',
        url: 'https://example.com/test-hojin-support',
        checkedDate: '2025-01-01',
      },
    ],
  },
];
