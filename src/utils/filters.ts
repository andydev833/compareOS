/**
 * フィルタリング・並び替えユーティリティ
 */

import type { Company, FilterOption } from '../data/types.js';

/**
 * 企業リストをフィルタリングする
 */
export function filterCompanies(
  companies: Company[],
  activeFilters: string[],
  filterOptions: FilterOption[]
): Company[] {
  if (activeFilters.length === 0) return companies;

  return companies.filter((company) => {
    return activeFilters.every((filterId) => {
      const option = filterOptions.find((f) => f.id === filterId);
      if (!option) return true;

      const { field, value } = option;

      // 特殊フィールド処理
      if (field === 'prefectures') {
        return company.region.prefectures.includes(value);
      }
      if (field === 'wideAreaKansai') {
        return company.region.wideAreaKansai === (value === 'true');
      }

      // comparisonDataのネストフィールド
      if (field.startsWith('comparisonData.')) {
        const key = field.replace('comparisonData.', '');
        return company.comparisonData[key] === value;
      }

      return true;
    });
  });
}

/**
 * 企業リストを並び替える
 */
export function sortCompanies(
  companies: Company[],
  sortKey: 'default' | 'name' | 'match'
): Company[] {
  const sorted = [...companies];

  switch (sortKey) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    case 'match':
      // 「対応」の数が多い順
      return sorted.sort((a, b) => {
        const countA = Object.values(a.comparisonData).filter((v) => v === '対応').length;
        const countB = Object.values(b.comparisonData).filter((v) => v === '対応').length;
        return countB - countA;
      });
    case 'default':
    default:
      // PR掲載を後ろへ（広告と通常掲載を混在させない）
      return sorted.sort((a, b) => {
        if (a.listingType === 'pr' && b.listingType !== 'pr') return 1;
        if (a.listingType !== 'pr' && b.listingType === 'pr') return -1;
        return 0;
      });
  }
}

/**
 * 企業の対応状況ラベルを返す
 */
export function getInfoStatusClass(status: string): string {
  switch (status) {
    case '対応':
      return 'status-ok';
    case '非対応':
      return 'status-ng';
    case '要問い合わせ':
      return 'status-inquiry';
    case '公式サイトで確認できず':
    case '公開情報の範囲で記載':
      return 'status-unknown';
    default:
      return 'status-text';
  }
}
